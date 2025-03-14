import { type NextRequest, NextResponse } from "next/server"
import { createGeminiChatModel, formatChatHistoryForGemini } from "@/lib/gemini"
import { searchWeb, needsWebSearch } from "@/lib/tavily"
import { processPDF } from "@/lib/pdf-utils"
import { setActivePDF, getActiveState } from "@/lib/session-manager"
import { getCurrentPage, goToNextPage, goToPreviousPage, goToPage } from "@/lib/pdf-tools"
import { saveMessage, getChatHistory } from "@/lib/chat-service"
import { generateId } from "@/lib/utils"
import type { ApiResponse, Message } from "@/types"

// Allow streaming responses up to 60 seconds
export const maxDuration = 60

// Rate limiting variables
const RATE_LIMIT = 10
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const requestLog: Record<string, number[]> = {}

/**
 * Rate limiting middleware
 * @param ip - The IP address to check
 * @returns Whether the request should be rate limited
 */
function shouldRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Initialize or clean up old requests
  if (!requestLog[ip]) {
    requestLog[ip] = []
  } else {
    requestLog[ip] = requestLog[ip].filter((timestamp) => timestamp > windowStart)
  }

  // Check if rate limit exceeded
  if (requestLog[ip].length >= RATE_LIMIT) {
    return true
  }

  // Log this request
  requestLog[ip].push(now)
  return false
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0

  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (retries >= maxRetries) {
        throw error
      }

      const delay = initialDelay * Math.pow(2, retries)
      console.log(`API error, retrying in ${delay}ms (attempt ${retries + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      retries++
    }
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get client IP for rate limiting and use as user ID
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const userId = req.cookies.get("userId")?.value || ip // Use cookie userId if available, fallback to IP

    // Check rate limit
    if (shouldRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Parse the form data
    let formData
    try {
      formData = await req.formData()
    } catch (error) {
      console.error("Error parsing form data:", error)
      return NextResponse.json({
        response: "There was an error processing your request. Please try again.",
      })
    }

    const messagesJson = formData.get("messages")
    const files = formData.getAll("files").filter((file) => file instanceof File) as File[]

    if (!messagesJson || typeof messagesJson !== "string") {
      return NextResponse.json({
        response: "No messages provided. Please try again with a valid message.",
      })
    }

    // Parse the messages
    let messages
    try {
      messages = JSON.parse(messagesJson) as Message[]
    } catch (error) {
      console.error("Error parsing messages JSON:", error)
      return NextResponse.json({
        response: "There was an error processing your message data. Please try again.",
      })
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()

    if (!lastUserMessage) {
      return NextResponse.json({
        response: "No user message found. Please provide a message to continue.",
      })
    }

    // Process any uploaded PDF files
    if (files.length > 0) {
      try {
        for (const file of files) {
          if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
            console.log(`Processing PDF file: ${file.name}, size: ${file.size} bytes`)

            // Convert File to Buffer
            const fileBuffer = Buffer.from(await file.arrayBuffer())

            // Process the PDF
            const pdfDocument = await processPDF(fileBuffer, file.name)

            // Set this as the active PDF for the user
            await setActivePDF(userId, pdfDocument.id)

            console.log(`Processed PDF: ${file.name} with ${pdfDocument.totalPages} pages`)
          }
        }
      } catch (error) {
        console.error("Error processing PDF files:", error)
        return NextResponse.json({
          response: "I had trouble processing your PDF file. Could you try uploading it again or try a different file?",
        })
      }
    }

    const userMessage = lastUserMessage.content || "Hello"
    let webSearchPerformed = false
    let enhancedUserMessage = userMessage

    // Check if we should perform a web search
    if (needsWebSearch(userMessage) && process.env.TAVILY_API_KEY) {
      try {
        console.log("🌐 Performing web search for:", userMessage)
        const searchResults = await searchWeb(userMessage, {
          searchDepth: "basic",
          maxResults: 3,
        })

        if (searchResults.results && searchResults.results.length > 0) {
          webSearchPerformed = true

          // Enhance the message with search results
          enhancedUserMessage = `${userMessage}\n\n[SEARCH RESULTS] I've searched the web for information related to your question. Here's what I found:\n\n`

          if (searchResults.answer) {
            enhancedUserMessage += `Summary: ${searchResults.answer}\n\n`
          }

          enhancedUserMessage += "Sources:\n"
          searchResults.results.forEach((result: any, index: number) => {
            enhancedUserMessage += `${index + 1}. "${result.title}" - ${result.url}\n${result.content.substring(0, 300)}...\n\n`
          })

          console.log("✅ Enhanced message with web search results")
        }
      } catch (error) {
        console.error("Error performing web search:", error)
        // Continue without search results if there's an error
      }
    }

    try {
      // Check if the Gemini API key is available
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({
          response:
            "I'm sorry, but I'm not able to process your request at the moment. The AI service is not properly configured. Please try again later or contact support.",
        })
      }

      // Create a new Gemini model instance
      const model = createGeminiChatModel()

      // Get previous chat history from Redis
      const chatHistory = await getChatHistory(userId)

      // Format chat history for Gemini
      const formattedHistory = formatChatHistoryForGemini(chatHistory)

      // Create a new chat session with history
      const chat = model.startChat({
        history: formattedHistory,
      })

      // Check if the user is asking to navigate PDF pages
      const activeState = await getActiveState(userId)
      const { pdfId, pageNumber } = activeState
      let pdfNavigationPerformed = false
      let pdfContent = ""

      // Check for navigation commands in the user message
      const goToNextPageRegex = /go to (the )?next page|next page|show next page/i
      const goToPrevPageRegex = /go to (the )?previous page|previous page|show previous page|go back/i
      const goToPageRegex = /go to page (\d+)|show page (\d+)|page (\d+)/i

      if (pdfId) {
        if (goToNextPageRegex.test(userMessage)) {
          pdfContent = await goToNextPage(userId)
          pdfNavigationPerformed = true
        } else if (goToPrevPageRegex.test(userMessage)) {
          pdfContent = await goToPreviousPage(userId)
          pdfNavigationPerformed = true
        } else {
          const pageMatch = userMessage.match(goToPageRegex)
          if (pageMatch) {
            const requestedPage = Number.parseInt(pageMatch[1] || pageMatch[2] || pageMatch[3])
            pdfContent = await goToPage(userId, requestedPage)
            pdfNavigationPerformed = true
          }
        }
      }

      // If no PDF navigation was performed but a PDF is active, include the current page content
      if (!pdfNavigationPerformed && pdfId && !pdfContent) {
        try {
          pdfContent = await getCurrentPage(userId)
        } catch (error) {
          console.error("Error getting current page:", error)
        }
      }

      // Save user message to Redis
      const userMessageToSave: Message = {
        id: lastUserMessage.id || generateId(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      }
      await saveMessage(userId, userMessageToSave)

      // If files were uploaded, automatically get the first page content
      let result
      try {
        if (
          files.length > 0 &&
          files.some((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
        ) {
          // Get the first page content
          pdfContent = await getCurrentPage(userId)

          // Send a system message with the page content
          result = await retryWithBackoff(async () => {
            return await chat.sendMessage({
              role: "user",
              parts: [
                {
                  text: `I've loaded the PDF you uploaded. Here's the content of the first page:\n\n${pdfContent}\n\nI'll help you understand this content. Let me know if you want to navigate to other pages.`,
                },
              ],
            })
          })
        } else if (pdfNavigationPerformed || pdfContent) {
          // If PDF navigation was performed or we have PDF content, send it to the AI
          result = await retryWithBackoff(async () => {
            return await chat.sendMessage({
              role: "user",
              parts: [{ text: `${userMessage}\n\n${pdfContent}` }],
            })
          })
        } else {
          // Just send the user message normally
          result = await retryWithBackoff(async () => {
            return await chat.sendMessage({
              role: "user",
              parts: [{ text: webSearchPerformed ? enhancedUserMessage : userMessage }],
            })
          })
        }
      } catch (error) {
        console.error("Error sending message to Gemini:", error)
        return NextResponse.json({
          response:
            "I'm having trouble processing your request right now. Please try again with a simpler question or try again later.",
        })
      }

      if (!result || !result.response) {
        return NextResponse.json({
          response: "I apologize, but I couldn't generate a response. Please try asking your question differently.",
        })
      }

      let responseText = result.response.text()

      // Add a note if web search was performed
      if (webSearchPerformed) {
        responseText = `${responseText}\n\n_I've searched the web to provide you with the most up-to-date information on this topic._`
      }

      // Add a note if PDF navigation was performed
      if (pdfNavigationPerformed) {
        responseText = `${responseText}\n\n_You can navigate through the PDF by saying "next page", "previous page", or "go to page X"._`
      }

      // Save assistant message to Redis
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }
      await saveMessage(userId, assistantMessage)

      return NextResponse.json({ response: responseText })
    } catch (apiError: any) {
      console.error("All API attempts failed:", apiError)

      // Provide a more detailed error message for debugging
      const errorMessage = apiError.message || "Unknown error"
      console.error("Error details:", errorMessage)

      // Provide a graceful fallback response
      return NextResponse.json({
        response:
          "I'm currently experiencing technical difficulties and couldn't process your request. Please try again in a few moments, or ask a different question.",
      })
    }
  } catch (error: any) {
    console.error("Error in chat API:", error)

    // Provide a graceful fallback response
    return NextResponse.json({
      response: "I encountered an unexpected error processing your request. Please try again later.",
    })
  }
}

