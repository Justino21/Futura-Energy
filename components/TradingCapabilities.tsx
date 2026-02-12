"use client"

import { useLayoutEffect, useRef, useEffect, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

const DEBUG = false

interface TradingCapabilitiesProps {
  shouldFadeInTitle?: boolean // When true, title fades in immediately
}

const capabilities = [
  {
    title: "Crude oil trading",
    text: "Physical crude oil trading across established international markets, supported by structured execution and risk controls.",
  },
  {
    title: "Refined petroleum product trading",
    text: "Trading of refined petroleum products including ULSD, fuel oil, gasoline, HSGO and VGO, serving industrial and commercial demand.",
  },
  {
    title: "Shipping and freight optimization",
    text: "Optimization of shipping and freight solutions to support efficient delivery across key trading corridors.",
  },
  {
    title: "Storage management",
    text: "Utilization of strategically located storage capacity to support trading flows and operational flexibility.",
  },
  {
    title: "Hedging and risk management",
    text: "Application of hedging strategies and risk management practices to support disciplined trading execution.",
  },
]

export default function TradingCapabilities({ shouldFadeInTitle = false }: TradingCapabilitiesProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const accentLineRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  
  // Fade in title when trading volumes disappear
  useEffect(() => {
    if (shouldFadeInTitle && titleRef.current) {
      // Immediately fade in the title when trading volumes disappear
      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        immediateRender: false,
      })
    } else if (!shouldFadeInTitle && titleRef.current) {
      // Reset to invisible if trading volumes are still visible
      gsap.set(titleRef.current, { opacity: 0, y: 20 })
    }
  }, [shouldFadeInTitle])

  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    if (!sectionRef.current || !pinRef.current || !triggerRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    // Clear any existing triggers for this section
    ScrollTrigger.getAll().forEach((t: any) => {
      if (t.vars && t.vars.id === "trading-capabilities") {
        t.kill()
      }
    })

    const ctx = gsap.context(() => {
      const viewportHeight = window.innerHeight

      // Get card elements
      const cardElements = cardsRef.current?.querySelectorAll(".capability-card")

      // Set initial states for animation
      // If shouldFadeInTitle is true, title starts invisible and will fade in via useEffect
      // Otherwise, title is visible and will animate via GSAP ScrollTrigger
      if (titleRef.current) {
        if (shouldFadeInTitle) {
          // Start invisible - useEffect will fade it in
          gsap.set(titleRef.current, { opacity: 0, y: 20 })
        } else {
          // Start visible for GSAP animation
          gsap.set(titleRef.current, { opacity: 1, y: 30 })
        }
      }
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 1, y: 20 })
      }
      if (accentLineRef.current) {
        gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: "left center" })
      }
      if (cardElements) {
        cardElements.forEach((card) => {
          gsap.set(card, {
            opacity: 1,
            y: 20,
            scale: 0.98,
          })
        })
      }

      // Create main timeline with pinning
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "trading-capabilities",
          trigger: triggerRef.current,
          start: "top top",
          end: () => `+=${viewportHeight}`,
          pin: pinRef.current,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: DEBUG,
          onEnter: () => {
            // Content should start animating when section enters
          },
          onLeave: () => {
            // Ensure content is fully visible when leaving
            if (titleRef.current) gsap.set(titleRef.current, { opacity: 1, y: 0 })
            if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 1, y: 0 })
            if (accentLineRef.current) gsap.set(accentLineRef.current, { scaleX: 1 })
            if (cardElements) {
              cardElements.forEach((card) => {
                gsap.set(card, { opacity: 1, y: 0, scale: 1 })
              })
            }
          },
        },
      })

      // Animate title and subtitle - only if shouldFadeInTitle is false
      // If shouldFadeInTitle is true, the useEffect handles the fade-in immediately
      if (titleRef.current && !shouldFadeInTitle) {
        tl.to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          0
        )
      }

      if (subtitleRef.current) {
        tl.to(
          subtitleRef.current,
          {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          0.05
        )
      }

      if (accentLineRef.current) {
        tl.fromTo(
          accentLineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 0.25,
            ease: "power2.out",
          },
          0.1
        )
      }

      // Animate cards in stagger - keep opacity at 1, only animate y and scale
      if (cardElements && cardElements.length > 0) {
        cardElements.forEach((card, index) => {
          const startTime = 0.15 + index * 0.12
          tl.to(
            card,
            {
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: "power2.out",
            },
            startTime
          )
        })
      }

      // Refresh ScrollTrigger to ensure it's properly initialized
      ScrollTrigger.refresh()
    })

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((t: any) => {
        if (t.vars && t.vars.id === "trading-capabilities") {
          t.kill()
        }
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-white w-full"
      style={{
        minHeight: "100vh",
        position: "relative",
        zIndex: 10, // Lower z-index so it doesn't cover the hero section
        width: "100%",
        display: "block",
      }}
    >
      <div ref={triggerRef} className="w-full" style={{ position: "relative" }}>
        <div
          ref={pinRef}
          className="w-full min-h-screen flex items-center py-24 md:py-32"
        >
          <div className="mx-auto w-full max-w-7xl px-8 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column: Title, Subtitle, Accent Line */}
              <div className="space-y-6">
                <h2
                  ref={titleRef}
                  className="text-4xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight"
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    opacity: shouldFadeInTitle ? 0 : 1, // Start invisible if we're fading it in
                    color: "var(--foreground)",
                    transform: shouldFadeInTitle ? "translateY(20px)" : "translateY(0px)",
                  }}
                >
                  Trading capabilities
                </h2>
                <p
                  ref={subtitleRef}
                  className="text-lg md:text-xl text-foreground/70 leading-relaxed"
                  style={{
                    opacity: 1, // Fallback: visible by default
                    color: "var(--foreground)",
                  }}
                >
                  Structured execution across crude oil and refined petroleum product markets.
                </p>
                <div
                  ref={accentLineRef}
                  className="h-0.5 w-16 bg-primary"
                  style={{
                    backgroundColor: "oklch(0.45 0.12 240)",
                    transform: "scaleX(1)", // Fallback: visible by default
                  }}
                />
              </div>

              {/* Right Column: Cards Grid */}
              <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {capabilities.map((capability, index) => (
                  <div
                    key={index}
                    className="capability-card bg-white border border-border/50 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                    style={{
                      opacity: 1, // Fallback: visible by default
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Simple icon placeholder - circle with line */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <div className="w-1 h-6 bg-primary rounded-full" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg md:text-xl font-medium text-foreground">
                          {capability.title}
                        </h3>
                        <p className="text-sm md:text-base text-foreground/70 leading-relaxed">
                          {capability.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

