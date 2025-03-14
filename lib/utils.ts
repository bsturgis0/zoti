import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  try {
    // Ensure we have a valid Date object
    const validDate = date instanceof Date ? date : new Date(date)

    // Check if the date is valid
    if (isNaN(validDate.getTime())) {
      return "Invalid date"
    }

    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(validDate)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function saveChatHistory(messages: any[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("zoti-chat-history", JSON.stringify(messages))
  }
}

export function loadChatHistory(): any[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("zoti-chat-history")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("Failed to parse chat history:", e)
      }
    }
  }
  return []
}

