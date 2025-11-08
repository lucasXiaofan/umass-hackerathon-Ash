"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "@/components/ui/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { SuggestionPills } from "@/components/suggestion-pills"
import { Bot, Phone, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CharacterSprite } from "@/components/character-sprite"
import { chatAPI, voiceAPI, uploadAPI, spriteAPI } from "@/lib/api"

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
    try {
      if (!isOnCall) {
        console.log("Starting voice call with Ash...")
        const result = await voiceAPI.startCall()
        setIsOnCall(true)
        setIsSpeaking(true)
        console.log("Voice call started:", result)
      } else {
        console.log("Ending voice call...")
        const result = await voiceAPI.stopCall()
        setIsOnCall(false)
        setIsSpeaking(false)
        console.log("Voice call ended:", result)
      }
    } catch (error) {
      console.error("Error toggling call:", error)
      // Fallback to local state
      setIsOnCall(!isOnCall)
      setIsSpeaking(!isOnCall)
    }
  }

  const handleTextToSpeech = async (text: string) => {
    try {
      setIsSpeaking(true)
      console.log("Playing speech:", text)

      // Call TTS API
      const result = await voiceAPI.textToSpeech(text)

      // If result is audio blob, play it
      if (result instanceof Blob) {
        const audioUrl = URL.createObjectURL(result)
        const audio = new Audio(audioUrl)
        audio.play()

        audio.onended = async () => {
          setIsSpeaking(false)
          await spriteAPI.setSpeaking(false)
        }
      } else {
        // Simulate speech duration for mock response
        setTimeout(async () => {
          setIsSpeaking(false)
          await spriteAPI.setSpeaking(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error with text-to-speech:", error)
      // Fallback: simulate speech
      setTimeout(() => {
        setIsSpeaking(false)
      }, 3000)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("Processing file:", file.name)

    try {
      // Upload file to backend
      const result = await uploadAPI.uploadFile(file)

      const systemMessage: Message = {
        id: Date.now().toString(),
        text: result.message || `Got it! I'm scanning "${file.name}" for important dates and deadlines. I'll set up reminders for you automatically.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, systemMessage])

      console.log("File upload result:", result)
    } catch (error) {
      console.error("Error uploading file:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Sorry, I had trouble processing "${file.name}". Please try again.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleSubmit = async () => {
    console.log("handleSubmit called, inputValue:", inputValue)
    if (!inputValue.trim()) {
      console.log("Input is empty, returning")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    console.log("Adding user message:", userMessage)
    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)

    if (!hasStartedChat) {
      setHasStartedChat(true)
      setTimeout(() => {
        setShowCompactMode(true)
      }, 500)
    }

    try {
      // Call Flask API
      console.log("Calling API with message:", currentInput)
      const response = await chatAPI.sendMessage(currentInput)
      console.log("API response:", response)

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      console.log("Adding AI response:", aiResponse)
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)

      // Play TTS if should_speak is true
      if (response.should_speak) {
        // handleTextToSpeech(aiResponse.text)
        console.log("suppose to do tts")

      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)

      // Show error message - backend might not be running
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Oops! I'm having trouble connecting to my backend. Make sure the Flask server is running on http://localhost:5001",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiResponse])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const currentSuggestions = messages.length > 0 ? followUpSuggestions : initialSuggestions

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
                <CharacterSprite isSpeaking={isSpeaking} size="large" />
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
              <CharacterSprite isSpeaking={isSpeaking} size="large" />
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
