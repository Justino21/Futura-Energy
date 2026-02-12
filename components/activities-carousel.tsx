"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface Activity {
  title: string
  image: string
}

interface ActivitiesCarouselProps {
  activities: Activity[]
  isStatic?: boolean // If true, disable scroll-driven animations and always show fully
  scrollProgress?: number // 0 to 1, scroll progress from parent
}

export default function ActivitiesCarousel({ activities, isStatic = false, scrollProgress: externalScrollProgress }: ActivitiesCarouselProps) {
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const scrollAnimationRef = useRef<number | null>(null)
  // Start from the middle set (second copy) for seamless looping
  const [translateX, setTranslateX] = useState(isStatic ? 0 : -(400 + 12) * activities.length)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [opacity, setOpacity] = useState(isStatic ? 1 : 0)
  const [scale, setScale] = useState(isStatic ? 1 : 0.8)
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>(isStatic ? activities.slice(0, 4) : [])
  const [cardWidth, setCardWidth] = useState(400)
  const gap = 0 // No gap between images
  const cardWithGap = cardWidth + gap

  // Ensure component only runs client-side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate how many activities fit on screen and adjust card width
  useEffect(() => {
    if (!isMounted) return
    
    if (!isStatic) {
      setVisibleActivities(activities)
      return
    }

    if (typeof window === 'undefined') return

    const calculateFit = () => {
      if (typeof window === 'undefined') return
      const screenWidth = window.innerWidth
      // Limit to exactly 4 images for the quadrant layout
      const cardsToShow = 4
      const calculatedWidth = screenWidth / cardsToShow
      
      setCardWidth(calculatedWidth)
      setVisibleActivities(activities.slice(0, cardsToShow))
    }

    calculateFit()
    window.addEventListener('resize', calculateFit)
    return () => window.removeEventListener('resize', calculateFit)
  }, [activities, isStatic, isMounted])

  // Smooth easing function for magnetic feel
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeInOutCubic = (t: number) => 
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  useEffect(() => {
    // Skip scroll-driven animations if static
    if (isStatic) {
      setOpacity(1)
      setScale(1)
      setScrollProgress(1)
      return
    }

    const handleScroll = () => {
      if (!containerRef.current || typeof window === 'undefined') return

      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate when section enters viewport
      // Start animation when section top is at 70% of viewport height
      // End when section top is at 30% of viewport height
      const sectionTop = rect.top
      const triggerStart = windowHeight * 0.7
      const triggerEnd = windowHeight * 0.3
      
      // Calculate progress (0 to 1)
      let progress = 0
      if (sectionTop <= triggerStart && sectionTop >= triggerEnd) {
        // Section is in the trigger zone
        const distance = triggerStart - sectionTop
        const totalDistance = triggerStart - triggerEnd
        progress = Math.min(Math.max(distance / totalDistance, 0), 1)
      } else if (sectionTop < triggerEnd) {
        // Section has passed the trigger zone - fully animated
        progress = 1
      }
      
      // Apply easing for magnetic, smooth feel
      const easedProgress = easeOutCubic(progress)
      
      setScrollProgress(easedProgress)
      
      // Opacity: fade in smoothly (starts at 0.3 progress for faster appearance)
      setOpacity(Math.min(Math.max((progress - 0.2) * 1.25, 0), 1))
      
      // Scale: grow from 0.85 to 1.0 with magnetic easing
      setScale(0.85 + (easedProgress * 0.15))
    }

    // Initial check
    handleScroll()
    
    // Smooth scroll handler using requestAnimationFrame
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
    
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [isStatic])

  const startAnimation = () => {
    stopAnimation()
    
    const initialOffset = -(cardWithGap * activities.length)
    
    const animate = () => {
      setTranslateX((prev) => {
        const newValue = prev - 0.3 // Slow continuous movement (0.3px per frame)
        // Reset seamlessly when we've moved one full set of activities
        // Reset back to initial offset (middle set) for seamless loop
        if (newValue <= initialOffset - (cardWithGap * activities.length)) {
          return initialOffset
        }
        return newValue
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // Scroll-driven simultaneous animation - all images animate from corners to quadrants
  const [carouselScrollProgress, setCarouselScrollProgress] = useState(0)
  const [animationProgress, setAnimationProgress] = useState(0) // 0 to 1 for the corner-to-quadrant animation
  const [videoOpacity, setVideoOpacity] = useState(0) // Video overlay opacity
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const isSeekingRef = useRef(false)
  
  // Listen to external scroll progress changes
  useEffect(() => {
    if (externalScrollProgress !== undefined) {
      setCarouselScrollProgress(externalScrollProgress)
    }
  }, [externalScrollProgress])
  
  useEffect(() => {
    if (!isMounted || !isStatic || visibleActivities.length === 0) return

    // Animation starts when carousel becomes visible (0.23) and completes by 0.35
    const animationStart = 0.23
    const animationEnd = 0.35
    const animationRange = animationEnd - animationStart
    
    // Calculate animation progress (0 to 1)
    const progress = Math.max(0, Math.min(1, (carouselScrollProgress - animationStart) / animationRange))
    
    // Apply easing for smooth animation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easedProgress = easeOutCubic(progress)
    
    setAnimationProgress(easedProgress)
    
    // Video appears after images are set in place (after 0.35)
    const videoStart = 0.35
    const videoEnd = 1.0 // Video continues until end of scroll
    const videoSpeedMultiplier = 3 // Make video progress 3x faster
    if (carouselScrollProgress >= videoStart) {
      const scrollRange = videoEnd - videoStart
      const scrollProgress = (carouselScrollProgress - videoStart) / scrollRange
      // Apply multiplier to make video progress faster
      const videoProgress = Math.min(1, scrollProgress * videoSpeedMultiplier)
      
      // Video appears instantly at 0.35
      setVideoOpacity(1)
      
      // Map scroll progress to video time (with multiplier)
      if (videoRef.current && videoDuration > 0 && !isSeekingRef.current && !isNaN(videoProgress) && isFinite(videoProgress)) {
        const targetTime = Math.max(0, Math.min(videoDuration, videoProgress * videoDuration))
        const currentTime = videoRef.current.currentTime || 0
        const timeDifference = Math.abs(targetTime - currentTime)
        
        // Only seek if difference is significant (more than 0.1 seconds)
        if (timeDifference > 0.1 && !isNaN(targetTime) && isFinite(targetTime)) {
          try {
            isSeekingRef.current = true
            videoRef.current.currentTime = targetTime
          } catch (error) {
            console.error('Error seeking video:', error)
            isSeekingRef.current = false
          }
        }
      }
    } else {
      setVideoOpacity(0)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }, [isMounted, isStatic, visibleActivities.length, carouselScrollProgress, videoDuration])

  useEffect(() => {
    // If static, do not start carousel animation - keep it completely static
    if (isStatic) {
      stopAnimation()
      return () => {
        stopAnimation()
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && scrollProgress > 0.3) {
          startAnimation()
        } else {
          stopAnimation()
        }
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
      stopAnimation()
    }
  }, [scrollProgress, isStatic])

  // Duplicate activities for seamless loop (only if not static)
  const duplicatedActivities = isStatic ? visibleActivities : [...activities, ...activities, ...activities]

  // Don't render during SSR to prevent window access errors
  if (typeof window === 'undefined' || !isMounted) {
    return null
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full"
      style={{
        opacity: opacity,
        transform: isStatic ? 'none' : `scale(${scale})`,
        transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
        willChange: 'opacity, transform',
        position: isStatic ? 'fixed' : 'relative',
        top: isStatic ? 0 : 'auto',
        left: isStatic ? 0 : 'auto',
        right: isStatic ? 0 : 'auto',
        width: isStatic ? '100%' : 'auto',
        height: isStatic ? '40vh' : 'auto',
        zIndex: isStatic ? 40 : 'auto',
      }}
    >
      {/* Carousel Container */}
      <div 
        className="relative overflow-visible" 
        style={{ 
          height: isStatic ? '100vh' : 'auto', 
          minHeight: isStatic ? '100vh' : 'auto',
          width: '100%',
          position: isStatic ? 'fixed' : 'relative',
          top: isStatic ? 0 : 'auto',
          left: isStatic ? 0 : 'auto',
          right: isStatic ? 0 : 'auto',
        }}
      >
        {/* Video Overlay - appears after images are set in place */}
        {isStatic && (
            <video
              ref={videoRef}
              src="/final_chroma_trading.webm"
              className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: videoOpacity,
              zIndex: 50,
              pointerEvents: 'none',
              transition: 'opacity 0.5s ease-in-out',
            }}
            loop
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              const target = e.target as HTMLVideoElement
              console.error('Video load error:', {
                error: target.error,
                networkState: target.networkState,
                readyState: target.readyState,
                src: target.src,
                currentSrc: target.currentSrc
              })
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setVideoDuration(videoRef.current.duration)
                console.log('Video metadata loaded, duration:', videoRef.current.duration)
              }
            }}
            onSeeked={() => {
              isSeekingRef.current = false
            }}
            onSeeking={() => {
              isSeekingRef.current = true
            }}
            onCanPlay={() => {
              console.log('Video can play')
            }}
          />
        )}
        <div
          className="flex"
          style={{
            transform: isStatic ? 'none' : `translateX(calc(50% - 200px + ${translateX}px))`,
            willChange: isStatic ? "auto" : "transform",
            width: isStatic ? '100%' : 'auto',
          }}
        >
          {duplicatedActivities.map((activity, index) => {
            // Determine if this card is in the center viewport (for non-static mode)
            const centerOffset = translateX + (index - (isStatic ? visibleActivities.length : activities.length)) * cardWithGap
            const isInCenter = Math.abs(centerOffset) < cardWithGap / 2
            
            // For static mode, all images animate simultaneously from corners
            let imageOpacity = 0
            let imageScale = 0.3 // Start small
            let imageTransformX = 0
            let imageTransformY = 0
            
            if (isStatic && index < visibleActivities.length) {
              // All images fade in and scale up simultaneously
              imageOpacity = animationProgress
              imageScale = 0.3 + (animationProgress * 0.7) // Scale from 0.3 to 1.0
              
              // Calculate starting corner position and final quadrant position
              const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
              const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
              const navHeight = 80
              const halfHeight = (viewportHeight - navHeight) / 2
              
              // Starting positions (corners)
              let startX = 0
              let startY = 0
              
              // Final positions (quadrants)
              let finalX = 0
              let finalY = 0
              
              if (index === 0) {
                // Top-left: start from top-left corner, end at top-left quadrant
                startX = -viewportWidth * 0.3
                startY = -navHeight - halfHeight * 0.3
                finalX = 0
                finalY = 0
              } else if (index === 1) {
                // Top-right: start from top-right corner, end at top-right quadrant
                startX = viewportWidth * 0.3
                startY = -navHeight - halfHeight * 0.3
                finalX = 0
                finalY = 0
              } else if (index === 2) {
                // Bottom-left: start from bottom-left corner, end at bottom-left quadrant
                startX = -viewportWidth * 0.3
                startY = navHeight + halfHeight * 0.3
                finalX = 0
                finalY = 0
              } else if (index === 3) {
                // Bottom-right: start from bottom-right corner, end at bottom-right quadrant
                startX = viewportWidth * 0.3
                startY = navHeight + halfHeight * 0.3
                finalX = 0
                finalY = 0
              }
              
              // Interpolate between start and final positions
              imageTransformX = startX + (finalX - startX) * animationProgress
              imageTransformY = startY + (finalY - startY) * animationProgress
            }
            
            // Determine position based on image index
            // Each image fits into its corresponding quadrant (excluding nav menu)
            // Image 0: top left quadrant
            // Image 1: top right quadrant
            // Image 2: bottom left quadrant
            // Image 3: bottom right quadrant
            let imagePosition = 'auto'
            let imageTop = 'auto'
            let imageBottom = 'auto'
            
            if (isStatic && index < visibleActivities.length) {
              if (index === 0) {
                // First image: top left quadrant - extends to top
                imagePosition = '0%'
                imageTop = '0' // Start at very top to meet nav menu
                imageBottom = 'auto'
              } else if (index === 1) {
                // Second image: top right quadrant - extends to top
                imagePosition = '50%'
                imageTop = '0' // Start at very top to meet nav menu
                imageBottom = 'auto'
              } else if (index === 2) {
                // Third image: bottom left quadrant
                imagePosition = '0%'
                imageTop = 'calc(80px + (100vh - 80px) / 2)' // Start at horizontal divider
                imageBottom = 'auto'
              } else if (index === 3) {
                // Fourth image: bottom right quadrant
                imagePosition = '50%'
                imageTop = 'calc(80px + (100vh - 80px) / 2)' // Start at horizontal divider
                imageBottom = 'auto'
              }
            }
            
            // Image height: top images (0,1) extend to horizontal divider, bottom images (2,3) from divider to bottom
            const imageHeight = isStatic 
              ? (index === 0 || index === 1 
                  ? 'calc(80px + (100vh - 80px) / 2)' // Top images: from top to horizontal divider
                  : 'calc((100vh - 80px) / 2)') // Bottom images: from divider to bottom
              : 'auto'
            
            return (
              <div
                key={`${activity.title}-${index}`}
                className="flex-shrink-0"
                style={{ 
                  width: isStatic ? '50%' : `${cardWidth}px`,
                  position: isStatic ? 'absolute' : 'relative',
                  left: isStatic ? imagePosition : 'auto',
                  top: isStatic ? imageTop : 'auto',
                  bottom: isStatic ? imageBottom : 'auto',
                  height: isStatic ? imageHeight : 'auto',
                  right: isStatic && (index === 1 || index === 3) ? '0' : 'auto', // Ensure right images align to right edge
                }}
              >
                <div
                  className={`relative overflow-hidden ${
                    isStatic 
                      ? "w-full" 
                      : "h-[250px] md:h-[280px]"
                  } ${
                    isStatic 
                      ? "" 
                      : `transition-all duration-300 ${isInCenter ? "scale-100 opacity-100" : "scale-95 opacity-90"}`
                  }`}
                  style={{
                    opacity: isStatic ? imageOpacity : undefined,
                    transform: isStatic 
                      ? `translate(${imageTransformX}px, ${imageTransformY}px) scale(${imageScale})`
                      : undefined,
                    position: isStatic ? 'absolute' : 'relative',
                    top: isStatic ? 0 : 'auto',
                    left: isStatic ? 0 : 'auto',
                    right: isStatic ? 0 : 'auto',
                    bottom: isStatic ? 0 : 'auto',
                    width: isStatic ? '100%' : 'auto',
                    height: isStatic ? '100%' : 'auto',
                    zIndex: isStatic ? (imageOpacity > 0.1 ? 1 : 0) : 'auto',
                    transition: isStatic ? 'opacity 0.1s ease-out, transform 0.1s ease-out' : undefined,
                  }}
                >
                  {/* Image Section - Full Height */}
                  <div className="relative w-full h-full">
                    <Image
                      src={activity.image}
                      alt={activity.title}
                      fill
                      className={isStatic ? "object-cover" : "object-cover"}
                      style={{ 
                        opacity: 1,
                        filter: 'brightness(1.2) contrast(1.15) saturate(1.1)',
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                      }}
                      priority={index < 3}
                    />
                    {/* Glass Overlay */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    {/* Text Overlay - Centered on Image with same animation */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center p-6 z-10"
                      style={{
                        opacity: isStatic ? imageOpacity : undefined,
                        transform: isStatic 
                          ? `translate(${imageTransformX}px, ${imageTransformY}px) scale(${imageScale})`
                          : undefined,
                        transition: isStatic ? 'opacity 0.1s ease-out, transform 0.1s ease-out' : undefined,
                        // Adjust vertical position for top images (0 and 1) to account for nav bar
                        paddingTop: isStatic && (index === 0 || index === 1) ? 'calc(40px + 1.5rem)' : undefined,
                      }}
                    >
                      <div className="text-center">
                        <div className="hero-title-serif text-2xl md:text-3xl lg:text-4xl font-normal text-white leading-relaxed drop-shadow-lg" style={{ fontWeight: 400, letterSpacing: '0.05em' }}>
                          {activity.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

