"use client"

import { cn } from "@/lib/utils"
import type { Message } from "@/types"
import { BookOpen, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { formatDate } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { motion } from "framer-motion"
import { slideInLeft, slideInRight } from "@/lib/animation-utils"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Ensure timestamp is a valid date
  const timestamp = message.timestamp ? message.timestamp : new Date()

  return (
    <motion.div
      className={cn("flex items-start gap-3", isUser ? "flex-row-reverse" : "flex-row")}
      initial="hidden"
      animate="visible"
      variants={isUser ? slideInRight : slideInLeft}
    >
      {/* Avatar */}
      <motion.div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        )}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {isUser ? <User size={16} /> : <BookOpen size={16} />}
      </motion.div>

      {/* Message content */}
      <div className={cn("flex flex-col max-w-[85%]", isUser ? "items-end" : "items-start")}>
        {/* Message header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">{isUser ? "You" : "Zoti Teacher"}</span>
          <span className="text-xs text-muted-foreground">{formatDate(timestamp)}</span>
        </div>

        {/* Message bubble */}
        <motion.div
          className={cn(
            "rounded-lg px-4 py-3 text-sm shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-card text-card-foreground rounded-tl-none border",
          )}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div
            className={cn(
              "prose prose-sm max-w-none",
              isUser
                ? "prose-headings:text-primary-foreground prose-strong:text-primary-foreground/90 prose-em:text-primary-foreground/80 prose-a:text-primary-foreground prose-p:text-primary-foreground"
                : "prose-headings:text-foreground prose-headings:font-heading prose-strong:text-foreground/90 prose-em:text-foreground/80 prose-a:text-primary",
            )}
          >
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-base font-bold mt-3 mb-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                p: ({ node, ...props }) => <p className="my-1.5" {...props} />,
                ul: ({ node, ...props }) => <ul className="pl-4 my-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="pl-4 my-2" {...props} />,
                li: ({ node, ...props }) => <li className="my-1" {...props} />,
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      style={vs}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md border text-xs my-3"
                      customStyle={{
                        padding: "0.75rem",
                        fontSize: "0.75rem",
                        lineHeight: "1.2",
                      }}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-muted-foreground/10 px-1 py-0.5 rounded text-xs" {...props}>
                      {children}
                    </code>
                  )
                },
                table({ node, className, children, ...props }) {
                  return (
                    <div className="overflow-x-auto my-3">
                      <table className="border-collapse border border-border w-full text-xs" {...props}>
                        {children}
                      </table>
                    </div>
                  )
                },
                th({ node, className, children, ...props }) {
                  return (
                    <th className="border border-border p-1.5 bg-muted font-medium" {...props}>
                      {children}
                    </th>
                  )
                },
                td({ node, className, children, ...props }) {
                  return (
                    <td className="border border-border p-1.5" {...props}>
                      {children}
                    </td>
                  )
                },
                blockquote({ node, className, children, ...props }) {
                  return (
                    <blockquote className="border-l-2 border-primary/50 pl-3 italic my-3" {...props}>
                      {children}
                    </blockquote>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

