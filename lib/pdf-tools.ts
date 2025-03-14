import { getPDF, getPDFPage } from "./pdf-utils"
import { getActiveState, setCurrentPage } from "./session-manager"

/**
 * Tool to get the current page content
 */
export async function getCurrentPage(userId: string): Promise<string> {
  const { pdfId, pageNumber } = await getActiveState(userId)

  if (!pdfId) {
    return "No PDF is currently active. Please upload a PDF file first."
  }

  const pdf = await getPDF(pdfId)
  if (!pdf) {
    return "The active PDF could not be found. It may have been removed."
  }

  const page = await getPDFPage(pdfId, pageNumber || 1)
  if (!page) {
    return `Page ${pageNumber} could not be found in the PDF "${pdf.filename}".`
  }

  return `[PDF: ${pdf.filename} - Page ${pageNumber} of ${pdf.totalPages}]\n\n${page.text}`
}

/**
 * Tool to navigate to the next page
 */
export async function goToNextPage(userId: string): Promise<string> {
  const { pdfId, pageNumber } = await getActiveState(userId)

  if (!pdfId) {
    return "No PDF is currently active. Please upload a PDF file first."
  }

  const pdf = await getPDF(pdfId)
  if (!pdf) {
    return "The active PDF could not be found. It may have been removed."
  }

  const currentPage = pageNumber || 1
  if (currentPage >= pdf.totalPages) {
    return `Already at the last page (${currentPage} of ${pdf.totalPages}) of "${pdf.filename}".`
  }

  const nextPage = currentPage + 1
  await setCurrentPage(userId, nextPage)

  const page = await getPDFPage(pdfId, nextPage)
  if (!page) {
    return `Failed to load page ${nextPage} of "${pdf.filename}".`
  }

  return `[PDF: ${pdf.filename} - Page ${nextPage} of ${pdf.totalPages}]\n\n${page.text}`
}

/**
 * Tool to navigate to the previous page
 */
export async function goToPreviousPage(userId: string): Promise<string> {
  const { pdfId, pageNumber } = await getActiveState(userId)

  if (!pdfId) {
    return "No PDF is currently active. Please upload a PDF file first."
  }

  const pdf = await getPDF(pdfId)
  if (!pdf) {
    return "The active PDF could not be found. It may have been removed."
  }

  const currentPage = pageNumber || 1
  if (currentPage <= 1) {
    return `Already at the first page of "${pdf.filename}".`
  }

  const prevPage = currentPage - 1
  await setCurrentPage(userId, prevPage)

  const page = await getPDFPage(pdfId, prevPage)
  if (!page) {
    return `Failed to load page ${prevPage} of "${pdf.filename}".`
  }

  return `[PDF: ${pdf.filename} - Page ${prevPage} of ${pdf.totalPages}]\n\n${page.text}`
}

/**
 * Tool to navigate to a specific page
 */
export async function goToPage(userId: string, pageNumber: number): Promise<string> {
  const { pdfId } = await getActiveState(userId)

  if (!pdfId) {
    return "No PDF is currently active. Please upload a PDF file first."
  }

  const pdf = await getPDF(pdfId)
  if (!pdf) {
    return "The active PDF could not be found. It may have been removed."
  }

  if (pageNumber < 1 || pageNumber > pdf.totalPages) {
    return `Invalid page number. The PDF "${pdf.filename}" has ${pdf.totalPages} pages.`
  }

  await setCurrentPage(userId, pageNumber)

  const page = await getPDFPage(pdfId, pageNumber)
  if (!page) {
    return `Failed to load page ${pageNumber} of "${pdf.filename}".`
  }

  return `[PDF: ${pdf.filename} - Page ${pageNumber} of ${pdf.totalPages}]\n\n${page.text}`
}

/**
 * Tool to get PDF information
 */
export async function getPDFInfo(userId: string): Promise<string> {
  const { pdfId } = await getActiveState(userId)

  if (!pdfId) {
    return "No PDF is currently active. Please upload a PDF file first."
  }

  const pdf = await getPDF(pdfId)
  if (!pdf) {
    return "The active PDF could not be found. It may have been removed."
  }

  return `PDF Information:
- Filename: ${pdf.filename}
- Total Pages: ${pdf.totalPages}
- Uploaded: ${new Date(pdf.uploadedAt).toLocaleString()}`
}

