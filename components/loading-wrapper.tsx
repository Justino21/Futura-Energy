"use client"

import { useState, useEffect, useRef } from "react"
import IntroSequence from "./intro-sequence"

interface LoadingWrapperProps {
  children: React.ReactNode
}

export default function LoadingWrapper({ children }: LoadingWrapperProps) {
  const [showLoading, setShowLoading] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [shouldShowLoading, setShouldShowLoading] = useState(true)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    // Check if we've already shown the loading screen in this session
    if (typeof window === 'undefined') {
      setShowLoading(false)
      setShouldShowLoading(false)
      return
    }
    
    // TEMPORARY: Force show loading every time for testing
    // Remove this to restore session-based behavior
    const FORCE_SHOW = true
    
    if (!FORCE_SHOW) {
      const loadingShown = sessionStorage.getItem("futura-loading-shown")
      
      if (loadingShown === "true") {
        // Skip loading if already shown
        setShouldShowLoading(false)
        setShowLoading(false)
        return
      }
    }
    
    // Mark as shown for this session immediately
    if (!FORCE_SHOW) {
      sessionStorage.setItem("futura-loading-shown", "true")
    }
    // Body stays static - scroll is handled by intro-sequence for fade control only
    document.body.style.overflow = "hidden"
    document.body.style.height = "100vh"
    setShouldShowLoading(true)
    setShowLoading(true)
  }, [])

  const handleLoadingComplete = () => {
    // Prevent multiple calls
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true

    // Immediately hide loading and show content
    setShowLoading(false)
    if (typeof window !== 'undefined') {
      document.body.style.overflow = ""
      document.body.style.height = ""
    }
  }

  // If we shouldn't show loading, render children immediately
  if (!shouldShowLoading) {
    return <>{children}</>
  }

  // Show loading screen - home page is already visible, overlay fades on scroll
  if (showLoading) {
    return (
      <>
        {/* Website content - already fixed in position and visible */}
        <div 
          id="website-content"
          style={{ 
            position: 'relative', 
            zIndex: 1, 
            width: '100%',
            backgroundColor: 'transparent',
            opacity: 1, // Already visible!
            margin: 0,
            padding: 0,
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {children}
        </div>
        
        {/* Loading overlay - fades out smoothly as you scroll */}
        <IntroSequence onComplete={handleLoadingComplete} />
      </>
    )
  }

  // After loading completes, show children
  return <>{children}</>
}

