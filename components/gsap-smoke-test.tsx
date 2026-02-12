"use client"

import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

export default function GsapSmokeTest() {
  const pinRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const scrollTriggerInstance = useRef<any>(null)
  const [scrollTriggerReady, setScrollTriggerReady] = useState(false)

  // Step 1: Confirm component mounts and register plugin
  useLayoutEffect(() => {
    console.log("GSAP SMOKE TEST MOUNTED ✅")
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)
    setScrollTriggerReady(true)
  }, [])

  // Step 2: Test basic GSAP animation (uncomment to test)
  // useLayoutEffect(() => {
  //   if (boxRef.current) {
  //     gsap.to(boxRef.current, { x: 200, duration: 1, repeat: -1, yoyo: true })
  //   }
  // }, [])

  // Step 3 & 4: Test ScrollTrigger with cleanup
  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    if (!scrollTriggerReady) return
    
      const pin = pinRef.current
      const box = boxRef.current
      
      if (!pin || !box) {
        console.warn("GSAP SMOKE TEST: Pin or box ref not found")
        return
      }

      // Kill any existing triggers for this element
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars && (t.vars as any).trigger === pin) {
          try {
            t.kill()
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      })

      try {
        const ctx = gsap.context(() => {
          const st = gsap.to(box, {
            rotate: 360,
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: "+=1000",
              scrub: true,
              pin: true,
              markers: true,
              onRefresh: () => {
                // Refresh handler to prevent errors
              },
            },
          })
          
          scrollTriggerInstance.current = st.scrollTrigger || null
        }, pin)

    return () => {
          try {
            // Kill the specific ScrollTrigger instance first
            if (scrollTriggerInstance.current) {
              scrollTriggerInstance.current.kill()
              scrollTriggerInstance.current = null
            }
            
            // Then revert context
            ctx.revert()
            
            // Final cleanup - kill any remaining triggers for this element
            ScrollTrigger.getAll().forEach((t) => {
              if (t.vars && (t.vars as any).trigger === pin) {
                try {
                  t.kill()
                } catch (e) {
                  // Ignore errors
                }
              }
            })
          } catch (e) {
            console.warn("GSAP SMOKE TEST: Cleanup error (safe to ignore)", e)
          }
        }
      } catch (e) {
        console.error("GSAP SMOKE TEST: Setup error", e)
      }
    })
  }, [scrollTriggerReady])

  return (
    <section ref={pinRef} className="relative w-full bg-slate-100" style={{ height: "200vh" }}>
      <div className="h-screen flex items-center justify-center">
        <div ref={boxRef} className="w-32 h-32 bg-blue-600 rounded-2xl" />
      </div>
    </section>
  )
}
