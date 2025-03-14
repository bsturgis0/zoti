/**
 * Utility function to search the web using Tavily API
 */
export async function searchWeb(
  query: string,
  options: {
    topic?: string
    searchDepth?: "basic" | "advanced"
    maxResults?: number
    timeRange?: string | null
    days?: number
    includeAnswer?: boolean
    includeRawContent?: boolean
    includeImages?: boolean
    includeImageDescriptions?: boolean
    includeDomains?: string[]
    excludeDomains?: string[]
  } = {},
) {
  try {
    const tavilyApiKey = process.env.TAVILY_API_KEY

    if (!tavilyApiKey) {
      console.warn("TAVILY_API_KEY is not defined in environment variables")
      return {
        results: [],
        answer: `I couldn't search the web because the Tavily API key is not configured. I'll try to answer based on my existing knowledge.`,
      }
    }

    console.log(`🔍 Searching the web for: "${query}"`)

    const defaultOptions = {
      topic: "general",
      searchDepth: "basic",
      maxResults: 3,
      timeRange: null,
      days: 7,
      includeAnswer: true,
      includeRawContent: false,
      includeImages: false,
      includeImageDescriptions: false,
      includeDomains: [],
      excludeDomains: [],
    }

    const mergedOptions = { ...defaultOptions, ...options }

    const requestBody = {
      query,
      topic: mergedOptions.topic,
      search_depth: mergedOptions.searchDepth,
      max_results: mergedOptions.maxResults,
      time_range: mergedOptions.timeRange,
      days: mergedOptions.days,
      include_answer: mergedOptions.includeAnswer,
      include_raw_content: mergedOptions.includeRawContent,
      include_images: mergedOptions.includeImages,
      include_image_descriptions: mergedOptions.includeImageDescriptions,
      include_domains: mergedOptions.includeDomains,
      exclude_domains: mergedOptions.excludeDomains,
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tavilyApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error(`Tavily API responded with status: ${response.status}`)
      return {
        results: [],
        answer: `I tried to search the web, but encountered an error. I'll answer based on my existing knowledge.`,
      }
    }

    const data = await response.json()
    console.log(`✅ Web search complete. Found ${data.results?.length || 0} results.`)
    return data
  } catch (error) {
    console.error("Error searching with Tavily:", error)
    return {
      results: [],
      answer: `I tried to search the web, but encountered an error. I'll answer based on my existing knowledge.`,
    }
  }
}

/**
 * Improved function to detect if a message requires web search
 */
export function needsWebSearch(message: string): boolean {
  // Keywords that suggest the user is asking for information that might require a web search
  const searchIndicators = [
    "search for",
    "look up",
    "find information",
    "search the web",
    "what is",
    "who is",
    "when did",
    "where is",
    "how to",
    "latest",
    "recent",
    "news about",
    "current",
    "explain",
    "define",
    "tell me about",
  ]

  // Don't search for very short queries or queries about the slides themselves
  if (
    message.length < 10 ||
    message.toLowerCase().includes("slide") ||
    message.toLowerCase().includes("pdf") ||
    message.toLowerCase().includes("document") ||
    message.toLowerCase().includes("page") ||
    message.toLowerCase().includes("next") ||
    message.toLowerCase().includes("previous")
  ) {
    return false
  }

  // Check if the message contains any search indicators
  return searchIndicators.some((indicator) => message.toLowerCase().includes(indicator.toLowerCase()))
}

