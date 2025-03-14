"use server"

import { getChatHistory, clearChatHistory, addWelcomeMessage, exportChatHistory } from "@/lib/chat-service"
import { getActiveState } from "@/lib/session-manager"
import type { Message } from "@/types"

/**
 * Get chat history for a user
 */
export async function getUserChatHistory(userId: string): Promise<{
  messages: Message[]
  activePdf: { name: string; currentPage: number; totalPages: number } | null
}> {
  try {
    // Get chat history
    const messages = await getChatHistory(userId)

    // Check if we need to add a welcome message
    if (messages.length === 0) {
      const welcomeMessage = await addWelcomeMessage(userId)
      messages.push(welcomeMessage)
    }

    // Get active PDF information
    const { pdfId, pageNumber } = await getActiveState(userId)
    let activePdf = null

    if (pdfId) {
      // Look for PDF information in assistant messages
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i]
        if (message.role === "assistant") {
          const pdfMatch = message.content.match(/\[PDF: (.+?) - Page (\d+) of (\d+)\]/)
          if (pdfMatch) {
            activePdf = {
              name: pdfMatch[1],
              currentPage: Number.parseInt(pdfMatch[2]),
              totalPages: Number.parseInt(pdfMatch[3]),
            }
            break
          }
        }
      }
    }

    return { messages, activePdf }
  } catch (error) {
    console.error("Error getting user chat history:", error)
    return { messages: [], activePdf: null }
  }
}

/**
 * Clear chat history for a user
 */
export async function clearUserChatHistory(userId: string): Promise<boolean> {
  try {
    await clearChatHistory(userId)
    await addWelcomeMessage(userId)
    return true
  } catch (error) {
    console.error("Error clearing user chat history:", error)
    return false
  }
}

/**
 * Export chat history for a user
 */
export async function exportUserChatHistory(userId: string): Promise<string> {
  try {
    return await exportChatHistory(userId)
  } catch (error) {
    console.error("Error exporting user chat history:", error)
    return "Failed to export chat history."
  }
}

