import { getRedisClient, redisRetry, REDIS_KEYS, redisKey } from "./redis"

// Type definitions
export interface UserState {
  pdfId: string | null
  pageNumber: number | null
}

/**
 * Set the active PDF for a user
 * @param userId - The user ID
 * @param pdfId - The PDF ID to set as active
 * @returns Promise<void>
 */
export async function setActivePDF(userId: string, pdfId: string): Promise<void> {
  const redis = getRedisClient()
  const key = redisKey(REDIS_KEYS.USER_SESSION, userId)

  // Get current state or initialize
  let state: UserState
  try {
    state = ((await redisRetry(() => redis.get(key))) as UserState) || {
      pdfId: null,
      pageNumber: null,
    }
  } catch (error) {
    console.error(`Error getting user session for ${userId}:`, error)
    state = {
      pdfId: null,
      pageNumber: null,
    }
  }

  // Update state
  state.pdfId = pdfId
  state.pageNumber = 1

  // Save to Redis with 24-hour expiration
  await redisRetry(() => redis.set(key, state, { ex: 86400 }))
}

/**
 * Get the active PDF state for a user and optionally update it
 * @param userId - The user ID
 * @param pdfId - Optional PDF ID to update
 * @param pageNumber - Optional page number to update
 * @returns Promise<UserState>
 */
export async function getActiveState(userId: string, pdfId?: string, pageNumber?: number): Promise<UserState> {
  const redis = getRedisClient()
  const key = redisKey(REDIS_KEYS.USER_SESSION, userId)

  // Get current state or initialize
  let state: UserState
  try {
    state = ((await redisRetry(() => redis.get(key))) as UserState) || {
      pdfId: null,
      pageNumber: null,
    }
  } catch (error) {
    console.error(`Error getting user session for ${userId}:`, error)
    state = {
      pdfId: null,
      pageNumber: null,
    }
  }

  // Update state if parameters are provided
  let updated = false

  if (pdfId !== undefined) {
    state.pdfId = pdfId
    updated = true
  }

  if (pageNumber !== undefined) {
    state.pageNumber = pageNumber
    updated = true
  }

  // Save to Redis if updated with 24-hour expiration
  if (updated) {
    await redisRetry(() => redis.set(key, state, { ex: 86400 }))
  }

  return state
}

/**
 * Clear the active PDF for a user
 * @param userId - The user ID
 * @returns Promise<void>
 */
export async function clearActivePDF(userId: string): Promise<void> {
  const redis = getRedisClient()
  const key = redisKey(REDIS_KEYS.USER_SESSION, userId)

  // Clear the active PDF
  const state: UserState = {
    pdfId: null,
    pageNumber: null,
  }

  // Save to Redis with 24-hour expiration
  await redisRetry(() => redis.set(key, state, { ex: 86400 }))
}

/**
 * Delete a user session
 * @param userId - The user ID
 * @returns Promise<void>
 */
export async function deleteUserSession(userId: string): Promise<void> {
  const redis = getRedisClient()
  const key = redisKey(REDIS_KEYS.USER_SESSION, userId)

  await redisRetry(() => redis.del(key))
}

/**
 * Set the current page number for a user
 * @param userId - The user ID
 * @param pageNumber - The page number to set
 * @returns Promise<void>
 */
export async function setCurrentPage(userId: string, pageNumber: number): Promise<void> {
  const redis = getRedisClient()
  const key = redisKey(REDIS_KEYS.USER_SESSION, userId)

  // Get current state or initialize
  let state: UserState
  try {
    state = ((await redisRetry(() => redis.get(key))) as UserState) || {
      pdfId: null,
      pageNumber: null,
    }
  } catch (error) {
    console.error(`Error getting user session for ${userId}:`, error)
    state = {
      pdfId: null,
      pageNumber: null,
    }
  }

  // Update page number
  state.pageNumber = pageNumber

  // Save to Redis with 24-hour expiration
  await redisRetry(() => redis.set(key, state, { ex: 86400 }))
}

