"use client"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'
import SiteFooter from '@/components/site-footer'

interface ScrollVideoProps {
  footerOpacity?: number
  scrollProgress?: number
}

const ScrollVideo = forwardRef<HTMLDivElement, ScrollVideoProps>(({ footerOpacity = 1, scrollProgress = 0 }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [videoDuration, setVideoDuration] = useState(10) // Default duration for immediate scroll
  const [effectiveDuration, setEffectiveDuration] = useState(10) // Duration minus 5 seconds
  const requestRef = useRef<number>()
  const currentTimeRef = useRef(0)
  const targetTimeRef = useRef(0)
  const isSeekingRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      const duration = video.duration ?? 10
      setVideoDuration(duration)
      // Crop video to be 5 seconds shorter
      const croppedDuration = Math.max(1, duration - 5)
      setEffectiveDuration(croppedDuration)
      video.currentTime = 0
      currentTimeRef.current = 0
      
      // REMOVED: Document height modification - let page flow naturally
    }

    const handleCanPlayThrough = () => {
      // Video is fully loaded and ready
      setVideoReady(true)
    }

    const handleSeeked = () => {
      isSeekingRef.current = false
    }

    const handleSeeking = () => {
      isSeekingRef.current = true
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplaythrough', handleCanPlayThrough)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('seeking', handleSeeking)
    
    // Force load the video
    video.load()
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplaythrough', handleCanPlayThrough)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('seeking', handleSeeking)
    }
  }, [])

  useEffect(() => {
    if (!videoRef.current || !containerRef.current) return

    const video = videoRef.current
    const container = containerRef.current
    let ticking = false
    let lastScrollY = 0

    // CRITICAL: Update document height ONLY on trading page to ensure scroll progress works correctly
    // This is needed for useScroll to calculate progress correctly (0 to 1)
    const updateDocumentHeight = () => {
      // Check if we're on trading page (only on client)
      const isTradingPage = typeof window !== 'undefined' && window.location?.pathname?.includes('/trading')
      
      // Only modify document styles on trading page
      if (!isTradingPage) {
        // Reset any styles if we're not on trading page
        if (typeof document !== 'undefined') {
          document.body.style.minHeight = ''
          document.body.style.height = ''
          document.documentElement.style.minHeight = ''
          document.documentElement.style.height = ''
        }
        return
      }

      if (container && typeof document !== 'undefined' && typeof window !== 'undefined') {
        const windowHeight = window.innerHeight
        
        // Get header height if it exists
        const header = document.querySelector('header')
        const headerHeight = header ? header.offsetHeight : 0
        
        // Calculate height for white section - measure actual white section if it exists
        // Otherwise estimate (min-h-screen = 100vh)
        const whiteSection = document.querySelector('[data-white-section]')
        const whiteSectionHeight = whiteSection 
          ? Math.max(windowHeight, whiteSection.scrollHeight || whiteSection.offsetHeight)
          : windowHeight // At least one viewport height
        
        // Get the current container height (natural height based on scrollHeight)
        // DON'T reduce it - let it be natural so scroll calculations work
        const containerHeight = container.scrollHeight || container.offsetHeight
        
        // Set page/document height to include container + white section
        // This allows normal scrolling through both sections
        const totalPageHeight = headerHeight + containerHeight + whiteSectionHeight
        
        if (totalPageHeight > 0) {
          document.body.style.minHeight = `${totalPageHeight}px`
          document.body.style.height = 'auto' // Allow natural height for white section
          document.body.style.maxHeight = '' // Remove max height restriction
          document.body.style.overflow = '' // Allow normal scrolling
          document.documentElement.style.minHeight = `${totalPageHeight}px`
          document.documentElement.style.height = 'auto' // Allow natural height
          document.documentElement.style.maxHeight = '' // Remove max height restriction
          document.documentElement.style.overflow = '' // Allow normal scrolling
        }
      }
    }
    
    // Update immediately and on any changes
    updateDocumentHeight()
    const resizeObserver = new ResizeObserver(updateDocumentHeight)
    resizeObserver.observe(container)
    
    window.addEventListener('resize', updateDocumentHeight)
    
    // Also update periodically to catch container height changes
    const interval = setInterval(updateDocumentHeight, 100)

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const updateVideoTime = () => {
      const scrollY = window.scrollY
      const containerHeight = container.offsetHeight
      const windowHeight = window.innerHeight
      const scrollableHeight = Math.max(0, containerHeight - windowHeight)
      
      if (scrollableHeight <= 0) {
        // If no scrollable height, video should be at start
        targetTimeRef.current = 0
        return
      }

      // Map scroll position to video time - ensure perfect correlation
      // When scrollY = 0, video time = 0
      // When scrollY = scrollableHeight, video time = effectiveDuration (exactly)
      const scrollFraction = Math.max(0, Math.min(1, scrollY / scrollableHeight))
      targetTimeRef.current = scrollFraction * effectiveDuration
    }

    const animate = () => {
      if (!video || isNaN(targetTimeRef.current)) {
        requestRef.current = requestAnimationFrame(animate)
        return
      }

      const currentTime = currentTimeRef.current
      const targetTime = targetTimeRef.current
      const diff = Math.abs(targetTime - currentTime)

      // Use lerp for ultra-smooth interpolation
      // Adjust lerp factor based on difference for responsive but smooth seeking
      let lerpFactor = 0.15
      if (diff > 0.5) {
        lerpFactor = 0.25 // Faster catch-up for large differences
      } else if (diff < 0.05) {
        lerpFactor = 0.08 // Slower, more precise for small differences
      }

      // Clamp newTime to never exceed effectiveDuration (cropped end)
      const newTime = Math.min(lerp(currentTime, targetTime, lerpFactor), effectiveDuration)
      
      // Only update if video is ready and difference is meaningful
      if (videoReady && diff > 0.001 && !isSeekingRef.current) {
        // Ensure we never seek beyond effective duration (video ends 5 seconds early)
        const clampedTime = Math.min(newTime, effectiveDuration)
        video.currentTime = clampedTime
        currentTimeRef.current = clampedTime
      }
      
      // If video has finished (reached cropped end) and we're at max scroll, keep it at the end
      // But allow it to go backward if user scrolls up
      const scrollY = window.scrollY
      const containerHeight = container.offsetHeight
      const windowHeight = window.innerHeight
      const scrollableHeight = containerHeight - windowHeight
      
      if (video.currentTime >= effectiveDuration - 0.05 && scrollY >= scrollableHeight - 1) {
        // Only clamp if we're at the end of scroll, allow backward movement
        video.currentTime = effectiveDuration
        currentTimeRef.current = effectiveDuration
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    // Calculate threshold scroll position (when progress = 0.85 - when countup finishes)
    const getThresholdScrollY = () => {
      // Use scrollHeight to get the natural height before we reduce it
      const containerHeight = container.scrollHeight || container.offsetHeight
      const windowHeight = window.innerHeight
      const scrollableHeight = Math.max(0, containerHeight - windowHeight)
      return scrollableHeight * 0.85
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        
        const scrollY = window.scrollY
        const thresholdScrollY = getThresholdScrollY()
        
        // Only clamp at top (prevent negative scroll)
        // Don't clamp at bottom - page height is set to threshold, so browser naturally stops
        if (scrollY < 0) {
          window.scrollTo({ top: 0, behavior: 'auto' })
          lastScrollY = 0
        } else {
          lastScrollY = scrollY
        }
        
        // Update video time only if we're within the video section
        if (scrollY <= thresholdScrollY) {
          updateVideoTime()
        }
        
        requestAnimationFrame(() => {
          ticking = false
        })
      }
    }
    
    // Prevent wheel scroll only at top (allow normal scrolling after threshold)
    const handleWheel = (e: WheelEvent) => {
      const scrollY = window.scrollY
      
      // Only prevent scrolling at top (allow normal scrolling after threshold through white section)
      if (scrollY <= 0 && e.deltaY < 0) {
        e.preventDefault()
        e.stopPropagation()
      }
      // Don't prevent scrolling after threshold - allow normal scrolling through white section
    }
    
    // Additional prevention: stop bounce on touch devices - only at top (allow normal scrolling after threshold)
    const preventBounce = (e: TouchEvent) => {
      const scrollY = window.scrollY
      
      // Only prevent bounce at top - allow normal scrolling after threshold through white section
      if (scrollY <= 0) {
        e.preventDefault()
        e.stopPropagation()
      }
      // Don't prevent bounce after threshold - allow normal scrolling
    }

    // Start animation loop immediately
    requestRef.current = requestAnimationFrame(animate)

    // Initial update
    updateVideoTime()

    window.addEventListener('scroll', handleScroll, { passive: false })
    // Prevent bounce on touch devices
    document.addEventListener('touchmove', preventBounce, { passive: false })
    // Prevent wheel scroll beyond bounds
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateDocumentHeight)
      window.removeEventListener('wheel', handleWheel)
      document.removeEventListener('touchmove', preventBounce)
      resizeObserver.disconnect()
      clearInterval(interval)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      // ALWAYS reset styles on cleanup - regardless of page
      // This ensures no styles persist when navigating away from trading page
      if (typeof document !== 'undefined') {
        document.body.style.height = ''
        document.body.style.minHeight = ''
        document.body.style.maxHeight = ''
        document.documentElement.style.height = ''
        document.documentElement.style.minHeight = ''
      }
    }
  }, [videoDuration, effectiveDuration, videoReady])

  // Calculate scroll height - precisely matched to effective (cropped) video duration
  // Video is cropped to be 5 seconds shorter, so scroll ends when video reaches effectiveDuration
  // Reduce base height to minimize black space after countup (0.85)
  const baseScrollHeight = effectiveDuration > 0 ? effectiveDuration * 20 : 200
  // Use 90% of base height to reduce black space while maintaining scroll functionality
  const scrollHeight = `${baseScrollHeight * 0.90}vh`

  // Expose containerRef to parent
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ 
        height: scrollHeight,
        // Ensure no extra spacing that could create dead scroll
        marginBottom: 0,
        paddingBottom: 0,
      }}
    >
      {/* Fixed video container with GPU acceleration - shows immediately, scrolls away after countup */}
      <motion.div 
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black overflow-hidden will-change-transform"
        style={{
          transform: scrollProgress > 0.85 
            ? `translateY(${(scrollProgress - 0.85) * -20}vh)` 
            : 'translateY(0)',
        }}
      >
        {/* Instant placeholder gradient that looks like ocean/water */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        
        {/* Video layer - fades in when ready */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: videoReady ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover will-change-transform"
            style={{ 
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              perspective: 1000
            }}
            playsInline
            muted
            preload="auto"
            src="/tanker-video.mp4"
          />
          
          {/* Subtle vignette overlay for cinematic effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/20" />
        </motion.div>

        {/* Subtle loading indicator - only shows while video loads, doesn't block experience */}
        {!videoReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 right-8 flex items-center gap-2 text-white/40"
          >
            <div className="w-3 h-3 border border-white/40 border-t-white/80 rounded-full animate-spin" />
            <span className="text-xs font-light tracking-wide">Loading video...</span>
          </motion.div>
        )}
      </motion.div>

      {/* Scroll indicator - visible from 0 to 0.20 */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{
          opacity: (() => {
            const progress = scrollProgress ?? 0
            // Show from 0 to 0.20, fade out between 0.19 and 0.20
            if (progress < 0.19) return 1
            if (progress >= 0.20) return 0
            // Fade out between 0.19 and 0.20
            const fadeProgress = (progress - 0.19) / (0.20 - 0.19)
            return 1 - fadeProgress
          })(),
        }}
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <p className="text-xs tracking-widest uppercase font-light">Scroll to explore</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer fixed at bottom - appears on top of video */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          opacity: footerOpacity,
          pointerEvents: footerOpacity > 0.1 ? 'auto' : 'none',
        }}
      >
        <SiteFooter />
      </div>
    </div>
  )
})

ScrollVideo.displayName = 'ScrollVideo'

export default ScrollVideo

