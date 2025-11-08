"use client"

import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"

interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp?: string
  className?: string
}

export function ChatMessage({ message, isUser, timestamp, className }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 mb-6", className)}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Bot className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}

      <div className={cn("flex-1", isUser && "flex justify-end")}>
        {isUser ? (
          <div className="bg-accent text-accent-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-xs">{message}</div>
        ) : (
          <div className="space-y-1">
            <div className="text-foreground leading-relaxed">{message}</div>
            {timestamp && <div className="text-xs text-muted-foreground">{timestamp}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
