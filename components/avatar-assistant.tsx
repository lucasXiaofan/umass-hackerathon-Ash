"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export type AvatarExpression = "neutral" | "happy" | "surprised"

export interface AvatarAssistantProps {
  message?: string
  isTyping?: boolean
  className?: string
  size?: "small" | "medium" | "large"
}

const sizeClasses = {
  small: "w-64 h-64",
  medium: "w-96 h-96",
  large: "w-[512px] h-[512px]",
}

const imageSizes = {
  small: 256,
  medium: 384,
  large: 512,
}

/**
 * Determines the avatar expression based on message content and typing state
 */
function getExpression(message: string | undefined, isTyping: boolean): AvatarExpression {
  // If typing, show surprised expression
  if (isTyping) {
    return "surprised"
  }

  // If no message, return neutral
  if (!message) {
    return "neutral"
  }

  const lowerMessage = message.toLowerCase()

  // Check for happy expressions - expanded list
  const happyKeywords = [
    "great",
    "awesome",
    "perfect",
    "success",
    "completed",
    "done",
    "finished",
    "excellent",
    "wonderful",
    "fantastic",
    "amazing",
    "brilliant",
    "outstanding",
    "superb",
    "terrific",
    "incredible",
    "yes",
    "sure",
    "absolutely",
    "definitely",
    "glad",
    "happy",
    "pleased",
    "delighted",
    "thrilled",
    "congratulations",
    "celebrate",
    "achievement",
    "accomplished",
    "good job",
    "well done",
    "nice",
    "love",
    "like",
    "enjoy",
    "appreciate",
    "thank",
    "thanks",
    "welcome",
    "helpful",
    "useful",
  ]
  const happyEmojis = ["✅", "✓", "✔", "😊", "😄", "😃", "🎉", "✨", "👍", "❤️", "💚", "💙", "😁", "😆", "😍", "🥳"]

  if (
    happyKeywords.some((keyword) => lowerMessage.includes(keyword)) ||
    happyEmojis.some((emoji) => message.includes(emoji))
  ) {
    return "happy"
  }

  // Check for surprised expressions - expanded list
  const surprisedKeywords = [
    "wow",
    "error",
    "warning",
    "important",
    "wait",
    "oops",
    "uh oh",
    "alert",
    "attention",
    "whoa",
    "huh",
    "what",
    "really",
    "seriously",
    "unexpected",
    "surprise",
    "surprised",
    "shocked",
    "amazed",
    "incredible",
    "unbelievable",
    "no way",
    "oh no",
    "oh my",
    "gosh",
    "golly",
    "hmm",
    "interesting",
    "curious",
    "wonder",
    "question",
    "ask",
    "help",
    "problem",
    "issue",
    "trouble",
    "difficult",
    "confused",
    "confusion",
    "unsure",
    "maybe",
    "perhaps",
    "might",
    "could",
    "would",
  ]
  const surprisedIndicators = ["!", "?"]

  if (
    surprisedKeywords.some((keyword) => lowerMessage.includes(keyword)) ||
    surprisedIndicators.some((indicator) => message.includes(indicator))
  ) {
    return "surprised"
  }

  // Default to neutral
  return "neutral"
}

/**
 * AvatarAssistant component that displays an avatar with dynamic expressions
 * based on AI response content and typing state.
 */
export function AvatarAssistant({
  message,
  isTyping = false,
  className,
  size = "medium",
}: AvatarAssistantProps) {
  const [currentExpression, setCurrentExpression] = useState<AvatarExpression>("neutral")
  const [previousExpression, setPreviousExpression] = useState<AvatarExpression | null>(null)
  const [imageKey, setImageKey] = useState(0)
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevIsTypingRef = useRef<boolean>(false)

  const imageSize = imageSizes[size]
  const [imageError, setImageError] = useState(false)

  // Preload all avatar images on mount for seamless transitions
  useEffect(() => {
    const expressions: AvatarExpression[] = ["neutral", "happy", "surprised"]
    expressions.forEach((expr) => {
      // Use window.Image to access native browser Image constructor
      const img = new window.Image()
      img.src = `/avatar/${expr}.png`
    })
  }, [])

  // Main logic: Update expression based on typing and message
  useEffect(() => {
    // Clear any existing timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    // When AI is typing, show surprised
    if (isTyping) {
      if (currentExpression !== "surprised") {
        console.log(`[Avatar] AI is typing - showing surprised`)
        setPreviousExpression(currentExpression)
        setCurrentExpression("surprised")
        setImageKey((prev) => prev + 1)
      }
      prevIsTypingRef.current = true
      return
    }

    // When AI finishes typing (transitions from typing to not typing)
    if (!isTyping && prevIsTypingRef.current && message) {
      console.log(`[Avatar] AI finished speaking - showing emotion from message`)
      
      // Calculate expression from message content
      const emotionExpression = getExpression(message, false)
      
      // Show the emotion-based expression instantly
      if (currentExpression !== emotionExpression) {
        console.log(`[Avatar] Setting expression to: ${emotionExpression}`)
        setPreviousExpression(currentExpression)
        setCurrentExpression(emotionExpression)
        setImageKey((prev) => prev + 1)
      }

      // Reset to neutral after 1 second
      console.log(`[Avatar] Will reset to neutral in 1 second`)
      resetTimeoutRef.current = setTimeout(() => {
        console.log(`[Avatar] Resetting to neutral`)
        setPreviousExpression(currentExpression)
        setCurrentExpression("neutral")
        setImageKey((prev) => prev + 1)
        resetTimeoutRef.current = null
      }, 1000)
    }

    // Update ref
    prevIsTypingRef.current = isTyping

    // Cleanup - only clear timeout if typing starts again or message changes
    return () => {
      // Only clear if we're starting to type again (to cancel reset)
      if (isTyping && resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, message])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full transition-all duration-500 ease-in-out",
          sizeClasses[size],
          "shadow-lg bg-muted"
        )}
      >
        {/* Previous image - hidden behind current */}
        {previousExpression && previousExpression !== currentExpression && (
          imageError ? (
            <img
              src={`/avatar/${previousExpression}.png`}
              alt=""
              className={cn(
                "object-cover absolute inset-0",
                "w-full h-full"
              )}
              style={{ objectPosition: "center 25%", zIndex: 0 }}
            />
          ) : (
            <Image
              src={`/avatar/${previousExpression}.png`}
              alt=""
              width={imageSize}
              height={imageSize}
              className={cn(
                "object-cover absolute inset-0",
                "w-full h-full"
              )}
              style={{ objectPosition: "center 25%", zIndex: 0 }}
            />
          )
        )}
        
        {/* Current image - on top */}
        {imageError ? (
          <img
            src={`/avatar/${currentExpression}.png?v=${imageKey}`}
            alt={`Avatar ${currentExpression} expression`}
            key={`img-${currentExpression}-${imageKey}`}
            className={cn(
              "object-cover absolute inset-0",
              "w-full h-full"
            )}
            style={{ objectPosition: "center 25%", zIndex: 1 }}
            onError={(e) => {
              console.error(`[Avatar] Failed to load image: /avatar/${currentExpression}.png`, e)
            }}
            onLoad={() => {
              // Clear previous image after current loads
              setTimeout(() => setPreviousExpression(null), 100)
            }}
          />
        ) : (
          <Image
            src={`/avatar/${currentExpression}.png?v=${imageKey}`}
            alt={`Avatar ${currentExpression} expression`}
            key={`img-${currentExpression}-${imageKey}`}
            width={imageSize}
            height={imageSize}
            className={cn(
              "object-cover absolute inset-0",
              "w-full h-full"
            )}
            style={{ objectPosition: "center 25%", zIndex: 1 }}
            priority={size === "large"}
            onError={(e) => {
              console.error(`[Avatar] Failed to load image: /avatar/${currentExpression}.png`, e)
              setImageError(true)
            }}
            onLoad={() => {
              // Clear previous image after current loads
              setTimeout(() => setPreviousExpression(null), 100)
            }}
          />
        )}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <div
            className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      )}
    </div>
  )
}

