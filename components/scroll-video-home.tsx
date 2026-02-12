"use client"

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ScrollVideoHomeProps {
  videoSrc: string
}

export default function ScrollVideoHome({ videoSrc }: ScrollVideoHomeProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [videoDuration, setVideoDuration] = useState(10)
  const [hasError, setHasError] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const requestRef = useRef<number>()
  const currentTimeRef = useRef(0)
  const targetTimeRef = useRef(0)
  const isSeekingRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    console.log('🔄 Initializing video:', videoSrc)

    const handleLoadedMetadata = () => {
      const duration = video.duration ?? 10
      console.log('✅ Metadata loaded, duration:', duration)
      if (duration > 0 && !isNaN(duration) && isFinite(duration)) {
        setVideoDuration(duration)
        video.currentTime = 0
        currentTimeRef.current = 0
        // Show video immediately when metadata loads
        setVideoReady(true)
      }
    }

    const handleCanPlay = () => {
      console.log('✅ Video can play')
      setVideoReady(true)
    }

    const handleCanPlayThrough = () => {
      console.log('✅ Video can play through')
      setVideoReady(true)
    }

    const handleLoadedData = () => {
      console.log('✅ Video data loaded')
      setVideoReady(true)
    }

    const handleError = (e: Event) => {
      console.error('❌ Video error event:', e)
      const error = (video as any).error
      if (error) {
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        setHasError(true)
      } else {
        setHasError(true)
      }
    }

    const handleSeeked = () => {
      isSeekingRef.current = false
    }

    const handleSeeking = () => {
      isSeekingRef.current = true
    }

    // Reset states
    setVideoReady(false)
    setHasError(false)
    setVideoDuration(10)

    // Add all event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('canplaythrough', handleCanPlayThrough)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('seeking', handleSeeking)

    // Set video properties - ensure it doesn't auto-play
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.autoplay = false // Explicitly disable autoplay
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')
    video.setAttribute('autoplay', 'false')
    
    // Set source
    video.src = videoSrc
    
    console.log('🔄 Calling video.load()')
    video.load()
    
    // Explicitly pause the video - it should only seek, not play
    video.pause()
    
    // DO NOT auto-play - video will only advance on scroll

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('canplaythrough', handleCanPlayThrough)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('seeking', handleSeeking)
    }
  }, [videoSrc])

  useEffect(() => {
    if (!videoRef.current || !containerRef.current) return
    if (!videoReady && videoDuration === 10) return

    const video = videoRef.current
    const container = containerRef.current

    // Cache values to avoid repeated calculations
    let cachedContainerHeight = 0
    let cachedWindowHeight = window.innerHeight
    let cachedScrollableHeight = 0

    // Ultra-smooth continuous mapping - minimal video advance per scroll
    const updateVideoTime = () => {
      if (!videoReady || videoDuration === 0) return

      const scrollY = window.scrollY
      const containerHeight = container.offsetHeight
      const windowHeight = window.innerHeight
      
      // Only recalculate if values changed
      if (containerHeight !== cachedContainerHeight || windowHeight !== cachedWindowHeight) {
        cachedContainerHeight = containerHeight
        cachedWindowHeight = windowHeight
        cachedScrollableHeight = Math.max(0, containerHeight - windowHeight)
      }
      
      if (cachedScrollableHeight <= 0) {
        if (video.currentTime !== 0) {
          video.currentTime = 0
        }
        setScrollProgress(0)
        return
      }

      // Continuous smooth mapping - very small video advance per scroll
      const scrollFraction = Math.max(0, Math.min(1, scrollY / cachedScrollableHeight))
      const targetTime = scrollFraction * videoDuration
      
      // Update scroll progress for text fade
      setScrollProgress(scrollFraction)
      
      // Seek with minimal threshold for ultra-smooth progression
      if (!isSeekingRef.current && !isNaN(targetTime) && isFinite(targetTime)) {
        try {
          // Only seek if time changed by a very small amount (for smoothness)
          if (Math.abs(video.currentTime - targetTime) > 0.001) {
            if (!video.paused) {
              video.pause()
            }
            video.currentTime = targetTime
            currentTimeRef.current = targetTime
            if (!video.paused) {
              video.pause()
            }
          }
        } catch (error) {
          // Silent fail
        }
      }
    }

    // Immediate scroll handler - no throttling, no delays
    const handleScroll = () => {
      updateVideoTime()
    }

    // Immediate resize handler - no throttling for zero lag
    const handleResize = () => {
      cachedContainerHeight = 0 // Force recalculation
      cachedWindowHeight = window.innerHeight
      updateVideoTime()
    }

    // Initial update
    updateVideoTime()

    // Use requestAnimationFrame for continuous smooth updates
    const rafScroll = () => {
      updateVideoTime()
      requestRef.current = requestAnimationFrame(rafScroll)
    }
    
    // Start RAF loop for smooth updates
    requestRef.current = requestAnimationFrame(rafScroll)

    // Also listen to scroll events for immediate response
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [videoReady, videoDuration])

  // Large scroll height for minimal video advance per scroll (ultra-smooth)
  const baseScrollHeight = videoDuration > 0 ? videoDuration * 50 : 500
  const scrollHeight = `${baseScrollHeight}vh`

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ 
        height: scrollHeight,
        marginBottom: 0,
        paddingBottom: 0,
      }}
    >
      <motion.div 
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black overflow-hidden will-change-transform"
        style={{
          transform: 'translateY(0)',
        }}
      >
        {/* Gradient placeholder */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          style={{
            opacity: videoReady ? 0 : 1,
            transition: 'opacity 0.6s ease-out'
          }}
        />
        
        {/* Video layer */}
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
              perspective: 1000,
              display: 'block',
              filter: 'brightness(1.2)',
            }}
            playsInline
            muted
            preload="auto"
            autoPlay={false}
            src={videoSrc}
            onPlay={(e) => {
              // Prevent any auto-play - pause immediately if it tries to play
              console.log('⚠️ Video tried to play, pausing...')
              e.currentTarget.pause()
            }}
            onError={(e) => {
              console.error('❌ Video error in element:', e)
              setHasError(true)
            }}
            onLoadedMetadata={(e) => {
              const duration = e.currentTarget.duration
              console.log('✅ onLoadedMetadata - duration:', duration)
              if (duration > 0) {
                const video = e.currentTarget
                setVideoDuration(duration)
                setVideoReady(true)
                video.currentTime = 0
                // Explicitly pause to prevent auto-play
                video.pause()
              }
            }}
            onCanPlay={() => {
              console.log('✅ onCanPlay')
              setVideoReady(true)
            }}
            onLoadedData={() => {
              console.log('✅ onLoadedData')
              setVideoReady(true)
            }}
          />
          
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/20" />
        </motion.div>

        {/* Title and Subtitle - Left aligned with glass container - Fade out as user scrolls */}
        <motion.div
          className="fixed top-1/2 left-8 md:left-16 lg:left-24 -translate-y-1/2 z-40 pointer-events-none max-w-2xl"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 3), // Fade out in first third of scroll
          }}
        >
          <div 
            className="backdrop-blur-md bg-black/40 rounded-lg p-6 md:p-8 lg:p-10 border border-white/10"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <h1 className="hero-title-serif text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 md:mb-6">
              Energy Trading & Logistics
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-normal text-white/95 leading-relaxed">
              A group of companies primarily active in the trading of crude oil and refined products. With operations across Europe, Africa, Middle East and Latin America.
            </p>
          </div>
        </motion.div>

        {/* Error message */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white z-50 p-8">
            <p className="text-red-500 mb-4 text-xl">❌ Video Error</p>
            <p className="text-sm text-gray-300 mb-2">
              The video format (.mov) may not be supported in this browser.
            </p>
            <p className="text-xs text-gray-400">
              Please convert Futura_Home_Final.mov to .mp4 format
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {!videoReady && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-8 right-8 flex items-center gap-2 text-white/40 z-40"
          >
            <div className="w-3 h-3 border border-white/40 border-t-white/80 rounded-full animate-spin" />
            <span className="text-xs font-light tracking-wide">Loading video...</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
