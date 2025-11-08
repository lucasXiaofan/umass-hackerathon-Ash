/**
 * Example usage of AvatarAssistant component
 * 
 * This file demonstrates how to integrate the AvatarAssistant component
 * into your chat interface.
 */

"use client"

import { useState } from "react"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { ChatMessage } from "@/components/chat-message"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

export function ChatWithAvatarExample() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Get the last AI message for expression detection
  const lastAIMessage = messages.filter((msg) => !msg.isUser).slice(-1)[0]?.text || ""

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Great! I've processed your request successfully! ✅",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000)
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}

          {isTyping && (
            <div className="flex gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <div className="w-4 h-4 text-secondary-foreground">🤖</div>
              </div>
              <div className="flex-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Sidebar */}
      <div className="hidden lg:flex items-center justify-center w-80 border-l border-border bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <AvatarAssistant
            message={lastAIMessage}
            isTyping={isTyping}
            size="large"
          />
          <p className="text-lg font-semibold">Ash</p>
          <p className="text-sm text-muted-foreground">Your AI Assistant</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Alternative: Simple inline usage
 */
export function SimpleAvatarExample() {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <AvatarAssistant message={message} isTyping={isTyping} size="large" />

      <div className="space-y-2">
        <button
          onClick={() => setMessage("Great! Task completed successfully! ✅")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Test Happy Expression
        </button>
        <button
          onClick={() => setMessage("Wait! There's an error!")}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded"
        >
          Test Surprised Expression
        </button>
        <button
          onClick={() => setMessage("Hello, how can I help you?")}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
        >
          Test Neutral Expression
        </button>
        <button
          onClick={() => setIsTyping(!isTyping)}
          className="px-4 py-2 bg-accent text-accent-foreground rounded"
        >
          Toggle Typing State
        </button>
      </div>
    </div>
  )
}

