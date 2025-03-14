"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animation-utils"

interface PDFNavigationProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  onGoToPage: (page: number) => void
  pdfName: string
}

export function PDFNavigation({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onGoToPage,
  pdfName,
}: PDFNavigationProps) {
  const [inputPage, setInputPage] = useState<string>(currentPage.toString())

  const handleGoToPage = () => {
    const pageNum = Number.parseInt(inputPage)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onGoToPage(pageNum)
    } else {
      // Reset to current page if invalid
      setInputPage(currentPage.toString())
    }
  }

  return (
    <motion.div
      className="flex flex-col space-y-2 p-3 bg-muted/30 rounded-md border relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Animated border effect */}
      <motion.div
        className="absolute inset-0 opacity-30 pointer-events-none"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
        style={{
          background: "linear-gradient(45deg, transparent, rgba(var(--primary), 0.3), transparent)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <FileText className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium truncate max-w-[200px]">{pdfName}</span>
        </div>
        <motion.span
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Page {currentPage} of {totalPages}
        </motion.span>
      </div>

      <div className="flex items-center space-x-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={currentPage <= 1}
            className="h-8 px-3 bg-muted/50 hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs">Previous</span>
          </Button>
        </motion.div>

        <div className="flex items-center space-x-2">
          <motion.input
            type="text"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={handleGoToPage}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleGoToPage()
              }
            }}
            className="w-12 h-8 text-center border rounded-md text-sm"
            whileFocus={{ scale: 1.05, boxShadow: "0 0 0 2px rgba(var(--primary), 0.3)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          />
          <span className="text-xs text-muted-foreground">of {totalPages}</span>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentPage >= totalPages}
            className="h-8 px-3 bg-muted/50 hover:bg-primary/10 hover:text-primary"
          >
            <span className="text-xs">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

