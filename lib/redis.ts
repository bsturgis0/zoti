import { Redis } from "@upstash/redis"

// Check if Redis URL and token are available
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error("Redis credentials are not defined in environment variables")
}

// Initialize Redis client
let redis: Redis | null = null

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  })
} catch (error) {
  console.error("Error initializing Redis client:", error)
}

/**
 * Get Redis client with error handling
 */
export function getRedisClient(): Redis {
  if (!redis) {
    throw new Error("Redis client is not initialized")
  }
  return redis
}

/**
 * Retry function for Redis operations
 */
export async function redisRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 300): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`Redis operation failed (attempt ${attempt + 1}/${maxRetries}):`, error)

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError || new Error("Redis operation failed after retries")
}

/**
 * Redis key prefixes for different data types
 */
export const REDIS_KEYS = {
  PDF_DOCUMENT: "pdf:document:",
  PDF_PAGE: "pdf:page:",
  USER_SESSION: "user:session:",
  CHAT_HISTORY: "chat:history:",
  CHAT_MESSAGE: "chat:message:",
}

/**
 * Generate a Redis key with prefix
 */
export function redisKey(prefix: string, id: string): string {
  return `${prefix}${id}`
}

