import { getRedisClient, redisRetry, REDIS_KEYS, redisKey } from "./redis"
import type { Message } from "@/types"
import { generateId } from "./utils"

/**
 * Save a message to Redis
 */
export async function saveMessage(userId: string, message: Message): Promise<void> {
  try {
    const redis = getRedisClient()
    const messageKey = redisKey(REDIS_KEYS.CHAT_MESSAGE, `${userId}:${message.id}`)

    // Store the message with 30-day expiration
    await redisRetry(() => redis.set(messageKey, message, { ex: 2592000 }))

    // Add message ID to the user's chat history list
    const historyKey = redisKey(REDIS_KEYS.CHAT_HISTORY, userId)
    await redisRetry(() => redis.lpush(historyKey, message.id))

    // Set 30-day expiration on the history list if it's new
    await redisRetry(() => redis.expire(historyKey, 2592000))
  } catch (error) {
    console.error(`Error saving message for user ${userId}:`, error)
    throw new Error("Failed to save message")
  }
}

/**
 * Get chat history for a user
 */
export async function getChatHistory(userId: string, limit = 100): Promise<Message[]> {
  try {
    const redis = getRedisClient()
    const historyKey = redisKey(REDIS_KEYS.CHAT_HISTORY, userId)

    // Get message IDs from the user's chat history list (most recent first)
    const messageIds = (await redisRetry(() => redis.lrange(historyKey, 0, limit - 1))) as string[]

    if (!messageIds || messageIds.length === 0) {
      return []
    }

    // Get all messages
    const messages = (await Promise.all(
      messageIds.map((id) => redisRetry(() => redis.get(redisKey(REDIS_KEYS.CHAT_MESSAGE, `${userId}:${id}`)))),
    )) as (Message | null)[]

    // Filter out null messages and sort by timestamp
    return messages
      .filter((msg): msg is Message => msg !== null)
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return timeA - timeB
      })
  } catch (error) {
    console.error(`Error getting chat history for user ${userId}:`, error)
    return []
  }
}

/**
 * Clear chat history for a user
 */
export async function clearChatHistory(userId: string): Promise<void> {
  try {
    const redis = getRedisClient()
    const historyKey = redisKey(REDIS_KEYS.CHAT_HISTORY, userId)

    // Get all message IDs
    const messageIds = (await redisRetry(() => redis.lrange(historyKey, 0, -1))) as string[]

    if (messageIds && messageIds.length > 0) {
      // Delete all messages
      await Promise.all(
        messageIds.map((id) => redisRetry(() => redis.del(redisKey(REDIS_KEYS.CHAT_MESSAGE, `${userId}:${id}`)))),
      )
    }

    // Delete the history list
    await redisRetry(() => redis.del(historyKey))
  } catch (error) {
    console.error(`Error clearing chat history for user ${userId}:`, error)
    throw new Error("Failed to clear chat history")
  }
}

/**
 * Add welcome message to chat history
 */
export async function addWelcomeMessage(userId: string): Promise<Message> {
  const welcomeMessage: Message = {
    id: generateId(),
    role: "assistant",
    content:
      "# Welcome to Zoti School Slides Teacher\n\nI'm here to help you learn from your educational materials. You can:\n\n- **Upload PDF slides** using the paperclip button\n- **Ask questions** about the content\n- **Request explanations** of complex concepts\n\nLet's start learning together! What would you like to explore today?",
    timestamp: new Date(),
  }

  await saveMessage(userId, welcomeMessage)
  return welcomeMessage
}

/**
 * Export chat history as text
 */
export async function exportChatHistory(userId: string): Promise<string> {
  try {
    const messages = await getChatHistory(userId)

    if (messages.length === 0) {
      return "No chat history found."
    }

    return messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : "Zoti"
        const time = new Date(msg.timestamp).toLocaleString()
        return `${role} (${time}):\n${msg.content}\n\n`
      })
      .join("---\n\n")
  } catch (error) {
    console.error(`Error exporting chat history for user ${userId}:`, error)
    return "Failed to export chat history."
  }
}

