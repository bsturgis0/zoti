"use client"

import { BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { typingIndicator, typingDot } from "@/lib/animation-utils"

export function TypingIndicator() {
  return (
    <motion.div className="flex items-start gap-3" initial="hidden" animate="visible" variants={typingIndicator}>
      <motion.div
        className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1"
        whileHover={{ scale: 1.1 }}
      >
        <BookOpen size={16} />
      </motion.div>

      <div className="flex flex-col max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">Zoti Teacher</span>
        </div>

        <motion.div
          className="rounded-lg rounded-tl-none bg-card text-foreground px-4 py-3 text-sm border shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div className="flex items-center space-x-2" variants={typingIndicator}>
            <motion.div className="w-2 h-2 rounded-full bg-primary/60" variants={typingDot} />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/60"
              variants={typingDot}
              transition={{ delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/60"
              variants={typingDot}
              transition={{ delay: 0.4 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

