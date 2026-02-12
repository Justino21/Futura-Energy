"use client"

import { useEffect, useState, useRef } from "react"

interface Step {
  index: number
  text: string
}

interface ScrollDrivenProcedureProps {
  steps: string[]
}

export default function ScrollDrivenProcedure({ steps }: ScrollDrivenProcedureProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Get the parent container (the 300vh wrapper)
      const parent = containerRef.current.parentElement
      if (!parent) return
      
      const parentRect = parent.getBoundingClientRect()
      const parentTop = parentRect.top + window.scrollY
      const scrollY = window.scrollY
      
      // Calculate when section enters viewport and becomes pinned
      const pinStart = parentTop
      const pinEnd = parentTop + parentRect.height - windowHeight
      
      if (scrollY >= pinStart && scrollY <= pinEnd) {
        // Section is pinned - calculate scroll progress
        const scrollAmount = scrollY - pinStart
        const totalScrollDistance = pinEnd - pinStart
        const progress = Math.min(Math.max(scrollAmount / totalScrollDistance, 0), 1)
        
        setScrollProgress(progress)
        
        // Determine which step should be active based on scroll progress
        // Each step gets equal scroll distance
        const stepProgress = progress * steps.length
        const currentStep = Math.min(Math.floor(stepProgress), steps.length - 1)
        setActiveStepIndex(currentStep)
      } else if (scrollY < pinStart) {
        // Before pinning, show first step
        setScrollProgress(0)
        setActiveStepIndex(0)
      } else {
        // After pinning, show last step
        setScrollProgress(1)
        setActiveStepIndex(steps.length - 1)
      }
    }

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
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [steps.length])

  // Calculate step visibility and position - mechanical, restrained motion
  const getStepStyle = (index: number) => {
    const stepProgress = scrollProgress * steps.length
    const stepStart = index
    const stepEnd = index + 1
    const stepLocalProgress = Math.max(0, Math.min(1, (stepProgress - stepStart) / (stepEnd - stepStart)))
    
    const isActive = index === activeStepIndex
    const isPrevious = index < activeStepIndex
    const isNext = index > activeStepIndex
    
    let opacity = 0
    let translateY = 0
    
    if (isActive) {
      // Current step: fully visible, minimal vertical movement (10px max)
      opacity = 1
      // Slight upward movement as step becomes active (mechanical, not bouncy)
      translateY = -10 * (1 - stepLocalProgress)
    } else if (isPrevious) {
      // Previous steps: fade out and move up (restrained, 20px max)
      const distanceFromActive = activeStepIndex - index
      const fadeOutAmount = Math.min(1, distanceFromActive * 0.5)
      opacity = Math.max(0, 1 - fadeOutAmount)
      translateY = -20 * fadeOutAmount
    } else if (isNext) {
      // Next steps: fade in from below (restrained, 20px max)
      const distanceToActive = index - activeStepIndex
      const fadeInAmount = Math.min(1, (1 - distanceToActive * 0.5))
      opacity = Math.max(0, fadeInAmount)
      translateY = 20 * (1 - fadeInAmount)
    }
    
    // No transition - direct scroll control for mechanical feel
    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translateY(${translateY}px)`,
      willChange: 'opacity, transform',
    }
  }

  return (
    <div 
      ref={containerRef}
      className="sticky top-0 z-10"
    >
      <div className="bg-secondary/20 min-h-screen flex items-center justify-center py-16 px-8">
        <div className="mx-auto max-w-7xl w-full">
          <h2 className="text-2xl font-normal text-primary/80 mb-12 text-center">
            Business Procedure
          </h2>
          
          {/* Steps container - centered, single step visible at a time */}
          <div className="relative h-[400px] flex items-center justify-center">
            {steps.map((step, index) => (
              <div
                key={index}
                className="absolute w-full max-w-3xl"
                style={getStepStyle(index)}
              >
                <div className="flex items-start">
                  <span className="text-primary mr-4 font-medium text-lg min-w-[2rem]">
                    {index + 1}.
                  </span>
                  <p className="text-base text-foreground/70 leading-relaxed flex-1">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress indicator */}
          <div className="mt-12 flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-100 ${
                  index === activeStepIndex
                    ? 'w-8 bg-primary'
                    : index < activeStepIndex
                    ? 'w-2 bg-primary/40'
                    : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

