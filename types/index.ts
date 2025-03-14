export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date | string | number
}

export type ChatSession = {
  id: string
  messages: Message[]
  createdAt: Date | string
  updatedAt: Date | string
}

export type ApiResponse = {
  response: string
  error?: string
}

export type ApiError = {
  error: string
  status: number
}

