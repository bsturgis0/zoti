"use client"

import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Trash2, BookOpen, Download } from "lucide-react"

interface ChatHeaderProps {
  title: string
  onClearChat?: () => void
  onExportChat?: () => void
  infoText?: string
}

export function ChatHeader({
  title,
  onClearChat,
  onExportChat,
  infoText = "Ask questions and Zoti will guide you through the content step by step.",
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-card p-4">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          <BookOpen size={16} className="text-primary" />
        </div>
        <CardTitle className="text-primary font-heading text-lg">{title}</CardTitle>
      </div>
      <div className="flex items-center gap-2">
        {onExportChat && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onExportChat} className="h-9 w-9">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export chat history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onClearChat && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onClearChat} className="h-9 w-9">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear chat history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] sm:max-w-xs">
              <p className="text-xs">{infoText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

