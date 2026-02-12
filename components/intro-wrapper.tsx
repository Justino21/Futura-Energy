"use client"

import { useState, useEffect } from "react"
import IntroSequence from "@/components/intro-sequence"

export default function IntroWrapper() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    // Always show loading screen on initial page load
    setShowIntro(true)
  }, [])

  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  if (!showIntro) return null

  return <IntroSequence onComplete={handleIntroComplete} />
}


