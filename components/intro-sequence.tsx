"use client"

import { useEffect, useState, useRef } from "react"
import FuturisticScene from "./futuristic-scene"
import ParticleLogo from "./particle-logo"

interface IntroSequenceProps {
  onComplete: () => void
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [isReady, setIsReady] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [showParticleLogo, setShowParticleLogo] = useState(false)
  const [isLogoFullyFormed, setIsLogoFullyFormed] = useState(false)
  const animationStartTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Particles start immediately, no delay needed
    setShowParticleLogo(true)
    
    // Set ready immediately to ensure rendering
    setIsReady(true)

    // Prevent actual page scrolling
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    // Automatic animation timeline:
    // 0-1.5 seconds: World map display (particles stay in map positions)
    // 1.5-9.5 seconds: Logo formation (8 seconds for particles to move from map to logo)
    // 9.5-17 seconds: Logo stays fully visible (7.5 seconds)
    // 17+ seconds: Smooth fade out to home page
    const mapDisplayDuration = 1500 // 1.5 seconds to display world map before movement starts
    const logoFormationDuration = 8000 // 8 seconds for logo formation
    const logoDisplayDuration = 7500 // 7.5 seconds with logo fully visible
    const fadeDuration = 2000 // 2 seconds for smooth fade out
    const totalDuration = mapDisplayDuration + logoFormationDuration + logoDisplayDuration + fadeDuration // 19 seconds total

    const animate = (timestamp: number) => {
      if (!animationStartTimeRef.current) {
        animationStartTimeRef.current = timestamp
      }

      const elapsed = timestamp - animationStartTimeRef.current
      const progress = Math.min(elapsed / totalDuration, 1)
      
      setAnimationProgress(progress)

      // Complete animation after 10 seconds
      if (progress >= 1) {
        onComplete()
      } else {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [onComplete])

  // Smooth easing
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeInOutCubic = (t: number) => 
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  // Automatic animation timing (19 seconds total):
  // 0-1.5 seconds: World map display (7.9% of 19 seconds)
  // 1.5-9.5 seconds: Logo formation (42.1% of 19 seconds)
  // 9.5-17 seconds: Logo stays fully visible (39.5% of 19 seconds)
  // 17-19 seconds: Smooth fade out (10.5% of 19 seconds)
  const mapDisplayEnd = 1.5 / 19 // 1.5 seconds = 7.9% of 19 seconds
  const logoFormationEnd = 9.5 / 19 // 9.5 seconds = 50% of 19 seconds
  const logoDisplayEnd = 17 / 19 // 17 seconds = 89.5% of 19 seconds
  const fadeStartProgress = logoDisplayEnd // Start fade at 17.5 seconds
  
  // Only start fading after logo is fully formed, displayed for 3 seconds, AND we've reached fade time
  // Before fade: opacity stays at 1 (no fade at all) - CRUCIAL!
  // After fade start: smooth fade out
  const fadeProgress = isLogoFullyFormed && animationProgress >= fadeStartProgress
    ? Math.min((animationProgress - fadeStartProgress) / (1 - fadeStartProgress), 1)
    : 0
  
  const eased = easeInOutCubic(fadeProgress)
  // CRITICAL: Stay at opacity 1 until fade time (after logo is formed and displayed for 3 seconds)
  const overlayOpacity = isLogoFullyFormed && animationProgress >= fadeStartProgress
    ? Math.max(0, 1 - eased) // Smooth fade out after logo display period
    : 1 // Stay fully visible until fade time - CRUCIAL!

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        opacity: overlayOpacity,
        willChange: 'opacity',
        zIndex: 99999,
        backgroundColor: 'transparent'
      }}
    >
      {/* Dark background */}
      <FuturisticScene scrollProgress={animationProgress} />

      {/* Particle logo - forms from particles automatically over 8 seconds, then stays visible for 7.5 seconds */}
      <ParticleLogo 
        scrollProgress={animationProgress} 
        onLogoFormed={setIsLogoFullyFormed}
      />
    </div>
  )
}
