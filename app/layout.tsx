import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Inter, Alegreya, DM_Sans as V0_Font_DM_Sans, Bitter as V0_Font_Bitter } from 'next/font/google'

// Initialize fonts
const _dmSans = V0_Font_DM_Sans({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900","1000"], variable: '--v0-font-dm-sans' })
const _bitter = V0_Font_Bitter({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"], variable: '--v0-font-bitter' })
const _v0_fontVariables = `${_dmSans.variable} ${_bitter.variable}`

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
})

export const metadata: Metadata = {
  title: "Your Manager - AI Productivity Assistant",
  description: "A friendly AI manager that handles your tasks, deadlines, and reminders naturally",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${alegreya.variable} dark`}>
      <body className={`font-sans antialiased ${_v0_fontVariables}`}>{children}</body>
    </html>
  )
}
