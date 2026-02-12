"use client"

import { useEffect, useState, useRef } from "react"

interface ScrollDrivenHeroProps {
  children: React.ReactNode
}

export default function ScrollDrivenHero({ children }: ScrollDrivenHeroProps) {
  const [overlayOpacity, setOverlayOpacity] = useState(0.2)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return

      const rect = heroRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate scroll progress through hero section
      // Hero height is 60vh
      const heroHeight = windowHeight * 0.6
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / heroHeight))
      
      // Overlay opacity: 0.2 (initial) to 1.0 (fully black)
      // Darkens as user scrolls down
      const opacity = 0.2 + (scrollProgress * 0.8)
      setOverlayOpacity(Math.min(opacity, 1))
    }

    // Throttled scroll handler
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    handleScroll() // Initial check
    
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div ref={heroRef} className="relative w-full h-[60vh] overflow-hidden">
      {children}
      {/* Darkening overlay - controlled by scroll */}
      <div 
        className="absolute inset-0 bg-black z-20 pointer-events-none"
        style={{
          opacity: overlayOpacity,
          transition: 'opacity 0.1s linear',
        }}
      />
    </div>
  )
}




