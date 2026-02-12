"use client"

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [videoDuration, setVideoDuration] = useState(10) // Default duration for immediate scroll
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
      video.currentTime = 0
      currentTimeRef.current = 0
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

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const updateVideoTime = () => {
      const scrollY = window.scrollY
      const containerHeight = container.offsetHeight
      const windowHeight = window.innerHeight
      const scrollableHeight = containerHeight - windowHeight
      
      if (scrollableHeight <= 0) return

      // Map scroll position to video time with higher precision
      const scrollFraction = Math.max(0, Math.min(1, scrollY / scrollableHeight))
      targetTimeRef.current = scrollFraction * videoDuration
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

      const newTime = lerp(currentTime, targetTime, lerpFactor)
      
      // Only update if video is ready and difference is meaningful
      if (videoReady && diff > 0.001 && !isSeekingRef.current) {
        video.currentTime = newTime
        currentTimeRef.current = newTime
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        updateVideoTime()
        requestAnimationFrame(() => {
          ticking = false
        })
      }
    }

    // Start animation loop immediately
    requestRef.current = requestAnimationFrame(animate)

    // Initial update
    updateVideoTime()

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [videoDuration, videoReady])

  // Calculate scroll height based on video duration (30vh per second of video for more dynamic feel)
  const scrollHeight = videoDuration > 0 ? `${videoDuration * 30}vh` : '200vh'

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ height: scrollHeight }}
    >
      {/* Fixed video container with GPU acceleration - shows immediately */}
      <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black overflow-hidden will-change-transform">
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
      </div>

      {/* Scroll indicator - shows immediately */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
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
    </div>
  )
}
