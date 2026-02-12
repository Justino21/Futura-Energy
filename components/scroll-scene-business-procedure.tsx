"use client"

import { useRef, useLayoutEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

interface ScrollSceneBusinessProcedureProps {
  steps: string[]
}

// Parse step data into structured format for Apple-style presentation
const getStepData = (step: string, index: number) => {
  const stepData = [
    {
      title: "Supplier Engagement",
      sentence: "Working with major suppliers including GPN, Surgut, Tatneft, and Taif.",
      details: "Prepayment terms established",
    },
    {
      title: "FOB Ports",
      sentence: "Loading at strategic Baltic and Black Sea ports.",
      details: "Optimized port selection",
    },
    {
      title: "Loading & LC",
      sentence: "Loading and letter of credit opening from the receiver.",
      details: "Documentation and logistics coordination",
    },
    {
      title: "Delivery",
      sentence: "Delivery within 15–40 days depending on destination.",
      details: "Flexible delivery windows",
    },
    {
      title: "Payment",
      sentence: "Payment per letter of credit terms.",
      details: "30–45 days depending on client",
    },
  ]
  return stepData[index] || { title: `Step ${index + 1}`, sentence: step, details: "" }
}

export default function ScrollSceneBusinessProcedure({ steps }: ScrollSceneBusinessProcedureProps) {
  const sceneWrapperRef = useRef<HTMLDivElement>(null)
  const sceneStickyRef = useRef<HTMLDivElement>(null)
  const leftContentRefs = useRef<(HTMLDivElement | null)[]>([])
  const rightContentRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressIndicatorRefs = useRef<(HTMLDivElement | null)[]>([])
  const backgroundGradientRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<any>(null)

  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    if (!sceneWrapperRef.current || !sceneStickyRef.current) return

    gsap.registerPlugin(ScrollTrigger)
    const wrapper = sceneWrapperRef.current
    const sticky = sceneStickyRef.current

    // Create GSAP timeline for the scroll-scrubbed animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        pin: sticky,
        start: "top top",
        end: "+=4000", // 4000px of scroll (tunable)
        scrub: true, // Smooth scrubbing tied to scroll
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

    // Animate each step (5 steps total)
    steps.forEach((_, index) => {
      const stepStart = index / steps.length
      const stepEnd = (index + 1) / steps.length
      const stepCenter = (stepStart + stepEnd) / 2

      // Left content animations
      const leftContent = leftContentRefs.current[index]
      if (leftContent) {
        // Opacity: fade in at step start, fade out at step end
        const fadeInStart = stepStart + 0.1
        const fadeInEnd = stepStart + 0.2
        const fadeOutStart = stepEnd - 0.2
        const fadeOutEnd = stepEnd - 0.1

        tl.fromTo(
          leftContent,
          {
            opacity: 0,
            y: 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: fadeInEnd - fadeInStart,
            ease: "none",
          },
          fadeInStart
        )
          .to(
            leftContent,
            {
              opacity: 0,
              y: -8,
              duration: fadeOutEnd - fadeOutStart,
              ease: "none",
            },
            fadeOutStart
          )
      }

      // Right panel animations
      const rightContent = rightContentRefs.current[index]
      if (rightContent) {
        const fadeInStart = stepStart + 0.1
        const fadeInEnd = stepStart + 0.2
        const fadeOutStart = stepEnd - 0.2
        const fadeOutEnd = stepEnd - 0.1

        tl.fromTo(
          rightContent,
          {
            opacity: 0,
            y: 20,
            scale: 0.99,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: fadeInEnd - fadeInStart,
            ease: "none",
          },
          fadeInStart
        )
          .to(
            rightContent,
            {
              opacity: 0,
              y: -10,
              scale: 0.99,
              duration: fadeOutEnd - fadeOutStart,
              ease: "none",
            },
            fadeOutStart
          )
      }

      // Progress indicator animations
      const progressIndicator = progressIndicatorRefs.current[index]
      if (progressIndicator) {
        // Active when in center 60% of segment
        const activeStart = stepStart + 0.1
        const activeEnd = stepEnd - 0.1

        tl.fromTo(
          progressIndicator,
          {
            opacity: 0.15,
            scale: 1,
          },
          {
            opacity: 1,
            scale: 1.2,
            duration: activeStart - stepStart,
            ease: "none",
          },
          stepStart
        )
          .to(
            progressIndicator,
            {
              opacity: 0.3,
              scale: 1,
              duration: stepEnd - activeEnd,
              ease: "none",
            },
            activeEnd
          )
      }
    })

    // Background gradient animation
    if (backgroundGradientRef.current) {
      tl.fromTo(
        backgroundGradientRef.current,
        {
          opacity: 0.3,
        },
        {
          opacity: 0.5,
          duration: 1,
          ease: "none",
        },
        0
      )
    }

    // Cleanup
    return () => {
      if (!scrollTriggerRef.current) return
      const ScrollTrigger = scrollTriggerRef.current
      ScrollTrigger.getAll().forEach((trigger: any) => {
        if (trigger.vars.trigger === wrapper) {
          trigger.kill()
        }
      })
    }
  }, [steps.length])

  return (
    <section
      ref={sceneWrapperRef}
      className="relative"
      style={{ height: '600vh' }} // Scroll space: 6 viewport heights
    >
      {/* Sticky container - pinned by GSAP ScrollTrigger */}
      <div
        ref={sceneStickyRef}
        className="h-screen overflow-hidden bg-secondary/10"
        style={{ zIndex: 10 }}
      >
        {/* Subtle shifting background gradient */}
        <div
          ref={backgroundGradientRef}
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(243, 244, 246, 1) 0%, rgba(255, 255, 255, 1) 100%)',
            opacity: 0.3,
          }}
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 lg:px-16">
          {/* Section Title - positioned at top */}
          <div className="absolute top-20 left-0 right-0 text-center mb-16">
            <h2 className="text-2xl font-normal text-primary/80 tracking-tight">
              Business Procedure
            </h2>
          </div>

          {/* Main content grid - generous spacing */}
          <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center pt-24">
            {/* LEFT: Large step title + sentence + micro-details */}
            <div className="relative h-[500px] flex items-center">
              {steps.map((step, index) => {
                const stepData = getStepData(step, index)
                return (
                  <div
                    key={index}
                    ref={(el) => {
                      leftContentRefs.current[index] = el
                    }}
                    className="absolute w-full"
                    style={{
                      opacity: 0,
                      transform: 'translateY(16px)',
                    }}
                  >
                    <div className="space-y-8">
                      {/* Large step title */}
                      <h3 className="text-5xl md:text-6xl font-light text-primary tracking-tight leading-none">
                        {stepData.title}
                      </h3>

                      {/* Soft separator */}
                      <div className="h-px w-16 bg-border/40" />

                      {/* Main sentence - generous line height */}
                      <p className="text-xl md:text-2xl font-light text-foreground/70 leading-relaxed max-w-lg">
                        {stepData.sentence}
                      </p>

                      {/* Micro-details - smaller, muted */}
                      {stepData.details && (
                        <p className="text-sm text-foreground/50 font-light tracking-wide uppercase">
                          {stepData.details}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* RIGHT: Minimal premium visual panel */}
            <div className="relative h-[500px] flex items-center justify-center">
              {steps.map((step, index) => {
                const stepData = getStepData(step, index)
                return (
                  <div
                    key={index}
                    ref={(el) => {
                      rightContentRefs.current[index] = el
                    }}
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{
                      opacity: 0,
                      transform: 'translateY(20px) scale(0.99)',
                    }}
                  >
                    {/* Minimal premium card - no busy elements */}
                    <div className="w-full max-w-md h-[360px] bg-white/40 backdrop-blur-sm border border-border/20 rounded-2xl flex flex-col items-center justify-center p-12 shadow-sm">
                      <div className="text-center space-y-6">
                        {/* Step number - very subtle */}
                        <div className="text-xs font-light text-foreground/40 tracking-[0.2em] uppercase">
                          Step {index + 1}
                        </div>

                        {/* Visual separator */}
                        <div className="h-px w-12 bg-primary/20 mx-auto" />

                        {/* Panel title - clean and minimal */}
                        <h4 className="text-2xl font-light text-foreground/80 tracking-tight">
                          {stepData.title}
                        </h4>

                        {/* Subtle description */}
                        <p className="text-sm text-foreground/50 font-light leading-relaxed max-w-xs mx-auto">
                          {stepData.details}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vertical progress indicator - Apple-style thin bar */}
          <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
            {steps.map((_, index) => (
              <div
                key={index}
                ref={(el) => {
                  progressIndicatorRefs.current[index] = el
                }}
                className="w-1 h-8 bg-primary/30 rounded-full"
                style={{
                  opacity: 0.15,
                  transform: 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
