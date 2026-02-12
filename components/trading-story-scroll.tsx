"use client"

import React, { useLayoutEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

type Slide = {
  kicker: string
  title: string
  body: string
  bullets: string[]
  visual: "bands" | "regions" | "execution" | "volumes"
}

export default function TradingStoryScroll() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const pinRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const visualRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<any>(null)

  const slides: Slide[] = useMemo(
    () => [
      {
        kicker: "Trading",
        title: "Trading at the Core",
        body:
          "Trading is at the core of Futura's activities, combining disciplined execution with structured risk controls.",
        bullets: [
          "Crude oil & refined product trading",
          "Structured execution across corridors",
          "Long-term counterpart relationships",
        ],
        visual: "bands",
      },
      {
        kicker: "Volumes",
        title: "Monthly Trading Volumes",
        body:
          "Consistent flow across key refined products and crude. Clear, repeatable execution supported by logistics.",
        bullets: [
          "ULSD: 350 KT",
          "Fuel Oil: 300 KT",
          "HSGO: 100 KT",
          "Gasoline: 100 KT",
          "VGO: 90 KT",
          "Crude Oil: 2–3m BBLs",
        ],
        visual: "volumes",
      },
      {
        kicker: "Footprint",
        title: "Trading Footprint",
        body:
          "Focus corridors across Europe, Africa, the Middle East and Latin America—positioned to support supply and demand.",
        bullets: [
          "Mediterranean Sea",
          "Black Sea",
          "North Africa",
          "West Africa",
          "South America",
        ],
        visual: "regions",
      },
      {
        kicker: "Execution",
        title: "Structured Business Procedure",
        body:
          "A repeatable trade lifecycle designed to reduce friction and protect counterpart confidence.",
        bullets: [
          "Supplier terms & prepayment as applicable",
          "FOB corridors (Baltic / Black Sea ports)",
          "Loading & LC opening",
          "Delivery lead times depend on route",
          "Payment per LC terms",
        ],
        visual: "execution",
      },
    ],
    []
  )

  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  activeRef.current = active

  useLayoutEffect(() => {
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)

    const wrapper = wrapperRef.current
    const pin = pinRef.current
    if (!wrapper || !pin) return

    // Clear previous triggers (hot reload safety)
    // Kill any existing triggers with the same ID
    ScrollTrigger.getAll().forEach((t: any) => {
      if (t.vars && t.vars.id === "trading-story") {
        t.kill()
      }
    })
    
    // Also clear any triggers on the wrapper or pin element
    const existingTriggers = ScrollTrigger.getAll().filter((t: any) => {
      return (t.vars && t.vars.trigger === wrapper) || (t.vars && t.vars.pin === pin)
    })
    existingTriggers.forEach((t: any) => t.kill())

    const total = slides.length
    const clampIndex = (i: number) => Math.max(0, Math.min(total - 1, i))

    const st = ScrollTrigger.create({
      id: "trading-story",
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      pin: pin,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate: (self: any) => {
        const idx = clampIndex(Math.round(self.progress * (total - 1)))
        if (idx !== activeRef.current) setActive(idx)
      },
      snap: {
        snapTo: (value: number) => {
          const idx = clampIndex(Math.round(value * (total - 1)))
          return idx / (total - 1)
        },
        duration: 0.35,
        ease: "power2.out",
      },
    })

    return () => {
      if (st) {
        st.kill()
      }
      // Additional cleanup: kill any remaining triggers
      ScrollTrigger.getAll().forEach((t: any) => {
        if (t.vars && t.vars.id === "trading-story") {
          t.kill()
        }
      })
    }
  }, [slides.length])

  // Animate transitions when active slide changes
  useEffect(() => {
    const content = contentRef.current
    const visual = visualRef.current
    if (!content || !visual) return

    gsap.killTweensOf([content, visual])

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.fromTo(
      [content, visual],
      { opacity: 0, y: 14, filter: "blur(2px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.05 }
    )

    return () => {
      tl.kill()
    }
  }, [active])

  const slide = slides[active]

  // Mobile: stacked content
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024

  if (isMobile) {
    return (
      <section className="py-16 px-8 bg-secondary/10">
        <div className="mx-auto max-w-4xl space-y-16">
          {slides.map((s, index) => (
            <div key={index} className="space-y-6">
              <p className="text-xs font-medium tracking-wider text-foreground/50">
                {s.kicker.toUpperCase()}
              </p>
              <h2 className="text-3xl font-light text-primary">{s.title}</h2>
              <p className="text-xl text-foreground/70 leading-relaxed">{s.body}</p>
              <ul className="space-y-3">
                {s.bullets.map((b, i) => (
                  <li key={i} className="text-lg text-foreground/70">• {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section ref={wrapperRef} className="relative w-full" style={{ height: "320vh" }}>
      <div
        ref={pinRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 800px at 20% 20%, rgba(11, 94, 142, 0.10), transparent 60%), radial-gradient(1000px 700px at 80% 30%, rgba(11, 94, 142, 0.08), transparent 55%), linear-gradient(180deg, #fbfdff 0%, #f4f7fb 100%)",
        }}
      >
        <div className="mx-auto grid h-full max-w-6xl grid-cols-12 gap-10 px-6 py-20">
          {/* Left narrative */}
          <div className="col-span-12 flex flex-col justify-center md:col-span-6">
            <div ref={contentRef} className="max-w-xl">
              <p className="text-xs font-medium tracking-[0.18em] text-slate-500">
                {slide.kicker.toUpperCase()}
              </p>
              <h2 className="mt-4 text-5xl font-semibold leading-[1.05] text-[#0B5E8E]">
                {slide.title}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-700">
                {slide.body}
              </p>

              <ul className="mt-8 space-y-3">
                {slide.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#0B5E8E]" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex items-center gap-2 text-sm text-slate-500">
                {slides.map((_, i) => (
                  <span
                    key={i}
                    className="inline-block h-1.5 w-10 rounded-full transition"
                    style={{
                      background:
                        i === active ? "rgba(11,94,142,0.85)" : "rgba(15,23,42,0.10)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="col-span-12 flex items-center justify-center md:col-span-6">
            <div
              ref={visualRef}
              className="relative h-[520px] w-full max-w-[520px] rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(2,8,23,0.08)]"
            >
              <Visual visual={slide.visual} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Visual({ visual }: { visual: Slide["visual"] }) {
  // IMPORTANT: keep visuals crisp, minimal, and non-empty.
  if (visual === "bands") {
    return (
      <div className="absolute inset-0 p-8">
        <div className="h-full w-full rounded-2xl bg-gradient-to-b from-slate-50 to-white" />
        <div className="absolute left-10 top-20 right-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Crude</p>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 w-[70%] rounded-full bg-[#0B5E8E]" />
            </div>
            <p className="mt-8 text-sm font-semibold text-slate-700">Refined</p>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 w-[55%] rounded-full bg-[#0B5E8E]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (visual === "volumes") {
    const volumes = [
      { product: "ULSD", volume: "350 KT" },
      { product: "Fuel Oil", volume: "300 KT" },
      { product: "HSGO", volume: "100 KT" },
      { product: "Gasoline", volume: "100 KT" },
      { product: "VGO", volume: "90 KT" },
      { product: "Crude Oil", volume: "2–3m BBLs" },
    ]

    return (
      <div className="absolute inset-0 p-8">
        <p className="text-sm font-semibold text-slate-700">Monthly Volumes</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {volumes.map((v) => (
            <div key={v.product} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs tracking-wide text-slate-500">{v.product}</p>
              <div className="mt-2 h-2 w-full rounded-full bg-white">
                <div className="h-2 w-[60%] rounded-full bg-[#0B5E8E]" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">{v.volume}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (visual === "regions") {
    return (
      <div className="absolute inset-0 p-8">
        <p className="text-sm font-semibold text-slate-700">Trading Corridors</p>
        <div className="mt-6 space-y-3">
          {["Mediterranean Sea", "Black Sea", "North Africa", "West Africa", "South America"].map(
            (r) => (
              <div
                key={r}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="text-sm text-slate-700">{r}</span>
                <span className="text-xs text-slate-500">active</span>
              </div>
            )
          )}
        </div>
      </div>
    )
  }

  // execution
  return (
    <div className="absolute inset-0 p-8">
      <p className="text-sm font-semibold text-slate-700">Trade Execution</p>
      <div className="mt-6 space-y-4">
        {[
          "Supplier terms confirmed",
          "FOB corridor alignment",
          "Loading & LC opening",
          "Transit & delivery window",
          "Payment per LC terms",
        ].map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B5E8E] text-xs font-semibold text-white">
              {i + 1}
            </div>
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {s}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 left-8 right-8">
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div className="h-2 w-[85%] rounded-full bg-[#0B5E8E]" />
        </div>
      </div>
    </div>
  )
}
