"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "@/components/ui/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { SuggestionPills } from "@/components/suggestion-pills"
import { Bot, Phone, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CharacterSprite } from "@/components/character-sprite"
import { AvatarAssistant } from "@/components/avatar-assistant"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

const initialSuggestions = [
  "What should I focus on today?",
  "Remind me about my finals in 2 weeks",
  "I have a project due next Friday",
  "What's on my plate this week?",
]

const followUpSuggestions = [
  "What should I work on next?",
  "Show me my upcoming deadlines",
  "Help me prioritize my tasks",
  "Remind me to study tomorrow at 3pm",
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [showCompactMode, setShowCompactMode] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isOnCall, setIsOnCall] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [messages])

  const handleCallToggle = async () => {
    setIsOnCall(!isOnCall)

    if (!isOnCall) {
      // TODO: Start voice call with Eleven Labs
      console.log("[v0] Starting voice call with Ash...")
      setIsSpeaking(true)
    } else {
      // TODO: End voice call
      console.log("[v0] Ending voice call...")
      setIsSpeaking(false)
    }
  }

  const handleTextToSpeech = async (text: string) => {
    setIsSpeaking(true)

    // TODO: Integrate with Eleven Labs API for voice output
    console.log("[v0] Playing speech:", text)

    // Simulate speech duration
    setTimeout(() => {
      setIsSpeaking(false)
    }, 3000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("[v0] Processing file:", file.name)

    // TODO: Process file to extract dates and create reminders
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: `Got it! I'm scanning "${file.name}" for important dates and deadlines. I'll set up reminders for you automatically.`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, systemMessage])
  }

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
    setIsLoading(true)

    if (!hasStartedChat) {
      setHasStartedChat(true)
      setTimeout(() => {
        setShowCompactMode(true)
      }, 500)
    }

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)

      handleTextToSpeech(aiResponse.text)
    }, 1500)
  }

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("today") || input.includes("focus")) {
      return "Hey! Based on your deadlines, I'd say tackle that CS assignment first - it's due in 2 days. After that, maybe review your chem notes? You've got a quiz coming up Thursday. Want me to block out some time for these?"
    }
    if (input.includes("finals") || input.includes("exam")) {
      return "On it! I'll start giving you heads up about finals 2 weeks out. That's serious stuff, so I'll make sure you've got plenty of time to prep. I'll check in with you periodically too - we got this!"
    }
    if (input.includes("project") || input.includes("assignment")) {
      return "Cool, I'll keep that on my radar. I'll give you a reminder 3 days before so you've got time to wrap it up without stressing. Need help breaking it down into smaller chunks?"
    }
    if (input.includes("week") || input.includes("upcoming")) {
      return "Looking at your week: you've got that bio lab report Tuesday, math problem set Thursday, and don't forget about the study group Friday evening. Pretty manageable - you good with this schedule?"
    }
    return "Got it! I'll keep track of that for you. Just chat with me anytime you need a reminder or want to know what's coming up. I'm here to help you stay on top of things without the stress!"
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const currentSuggestions = messages.length > 0 ? followUpSuggestions : initialSuggestions

  // Get the last AI message for avatar expression - useMemo to ensure it updates
  const lastAIMessage = useMemo(() => {
    const lastMessage = messages.filter((m) => !m.isUser).slice(-1)[0]
    return lastMessage?.text || ""
  }, [messages])

  // Get the last AI message ID to track when a new message arrives
  const lastAIMessageId = useMemo(() => {
    const lastMessage = messages.filter((m) => !m.isUser).slice(-1)[0]
    return lastMessage?.id || ""
  }, [messages])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Ash</h1>
              <p className="text-xs text-muted-foreground">Your personal manager</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.ics"
                onChange={handleFileUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-5 h-5" />
              </Button>
            </div>

            <Button
              variant={isOnCall ? "default" : "ghost"}
              size="icon"
              onClick={handleCallToggle}
              className={
                isOnCall ? "bg-green-600 hover:bg-green-700 text-white" : "text-muted-foreground hover:text-foreground"
              }
            >
              <Phone className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {!hasStartedChat ? (
          /* Initial Full Screen Chat */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
            <div className="w-full max-w-2xl">
              <div className="flex justify-center mb-8">
                <AvatarAssistant message={lastAIMessage} isTyping={isLoading} size="large" />
              </div>

              <div className="text-center mb-12"></div>

              <div className="space-y-6">
                <SuggestionPills suggestions={currentSuggestions} onSuggestionClick={handleSuggestionClick} />

                <ChatInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                  className="max-w-2xl mx-auto"
                >
                  <ChatInputTextArea placeholder="Tell me what's on your mind..." className="text-base" />
                  <ChatInputSubmit />
                </ChatInput>
              </div>
            </div>
          </div>
        ) : (
          /* Compact Mode Layout */
          <div className="flex min-h-[calc(100vh-5rem)]">
            {/* Main Content Area */}
            <div className="flex-1 lg:max-w-[calc(100%-28rem)] w-full">
              {/* Chat Messages */}
              <div className="px-6 py-8 pb-40">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-secondary-foreground" />
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
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:flex items-center justify-center w-[28rem] flex-shrink-0 border-l border-border fixed right-0 top-20 bottom-0">
              <AvatarAssistant message={lastAIMessage} isTyping={isLoading} size="medium" />
            </div>
          </div>
        )}

        {/* Bottom Chat Input (Compact Mode) */}
        {showCompactMode && (
          <div className="fixed bottom-6 left-0 right-0 lg:right-[28rem] z-50 px-6 fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <SuggestionPills suggestions={currentSuggestions} onSuggestionClick={handleSuggestionClick} />

              <ChatInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onSubmit={handleSubmit}
                loading={isLoading}
                className="bg-card shadow-lg border-border"
              >
                <ChatInputTextArea placeholder="Message Ash..." className="bg-transparent" />
                <ChatInputSubmit />
              </ChatInput>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
