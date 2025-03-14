"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { fadeIn, slideUp } from "@/lib/animation-utils"

interface PDFNavigationHelperProps {
  onNavigate: (action: string) => void
}

export function PDFNavigationHelper({ onNavigate }: PDFNavigationHelperProps) {
  return (
    <motion.div
      className="flex flex-col space-y-2 p-3 bg-muted/20 rounded-md border relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={slideUp}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
        style={{
          background: "linear-gradient(135deg, transparent, rgba(var(--primary), 0.2), transparent)",
          backgroundSize: "200% 200%",
        }}
      />

      <motion.p className="text-sm font-medium mb-2" variants={fadeIn} transition={{ delay: 0.2 }}>
        PDF Navigation
      </motion.p>

      <div className="flex flex-wrap gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("previous")}
            className="h-8 bg-muted/50 hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs">Previous Page</span>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("next")}
            className="h-8 bg-muted/50 hover:bg-primary/10 hover:text-primary"
          >
            <span className="text-xs">Next Page</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>
      </div>

      <motion.div className="text-xs text-muted-foreground mt-1" variants={fadeIn} transition={{ delay: 0.5 }}>
        You can also type "next page", "previous page", or "go to page X" in the chat.
      </motion.div>
    </motion.div>
  )
}

