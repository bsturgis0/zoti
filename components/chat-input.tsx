"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, Loader2, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, slideUp } from "@/lib/animation-utils"

interface ChatInputProps {
  onSend: (message: string, files: File[]) => void
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
  uploadProgress?: number | null
}

export function ChatInput({
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Type your message...",
  uploadProgress = null,
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if ((!input.trim() && files.length === 0) || isLoading || disabled) return

    onSend(input, files)
    setInput("")
    setFiles([])

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  return (
    <div className="w-full border-t">
      <AnimatePresence>
        {uploadProgress !== null && (
          <motion.div
            className="px-4 py-3 bg-muted/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-primary">Uploading files...</p>
              <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="px-4 py-3 bg-muted/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <p className="text-xs font-medium mb-2 text-primary">Attached files:</p>
            <motion.div className="flex flex-wrap gap-2" variants={fadeIn}>
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  className="flex items-center bg-background rounded-md border px-2.5 py-1.5 text-xs shadow-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-1.5 bg-primary/10 rounded-sm flex items-center justify-center">
                      <span className="text-[10px] text-primary">PDF</span>
                    </div>
                    <span className="truncate max-w-[120px] sm:max-w-[150px] font-medium">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <motion.button
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${file.name}`}
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={handleSubmit} className="flex w-full space-x-2 p-3 sm:p-4" variants={slideUp}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || disabled}
                  className="flex-shrink-0 border hover:bg-primary/10 hover:text-primary h-10 w-10"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Attach PDF slides</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf"
          disabled={disabled}
          multiple
        />

        <motion.div className="flex-1" whileFocus={{ scale: 1.01 }}>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border text-sm py-5 px-4"
            disabled={isLoading || disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
        </motion.div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={isLoading || disabled || (!input.trim() && files.length === 0)}
                  className="flex-shrink-0 px-4 h-10"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <span className="text-xs hidden xs:inline">Send</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Send message (Enter)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.form>
    </div>
  )
}

