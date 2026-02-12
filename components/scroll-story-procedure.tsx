"use client"

import { useEffect, useState, useRef } from "react"

interface ScrollStoryProcedureProps {
  steps: string[]
}

export default function ScrollStoryProcedure({ steps }: ScrollStoryProcedureProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return

      const wrapper = wrapperRef.current
      const windowHeight = window.innerHeight
      const scrollY = window.scrollY
      
      // Get wrapper position relative to document (FIXED: use getBoundingClientRect for accuracy)
      const rect = wrapper.getBoundingClientRect()
      const wrapperTop = rect.top + scrollY // Document-relative top position
      const wrapperHeight = wrapper.offsetHeight // Total wrapper height (400vh)
      
      // APPLE-STYLE PINNED SCROLL SCENE CALCULATION:
      // - progressStart: when wrapper top reaches viewport top (sticky activates)
      // - scrollDistance: how much we need to scroll through the wrapper (wrapperHeight - viewport)
      // - progressEnd: when we've scrolled through the full scroll distance
      // - During this period, the sticky container stays fixed
      const progressStart = wrapperTop
      const scrollDistance = wrapperHeight - windowHeight // Scroll space: 400vh - 100vh = 300vh
      const progressEnd = progressStart + scrollDistance
      
      let progress = 0
      if (scrollY >= progressStart && scrollY <= progressEnd) {
        // We're in the pinned scroll zone - calculate progress 0→1
        progress = (scrollY - progressStart) / scrollDistance
      } else if (scrollY > progressEnd) {
        // Past the pinned zone - story complete, progress = 1
        progress = 1
      } else if (scrollY < progressStart) {
        // Before pinned zone - progress = 0
        progress = 0
      }
      
      progress = Math.max(0, Math.min(1, progress))
      setScrollProgress(progress)
      
      // Determine active step based on progress
      // Each step gets equal portion: 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
      const stepProgress = progress * steps.length
      const currentStep = Math.min(Math.floor(stepProgress), steps.length - 1)
      setActiveStepIndex(currentStep)
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
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [steps.length])

  // Calculate step visibility and position
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
      // Current step: fully visible, slight upward movement
      opacity = 1
      translateY = -12 * (1 - stepLocalProgress)
    } else if (isPrevious) {
      // Previous steps: fade out and move up
      const distanceFromActive = activeStepIndex - index
      opacity = Math.max(0, 1 - distanceFromActive * 0.4)
      translateY = -24 * (1 - opacity)
    } else if (isNext) {
      // Next steps: fade in from below
      const distanceToActive = index - activeStepIndex
      opacity = Math.max(0, 1 - distanceToActive * 0.4)
      translateY = 24 * (1 - opacity)
    }
    
    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translateY(${translateY}px)`,
      willChange: 'opacity, transform',
    }
  }

  // Get right panel content for each step
  const getPanelContent = (index: number) => {
    const panels = [
      // Step 1: Supplier engagement
      { type: 'illustration', content: 'supplier' },
      // Step 2: FOB ports
      { type: 'illustration', content: 'ports' },
      // Step 3: Loading & LC
      { type: 'illustration', content: 'loading' },
      // Step 4: Delivery
      { type: 'illustration', content: 'delivery' },
      // Step 5: Payment
      { type: 'illustration', content: 'payment' },
    ]
    return panels[index] || panels[0]
  }

  // Mobile: show stacked steps (graceful degradation)
  if (isMobile) {
    return (
      <section className="py-16 px-8 bg-secondary/20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-normal text-primary/80 mb-8 text-center">
            Business Procedure
          </h2>
          <ol className="space-y-6 max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <li key={index} className="text-base text-foreground/70 leading-relaxed flex">
                <span className="text-primary mr-3 font-medium min-w-[2rem]">
                  {index + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <div 
      ref={wrapperRef}
      className="relative"
      style={{ height: '400vh' }} // 4 viewport heights for scroll space
    >
      {/* Sticky container - stays fixed while scrolling through wrapper */}
      {/* This container pins to top and stays there for the entire wrapper scroll */}
      <div 
        className="sticky top-0 h-screen overflow-hidden bg-secondary/20"
        style={{ zIndex: 10 }}
      >
        {/* Subtle parallax background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(11, 31, 51, 0.1) 0%, transparent 70%)',
            transform: `translateY(${scrollProgress * 30}px)`,
            willChange: 'transform',
          }}
        />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
          {/* Section Title */}
          <div className="absolute top-16 left-0 right-0 text-center">
            <h2 className="text-2xl font-normal text-primary/80">
              Business Procedure
            </h2>
          </div>
          <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Step content */}
            <div className="relative h-[400px] flex items-center">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="absolute w-full"
                  style={getStepStyle(index)}
                >
                  <div className="space-y-4">
                    <div className="text-6xl md:text-7xl font-light text-primary/20 mb-4">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <p className="text-xl md:text-2xl font-light text-foreground/80 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side: Changing panel */}
            <div className="relative h-[400px] flex items-center justify-center">
              {steps.map((step, index) => {
                const panel = getPanelContent(index)
                const style = getStepStyle(index)
                const isActive = index === activeStepIndex
                
                return (
                  <div
                    key={index}
                    className="absolute w-full h-full flex items-center justify-center"
                    style={style}
                  >
                    <div 
                      className="w-full h-[300px] bg-white/5 border border-border/30 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-300"
                      style={{
                        borderColor: isActive ? 'rgba(11, 31, 51, 0.4)' : 'rgba(229, 231, 235, 0.3)',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      <div className="text-center space-y-3">
                        <div className="text-xs uppercase tracking-wider text-foreground/50 font-medium">
                          {panel.content === 'supplier' && 'Step 1'}
                          {panel.content === 'ports' && 'Step 2'}
                          {panel.content === 'loading' && 'Step 3'}
                          {panel.content === 'delivery' && 'Step 4'}
                          {panel.content === 'payment' && 'Step 5'}
                        </div>
                        <div className="text-sm text-foreground/60 font-light">
                          {panel.content === 'supplier' && 'Supplier Engagement'}
                          {panel.content === 'ports' && 'FOB Baltic & Black Sea'}
                          {panel.content === 'loading' && 'Loading & LC Opening'}
                          {panel.content === 'delivery' && 'Delivery 15–40 Days'}
                          {panel.content === 'payment' && 'Payment per LC'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Progress indicator - vertical bar on the right */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
            {steps.map((_, index) => {
              const stepProgress = scrollProgress * steps.length
              const stepStart = index
              const stepEnd = index + 1
              const isActive = index === activeStepIndex
              const isPast = index < activeStepIndex
              
              let height = '4px'
              if (isActive) {
                // Active step: height based on local progress
                const localProgress = Math.max(0, Math.min(1, (stepProgress - stepStart) / (stepEnd - stepStart)))
                height = `${20 + localProgress * 40}px`
              } else if (isPast) {
                height = '20px'
              }
              
              return (
                <div
                  key={index}
                  className="w-1 bg-border rounded-full transition-all duration-100"
                  style={{
                    height: isActive ? height : '4px',
                    backgroundColor: isActive || isPast ? 'rgb(11, 31, 51)' : 'rgb(229, 231, 235)',
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

