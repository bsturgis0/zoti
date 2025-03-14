"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, BookOpen, FileText, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Message } from "@/types"
import { generateId } from "@/lib/utils"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ChatHeader } from "@/components/chat-header"
import { ErrorBoundary } from "@/components/error-boundary"
import { TypingIndicator } from "@/components/typing-indicator"
import { PDFNavigation } from "@/components/pdf-navigation"
import { PDFNavigationHelper } from "@/components/pdf-navigation-helper"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, slideUp, scaleUp } from "@/lib/animation-utils"
import { getUserChatHistory, clearUserChatHistory, exportUserChatHistory } from "../actions/chat-actions"

export default function ChatPage() {
  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // PDF state
  const [activePdf, setActivePdf] = useState<{
    name: string
    currentPage: number
    totalPages: number
  } | null>(null)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Get user ID from cookie
  const getUserId = () => {
    // Try to get from cookie first
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
    const userIdCookie = cookies.find((cookie) => cookie.startsWith("userId="))

    if (userIdCookie) {
      return userIdCookie.split("=")[1]
    }

    // Fallback to session storage
    return window.sessionStorage.getItem("userId") || "anonymous-user"
  }

  // Load chat history from Redis on initial render
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsInitialLoading(true)
        const userId = getUserId()
        const { messages: chatMessages, activePdf: pdfInfo } = await getUserChatHistory(userId)

        if (chatMessages.length > 0) {
          setMessages(chatMessages)
        }

        if (pdfInfo) {
          setActivePdf(pdfInfo)
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
        setError("Failed to load chat history. Please refresh the page.")
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadChatHistory()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading, isSearching])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Handle sending a message
  const handleSendMessage = async (content: string, files: File[]) => {
    if ((!content.trim() && files.length === 0) || isLoading) return

    // Clear any previous errors
    setError(null)
    setUploadProgress(null)

    // Add user message to state
    let userContent = content

    // If there are files, add a note about them in the message
    if (files.length > 0) {
      const fileNames = files.map((file) => file.name).join(", ")
      userContent = `${content || "I've uploaded the following slides:"} [Files: ${fileNames}]`
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Check if the message might trigger a web search
    const mightSearch =
      content.length > 15 &&
      !content.toLowerCase().includes("page") &&
      !content.toLowerCase().includes("slide") &&
      !content.toLowerCase().includes("pdf") &&
      (content.includes("?") ||
        content.toLowerCase().includes("what") ||
        content.toLowerCase().includes("how") ||
        content.toLowerCase().includes("why") ||
        content.toLowerCase().includes("when") ||
        content.toLowerCase().includes("where") ||
        content.toLowerCase().includes("explain"))

    if (mightSearch) {
      setIsSearching(true)
      // Delay to show the searching indicator
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    try {
      // Create form data for API request
      const formData = new FormData()
      formData.append("messages", JSON.stringify([...messages, userMessage]))

      // Add files to form data if present
      files.forEach((file) => {
        formData.append("files", file)
      })

      // Track upload progress for files
      let xhr: XMLHttpRequest | null = null
      if (files.length > 0) {
        xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percentComplete)
          }
        }
        xhr.open("POST", "/api/chat")
        xhr.send(formData)
      }

      // Use standard fetch for the actual request
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      })

      // Cancel the XHR request if it's still in progress
      if (xhr) {
        xhr.abort()
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      let data
      try {
        data = await response.json()
      } catch (error) {
        console.error("Error parsing response JSON:", error)
        throw new Error("Failed to parse server response")
      }

      if (data.error) {
        throw new Error(data.error)
      }

      // Add assistant message to state
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ])

      // Update PDF information if present in the response
      const pdfMatch = data.response.match(/\[PDF: (.+?) - Page (\d+) of (\d+)\]/)
      if (pdfMatch) {
        setActivePdf({
          name: pdfMatch[1],
          currentPage: Number.parseInt(pdfMatch[2]),
          totalPages: Number.parseInt(pdfMatch[3]),
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("There was an error processing your request. Please try again later.")
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please try again later.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
      setUploadProgress(null)
    }
  }

  // Handle PDF navigation
  const handlePdfNavigation = (action: "prev" | "next" | "goto", page?: number) => {
    if (!activePdf) return

    let message = ""

    if (action === "prev") {
      message = "Please go to the previous page."
    } else if (action === "next") {
      message = "Please go to the next page."
    } else if (action === "goto" && page) {
      message = `Please go to page ${page}.`
    }

    handleSendMessage(message, [])
  }

  // Clear chat history
  const handleClearChat = async () => {
    try {
      const userId = getUserId()
      const success = await clearUserChatHistory(userId)

      if (success) {
        // Reload chat history
        const { messages: chatMessages } = await getUserChatHistory(userId)
        setMessages(chatMessages)
        setActivePdf(null)
      } else {
        setError("Failed to clear chat history. Please try again.")
      }
    } catch (error) {
      console.error("Error clearing chat history:", error)
      setError("Failed to clear chat history. Please try again.")
    }
  }

  // Export chat as text file
  const handleExportChat = async () => {
    try {
      const userId = getUserId()
      const chatText = await exportUserChatHistory(userId)

      const blob = new Blob([chatText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zoti-chat-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting chat:", error)
      setError("Failed to export chat. Please try again.")
    }
  }

  return (
    <motion.div
      className="container mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-6 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div className="max-w-4xl mx-auto" variants={slideUp}>
        <motion.div className="mb-8 sm:mb-10 md:mb-12" variants={scaleUp}>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-primary">
            Zoti School Slides Teacher
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Upload your slides and start learning with step-by-step guidance.
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <ErrorBoundary>
          <motion.div variants={scaleUp}>
            <Card className="w-full min-h-[75vh] flex flex-col shadow-md border relative overflow-hidden">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 opacity-5 pointer-events-none"
                initial={{ backgroundPosition: "0% 0%" }}
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.3), transparent 70%)",
                  backgroundSize: "200% 200%",
                }}
              />

              <ChatHeader
                title="Interactive Learning Session"
                onClearChat={messages.length > 0 ? handleClearChat : undefined}
                onExportChat={messages.length > 1 ? handleExportChat : undefined}
                infoText="Upload your educational slides and ask questions. Zoti will guide you through the content step by step, explaining complex concepts and testing your understanding."
              />

              {activePdf && (
                <div className="px-4 py-2 border-b">
                  <PDFNavigation
                    currentPage={activePdf.currentPage}
                    totalPages={activePdf.totalPages}
                    pdfName={activePdf.name}
                    onPrevious={() => handlePdfNavigation("prev")}
                    onNext={() => handlePdfNavigation("next")}
                    onGoToPage={(page) => handlePdfNavigation("goto", page)}
                  />
                </div>
              )}

              <CardContent ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                {isInitialLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <p className="mt-4 text-muted-foreground">Loading your chat history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-full text-center space-y-8 p-6"
                    variants={scaleUp}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <BookOpen size={32} className="text-primary" />
                    </motion.div>
                    <div className="max-w-md space-y-4">
                      <motion.p
                        className="text-2xl font-medium font-heading text-primary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Start your learning journey
                      </motion.p>
                      <motion.p
                        className="text-base text-muted-foreground"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Upload your educational slides and ask questions. I'll guide you through the content step by
                        step.
                      </motion.p>
                      <motion.div
                        className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <motion.div
                          className="flex items-center justify-center w-full sm:w-auto bg-muted/50 rounded-lg p-4 text-sm"
                          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(var(--primary), 0.3)" }}
                        >
                          <FileText className="h-5 w-5 mr-3 text-primary" />
                          <span>Upload PDF slides to get started</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                    {isSearching && (
                      <motion.div
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
                          <Search size={16} />
                        </div>
                        <div className="flex flex-col max-w-[85%]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">Zoti Teacher</span>
                          </div>
                          <div className="rounded-lg rounded-tl-none bg-card text-foreground px-4 py-3 text-sm border shadow-sm">
                            <div className="flex items-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                className="mr-2"
                              >
                                <Search size={14} className="text-primary" />
                              </motion.div>
                              <span>Searching the web for relevant information...</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {isLoading && !isSearching && <TypingIndicator />}

                    {activePdf && !isLoading && (
                      <div className="mt-4">
                        <PDFNavigationHelper
                          onNavigate={(action) => {
                            if (action === "next") {
                              handlePdfNavigation("next")
                            } else if (action === "previous") {
                              handlePdfNavigation("prev")
                            }
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading || isInitialLoading}
                disabled={Boolean(error) || isInitialLoading}
                placeholder="Ask about your slides or upload a PDF..."
                uploadProgress={uploadProgress}
              />
            </Card>
          </motion.div>
        </ErrorBoundary>
      </motion.div>
    </motion.div>
  )
}

