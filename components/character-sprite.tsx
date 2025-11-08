"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CharacterSpriteProps {
  isSpeaking: boolean
  size?: "small" | "medium" | "large"
  className?: string
}

export function CharacterSprite({ isSpeaking, size = "medium", className }: CharacterSpriteProps) {
  const [bounceKey, setBounceKey] = useState(0)

  useEffect(() => {
    if (isSpeaking) {
      // Trigger bounce animation when speaking
      setBounceKey((prev) => prev + 1)
    }
  }, [isSpeaking])

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-40 h-40",
  }

  return (
    <div className={cn("relative flex flex-col items-center gap-4", className)}>
      <div
        key={bounceKey}
        className={cn(
          "w-full h-full rounded-full bg-gradient-to-br from-secondary via-secondary/80 to-secondary/60 flex items-center justify-center shadow-xl transition-all duration-300",
          sizeClasses[size],
          isSpeaking && "animate-bounce-smooth",
        )}
      >
        {/* Placeholder icon - replace with actual character image */}
        <div className="text-secondary-foreground text-4xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "transition-all",
              size === "small" && "w-8 h-8",
              size === "medium" && "w-12 h-12",
              size === "large" && "w-20 h-20",
            )}
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>
      </div>

      {size === "large" && (
        <div className="text-center">
          <p className="text-2xl font-bold">Ash</p>
          
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      )}
    </div>
  )
}
