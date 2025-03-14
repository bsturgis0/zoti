import { createHash } from "crypto"
import pdfParse from "pdf-parse"
import { getRedisClient, redisRetry, REDIS_KEYS, redisKey } from "./redis"

// Type definitions
export interface PDFDocument {
  id: string
  filename: string
  totalPages: number
  uploadedAt: Date
}

export interface PDFPage {
  pageNumber: number
  text: string
}

/**
 * Process a PDF file and extract text from each page
 */
export async function processPDF(file: Buffer, filename: string): Promise<PDFDocument> {
  try {
    console.log(`Starting to process PDF: ${filename}`)
    const redis = getRedisClient()

    // Generate a unique ID for the PDF
    const id = createHash("md5")
      .update(filename + Date.now())
      .digest("hex")

    // Parse the PDF using pdf-parse
    const pdfData = await pdfParse(file, {
      // Setting max to 0 to parse all pages
      max: 0,
    })

    console.log(`PDF parsed successfully. Total pages: ${pdfData.numpages}`)

    // Extract text content
    const fullText = pdfData.text

    // Create the PDF document object
    const pdfDocument: PDFDocument = {
      id,
      filename,
      totalPages: pdfData.numpages,
      uploadedAt: new Date(),
    }

    // Store the PDF document in Redis (30 days expiration)
    await redisRetry(() => redis.set(redisKey(REDIS_KEYS.PDF_DOCUMENT, id), pdfDocument, { ex: 2592000 }))

    // Split the text into pages
    if (pdfData.numpages <= 1) {
      const pageText = fullText.trim() || `Content from "${filename}". This page contains educational content.`

      // Store the page in Redis (30 days expiration)
      await redisRetry(() =>
        redis.set(redisKey(REDIS_KEYS.PDF_PAGE, `${id}:1`), { pageNumber: 1, text: pageText }, { ex: 2592000 }),
      )
    } else {
      // Attempt to split by page breaks
      const pageTexts = splitTextIntoPages(fullText, pdfData.numpages)

      // Store each page in Redis
      for (let i = 0; i < pageTexts.length; i++) {
        const pageNumber = i + 1
        const pageText = pageTexts[i].trim() || `Content from page ${pageNumber} of "${filename}".`

        await redisRetry(() =>
          redis.set(
            redisKey(REDIS_KEYS.PDF_PAGE, `${id}:${pageNumber}`),
            { pageNumber, text: pageText },
            { ex: 2592000 },
          ),
        )
      }
    }

    console.log(`PDF processed successfully: ${filename} with ${pdfDocument.totalPages} pages`)
    return pdfDocument
  } catch (error) {
    console.error("Error processing PDF:", error)

    // Create a fallback document with error information
    const id = createHash("md5")
      .update(filename + Date.now())
      .digest("hex")

    const errorDocument: PDFDocument = {
      id,
      filename,
      totalPages: 1,
      uploadedAt: new Date(),
    }

    const redis = getRedisClient()

    // Store the fallback document in Redis
    await redisRetry(() => redis.set(redisKey(REDIS_KEYS.PDF_DOCUMENT, id), errorDocument, { ex: 86400 }))

    // Store the error page
    await redisRetry(() =>
      redis.set(
        redisKey(REDIS_KEYS.PDF_PAGE, `${id}:1`),
        {
          pageNumber: 1,
          text: `This PDF could not be processed properly. It might be encrypted, damaged, or in an unsupported format. Filename: ${filename}`,
        },
        { ex: 86400 },
      ),
    )

    return errorDocument
  }
}

/**
 * Helper function to split text into pages
 * This is a simplified approach and might not work perfectly for all PDFs
 */
function splitTextIntoPages(text: string, numPages: number): string[] {
  // If the text is empty or we have only one page, return the text as is
  if (!text || numPages <= 1) {
    return [text]
  }

  // Try to find page breaks using common patterns
  const pageBreakPatterns = [
    /\f/g, // Form feed character
    /\n\s*\d+\s*\n/g, // Page numbers surrounded by newlines
    /\n\s*Page\s+\d+\s+of\s+\d+\s*\n/gi, // "Page X of Y" patterns
  ]

  let pageTexts: string[] = []

  // Try each pattern until we find one that gives us a reasonable number of pages
  for (const pattern of pageBreakPatterns) {
    const splits = text.split(pattern)

    // If we got a reasonable number of splits, use them
    if (splits.length >= numPages * 0.5 && splits.length <= numPages * 1.5) {
      pageTexts = splits
      break
    }
  }

  // If we couldn't find good page breaks, split the text evenly
  if (pageTexts.length === 0 || pageTexts.length === 1) {
    const avgCharsPerPage = Math.ceil(text.length / numPages)
    pageTexts = []

    for (let i = 0; i < numPages; i++) {
      const start = i * avgCharsPerPage
      const end = Math.min(start + avgCharsPerPage, text.length)
      pageTexts.push(text.substring(start, end))
    }
  }

  // Ensure we have exactly numPages pages
  if (pageTexts.length < numPages) {
    // Add empty pages if needed
    for (let i = pageTexts.length; i < numPages; i++) {
      pageTexts.push(`[Page ${i + 1} appears to be empty or contains only images/non-text content]`)
    }
  } else if (pageTexts.length > numPages) {
    // Combine extra pages into the last page
    const extraPages = pageTexts.splice(numPages - 1)
    pageTexts[numPages - 1] = extraPages.join("\n\n")
  }

  return pageTexts
}

/**
 * Get a PDF document by ID
 */
export async function getPDF(id: string): Promise<PDFDocument | null> {
  try {
    const redis = getRedisClient()
    return (await redisRetry(() => redis.get(redisKey(REDIS_KEYS.PDF_DOCUMENT, id)))) as PDFDocument | null
  } catch (error) {
    console.error(`Error getting PDF document ${id}:`, error)
    return null
  }
}

/**
 * Get a specific page from a PDF
 */
export async function getPDFPage(pdfId: string, pageNumber: number): Promise<PDFPage | null> {
  try {
    const redis = getRedisClient()
    return (await redisRetry(() =>
      redis.get(redisKey(REDIS_KEYS.PDF_PAGE, `${pdfId}:${pageNumber}`)),
    )) as PDFPage | null
  } catch (error) {
    console.error(`Error getting PDF page ${pdfId}:${pageNumber}:`, error)
    return null
  }
}

/**
 * List all available PDFs for a user
 */
export async function listPDFsForUser(userId: string): Promise<PDFDocument[]> {
  try {
    const redis = getRedisClient()
    // Get all keys matching the PDF document pattern
    const keys = (await redisRetry(() => redis.keys(`${REDIS_KEYS.PDF_DOCUMENT}*`))) as string[]

    if (!keys || keys.length === 0) {
      return []
    }

    // Get all PDF documents
    const pdfs = (await Promise.all(keys.map((key) => redisRetry(() => redis.get(key))))) as PDFDocument[]

    return pdfs.filter((pdf) => pdf !== null)
  } catch (error) {
    console.error(`Error listing PDFs for user ${userId}:`, error)
    return []
  }
}

/**
 * Delete a PDF document and all its pages
 */
export async function deletePDF(id: string): Promise<boolean> {
  try {
    const redis = getRedisClient()

    // Get the PDF document to check if it exists and get the total pages
    const pdf = await getPDF(id)
    if (!pdf) {
      return false
    }

    // Delete all pages
    const pageKeys = []
    for (let i = 1; i <= pdf.totalPages; i++) {
      pageKeys.push(redisKey(REDIS_KEYS.PDF_PAGE, `${id}:${i}`))
    }

    if (pageKeys.length > 0) {
      await redisRetry(() => redis.del(...pageKeys))
    }

    // Delete the document
    await redisRetry(() => redis.del(redisKey(REDIS_KEYS.PDF_DOCUMENT, id)))

    return true
  } catch (error) {
    console.error(`Error deleting PDF ${id}:`, error)
    return false
  }
}

