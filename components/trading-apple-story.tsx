"use client"

import React, { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

const volumes = [
  { product: "ULSD", volume: 350, unit: "KT" },
  { product: "Fuel Oil", volume: 300, unit: "KT" },
  { product: "HSGO", volume: 100, unit: "KT" },
  { product: "Gasoline", volume: 100, unit: "KT" },
  { product: "VGO", volume: 90, unit: "KT" },
  { product: "Crude Oil", volume: 2.5, unit: "m BBLs" },
]

const regions = [
  "Mediterranean Sea",
  "Black Sea",
  "North Africa",
  "West Africa",
  "South America",
]

const businessSteps = [
  "Supplier engagement (GPN, Surgut, Tatneft, Taif), prepayment",
  "FOB Baltic and Black Sea ports",
  "Loading & LC opening from receiver",
  "Delivery 15–40 days depending on destination",
  "Payment as per LC 30–45 days depending on client",
]

export default function TradingAppleStory() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<any>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  // Chapter refs
  const chapter1Ref = useRef<HTMLDivElement>(null)
  const chapter2Ref = useRef<HTMLDivElement>(null)
  const chapter3Ref = useRef<HTMLDivElement>(null)
  const chapter4Ref = useRef<HTMLDivElement>(null)

  // Visual refs
  const visual1Ref = useRef<HTMLDivElement>(null)
  const visual2Ref = useRef<HTMLDivElement>(null)
  const visual3Ref = useRef<HTMLDivElement>(null)
  const visual4Ref = useRef<HTMLDivElement>(null)
  const crudeBarRef = useRef<HTMLDivElement>(null)
  const refinedBarRef = useRef<HTMLDivElement>(null)
  const volumeCardsRef = useRef<(HTMLDivElement | null)[]>([])
  const volumeNumbersRef = useRef<(HTMLDivElement | null)[]>([])
  const mapDotsRef = useRef<(HTMLDivElement | null)[]>([])
  const mapArcsRef = useRef<(SVGPathElement | null)[]>([])
  const stepCardsRef = useRef<(HTMLDivElement | null)[]>([])
  const progressLineRef = useRef<SVGPathElement>(null)

  // Ambient effects
  const glowRef = useRef<HTMLDivElement>(null)
  const progressRailRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)

    const wrapper = wrapperRef.current
    const stage = stageRef.current
    if (!wrapper || !stage) return

    // Clear previous triggers
    ScrollTrigger.getAll().forEach((t: any) => {
      if (t.vars && t.vars.id === "trading-apple-story") {
        t.kill()
      }
    })

    // Create GSAP context for cleanup
    const ctx = gsap.context(() => {
      // Create main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "trading-apple-story",
          trigger: wrapper,
          start: "top top",
          end: "+=4000", // 400vh
          pin: stage,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          snap: {
            snapTo: (value: number) => {
              // Snap to chapter labels
              const labels = [0, 0.25, 0.5, 0.75, 1]
              const closest = labels.reduce((prev, curr) =>
                Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
              )
              return closest
            },
            duration: 0.4,
            ease: "power2.out",
          },
        },
      })

      // Add chapter labels
      tl.addLabel("c1", 0)
        .addLabel("c2", 0.25)
        .addLabel("c3", 0.5)
        .addLabel("c4", 0.75)
        .addLabel("end", 1)

      // Continuous background glow drift
      if (glowRef.current) {
        tl.to(
          glowRef.current,
          {
            x: "+=100",
            y: "+=50",
            rotation: 15,
            ease: "none",
            duration: 1,
          },
          0
        )
      }

      // Continuous progress rail fill
      if (progressRailRef.current) {
        tl.to(
          progressRailRef.current,
          {
            scaleX: 1,
            ease: "none",
            duration: 1,
            transformOrigin: "left center",
          },
          0
        )
      }

      // CHAPTER 1: Crude vs Refined
      if (chapter1Ref.current) {
        tl.fromTo(
          chapter1Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
          "c1"
        )
          .to(chapter1Ref.current, { opacity: 0, y: -30, duration: 0.15, ease: "power2.in" }, "c2")
      }

      // Visual 1 fade in/out
      if (visual1Ref.current) {
        tl.fromTo(
          visual1Ref.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.15, ease: "power2.out" },
          "c1"
        )
          .to(visual1Ref.current, { opacity: 0, duration: 0.15, ease: "power2.in" }, "c2")
      }

      // Crude bar animation
      if (crudeBarRef.current) {
        tl.fromTo(
          crudeBarRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.2, ease: "power2.out" },
          "c1+=0.05"
        )
      }

      // Refined bar animation
      if (refinedBarRef.current) {
        tl.fromTo(
          refinedBarRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 0.7, opacity: 1, duration: 0.2, ease: "power2.out" },
          "c1+=0.1"
        )
      }

      // CHAPTER 2: Monthly Volumes
      if (chapter2Ref.current) {
        tl.fromTo(
          chapter2Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
          "c2"
        )
          .to(chapter2Ref.current, { opacity: 0, y: -30, duration: 0.15, ease: "power2.in" }, "c3")
      }

      // Visual 2 fade in/out
      if (visual2Ref.current) {
        tl.fromTo(
          visual2Ref.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.15, ease: "power2.out" },
          "c2"
        )
          .to(visual2Ref.current, { opacity: 0, duration: 0.15, ease: "power2.in" }, "c3")
      }

      // Volume cards slide in
      volumeCardsRef.current.forEach((card, index) => {
        if (card) {
          tl.fromTo(
            card,
            { opacity: 0, x: 50, scale: 0.9 },
            { opacity: 1, x: 0, scale: 1, duration: 0.1, ease: "power2.out" },
            `c2+=${0.05 + index * 0.02}`
          )
        }
      })

      // Volume numbers count up (scrubbed)
      volumeNumbersRef.current.forEach((num, index) => {
        if (num) {
          const volume = volumes[index]
          const targetValue = volume.volume
          const counter = { value: 0 }
          tl.to(
            counter,
            {
              value: targetValue,
              duration: 0.2,
              ease: "none",
              onUpdate: function () {
                const currentValue = Math.round(counter.value)
                if (num) {
                  num.textContent = `${currentValue} ${volume.unit}`
                }
              },
            },
            `c2+=${0.1 + index * 0.02}`
          )
        }
      })

      // CHAPTER 3: Trading Footprint
      if (chapter3Ref.current) {
        tl.fromTo(
          chapter3Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
          "c3"
        )
          .to(chapter3Ref.current, { opacity: 0, y: -30, duration: 0.15, ease: "power2.in" }, "c4")
      }

      // Visual 3 fade in/out
      if (visual3Ref.current) {
        tl.fromTo(
          visual3Ref.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.15, ease: "power2.out" },
          "c3"
        )
          .to(visual3Ref.current, { opacity: 0, duration: 0.15, ease: "power2.in" }, "c4")
      }

      // Map dots appear
      mapDotsRef.current.forEach((dot, index) => {
        if (dot) {
          tl.fromTo(
            dot,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.08, ease: "back.out(1.7)" },
            `c3+=${0.05 + index * 0.03}`
          )
        }
      })

      // Map arcs draw
      mapArcsRef.current.forEach((arc, index) => {
        if (arc) {
          const length = arc.getTotalLength()
          arc.style.strokeDasharray = `${length}`
          arc.style.strokeDashoffset = `${length}`
          tl.to(
            arc,
            {
              strokeDashoffset: 0,
              duration: 0.15,
              ease: "power2.out",
            },
            `c3+=${0.1 + index * 0.02}`
          )
        }
      })

      // CHAPTER 4: Execution
      if (chapter4Ref.current) {
        tl.fromTo(
          chapter4Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
          "c4"
        )
      }

      // Visual 4 fade in
      if (visual4Ref.current) {
        tl.fromTo(
          visual4Ref.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.15, ease: "power2.out" },
          "c4"
        )
      }

      // Step cards lift and settle
      stepCardsRef.current.forEach((card, index) => {
        if (card) {
          tl.fromTo(
            card,
            { opacity: 0, y: 40, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "power2.out" },
            `c4+=${0.05 + index * 0.03}`
          )
        }
      })

      // Progress line draws
      if (progressLineRef.current) {
        const length = progressLineRef.current.getTotalLength()
        progressLineRef.current.style.strokeDasharray = `${length}`
        progressLineRef.current.style.strokeDashoffset = `${length}`
        tl.to(
          progressLineRef.current,
          {
            strokeDashoffset: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          "c4+=0.1"
        )
      }

      // Continuous parallax: text moves slower than visual
      if (chapter1Ref.current && chapter2Ref.current && chapter3Ref.current && chapter4Ref.current) {
        const textElements = [chapter1Ref.current, chapter2Ref.current, chapter3Ref.current, chapter4Ref.current]
        textElements.forEach((el) => {
          if (el) {
            tl.to(
              el,
              {
                y: -20,
                ease: "none",
                duration: 1,
              },
              0
            )
          }
        })
      }

      // Continuous micro motion on visual stage
      const visualElements = [
        crudeBarRef.current,
        refinedBarRef.current,
        ...volumeCardsRef.current,
        ...mapDotsRef.current,
      ].filter(Boolean)

      visualElements.forEach((el) => {
        if (el) {
          tl.to(
            el,
            {
              y: "+=4",
              ease: "sine.inOut",
              duration: 0.5,
              repeat: -1,
              yoyo: true,
            },
            0
          )
        }
      })
    })

    ctxRef.current = ctx

    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert()
        ctxRef.current = null
      }
      ScrollTrigger.getAll().forEach((t: any) => {
        if (t.vars && t.vars.id === "trading-apple-story") {
          t.kill()
        }
      })
    }
  }, [])

  // Mobile: stacked content
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024

  if (isMobile) {
    return (
      <section className="py-16 px-8 bg-secondary/10">
        <div className="mx-auto max-w-4xl space-y-16">
          <div>
            <h2 className="text-3xl font-light text-primary mb-6">Core Trading Activities</h2>
            <ul className="space-y-3 text-lg text-foreground/70">
              <li>• Crude oil trading</li>
              <li>• Refined petroleum product trading</li>
              <li>• Shipping & freight optimization</li>
              <li>• Storage management</li>
              <li>• Hedging and risk management</li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-light text-primary mb-6">Monthly Trading Volumes</h2>
            <div className="grid grid-cols-2 gap-4">
              {volumes.map((v, i) => (
                <div key={i} className="border-b border-border pb-2">
                  <div className="text-sm text-foreground/60">{v.product}</div>
                  <div className="text-2xl font-medium text-primary">
                    {v.volume} {v.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-light text-primary mb-6">Trading Footprint</h2>
            <ul className="space-y-2 text-lg text-foreground/70">
              {regions.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-light text-primary mb-6">Business Procedure</h2>
            <ol className="space-y-3 text-lg text-foreground/70">
              {businessSteps.map((step, i) => (
                <li key={i} className="flex">
                  <span className="text-primary mr-3 font-medium">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: "400vh" }}
    >
      {/* Ambient glow blob */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 800px at 30% 40%, rgba(11, 94, 142, 0.15), transparent 70%)",
          filter: "blur(80px)",
          willChange: "transform",
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Pinned stage */}
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 800px at 20% 20%, rgba(11, 94, 142, 0.08), transparent 60%), radial-gradient(1000px 700px at 80% 30%, rgba(11, 94, 142, 0.06), transparent 55%), linear-gradient(180deg, #fafbfc 0%, #f4f6f8 100%)",
        }}
      >
        <div className="relative h-full w-full">
          {/* Progress rail at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10">
            <div
              ref={progressRailRef}
              className="h-full bg-primary/60 origin-left"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <div className="mx-auto grid h-full max-w-7xl grid-cols-12 gap-12 px-8 py-16">
            {/* Left narrative column */}
            <div className="col-span-12 flex flex-col justify-center md:col-span-6">
              <div className="relative" style={{ minHeight: "500px" }}>
                {/* CHAPTER 1 */}
                <div
                  ref={chapter1Ref}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ opacity: 0 }}
                >
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 mb-4">
                    TRADING
                  </p>
                  <h2 className="text-5xl md:text-6xl font-semibold leading-tight text-[#0B5E8E] mb-6">
                    Core Trading Activities
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-700 mb-8">
                    Trading is at the core of Futura's activities, combining disciplined execution with structured risk controls.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Crude oil trading",
                      "Refined petroleum product trading",
                      "Shipping & freight optimization",
                      "Storage management",
                      "Hedging and risk management",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#0B5E8E]" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CHAPTER 2 */}
                <div
                  ref={chapter2Ref}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ opacity: 0 }}
                >
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 mb-4">
                    VOLUMES
                  </p>
                  <h2 className="text-5xl md:text-6xl font-semibold leading-tight text-[#0B5E8E] mb-6">
                    Monthly Trading Volumes
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-700 mb-8">
                    Consistent flow across key refined products and crude. Clear, repeatable execution supported by logistics.
                  </p>
                </div>

                {/* CHAPTER 3 */}
                <div
                  ref={chapter3Ref}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ opacity: 0 }}
                >
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 mb-4">
                    FOOTPRINT
                  </p>
                  <h2 className="text-5xl md:text-6xl font-semibold leading-tight text-[#0B5E8E] mb-6">
                    Trading Footprint
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-700 mb-8">
                    Focus corridors across Europe, Africa, the Middle East and Latin America—positioned to support supply and demand.
                  </p>
                </div>

                {/* CHAPTER 4 */}
                <div
                  ref={chapter4Ref}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ opacity: 0 }}
                >
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 mb-4">
                    EXECUTION
                  </p>
                  <h2 className="text-5xl md:text-6xl font-semibold leading-tight text-[#0B5E8E] mb-6">
                    Structured Business Procedure
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-700 mb-8">
                    A repeatable trade lifecycle designed to reduce friction and protect counterpart confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Right visual stage */}
            <div className="col-span-12 md:col-span-6 flex items-center justify-center">
              <div
                className="relative w-full max-w-[600px] h-[600px] rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-[0_20px_60px_rgba(2,8,23,0.08)]"
                style={{
                  boxShadow: "0 20px 60px rgba(2,8,23,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                {/* CHAPTER 1 VISUAL: Crude vs Refined bars */}
                <div
                  ref={visual1Ref}
                  className="absolute inset-0 p-12 flex flex-col justify-center"
                  style={{ opacity: 1 }}
                >
                  <div className="space-y-8">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">Crude</p>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          ref={crudeBarRef}
                          className="h-full bg-[#0B5E8E] rounded-full origin-left"
                          style={{ transform: "scaleX(0)", opacity: 0 }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">Refined</p>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          ref={refinedBarRef}
                          className="h-full bg-[#0B5E8E] rounded-full origin-left"
                          style={{ transform: "scaleX(0.7)", opacity: 0 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHAPTER 2 VISUAL: Volume cards */}
                <div
                  ref={visual2Ref}
                  className="absolute inset-0 p-8"
                  style={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {volumes.map((v, i) => (
                      <div
                        key={i}
                        ref={(el) => {
                          volumeCardsRef.current[i] = el
                        }}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 backdrop-blur-sm"
                        style={{ opacity: 0, transform: "translateX(50px) scale(0.9)" }}
                      >
                        <p className="text-xs tracking-wide text-slate-500 mb-2">{v.product}</p>
                        <div className="h-2 w-full rounded-full bg-white mb-3">
                          <div className="h-2 w-[60%] rounded-full bg-[#0B5E8E]" />
                        </div>
                        <p
                          ref={(el) => {
                            volumeNumbersRef.current[i] = el
                          }}
                          className="text-lg font-semibold text-slate-700"
                        >
                          0 {v.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CHAPTER 3 VISUAL: Map with dots and arcs */}
                <div
                  ref={visual3Ref}
                  className="absolute inset-0 p-8"
                  style={{ opacity: 0 }}
                >
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full"
                    style={{ opacity: 0.2 }}
                  >
                    {/* World silhouette (minimal) */}
                    <path
                      d="M 100 150 Q 150 120 200 130 Q 250 140 300 120 Q 320 110 350 130 L 340 200 Q 320 220 300 210 Q 250 230 200 240 Q 150 250 100 230 Z"
                      fill="currentColor"
                      className="text-slate-300"
                    />
                    <path
                      d="M 80 180 Q 120 160 160 170 Q 200 180 240 160 Q 260 150 280 170 L 270 220 Q 250 240 230 230 Q 200 250 160 260 Q 120 270 80 250 Z"
                      fill="currentColor"
                      className="text-slate-300"
                    />

                    {/* Connecting arcs */}
                    {[
                      { from: { x: 150, y: 140 }, to: { x: 200, y: 160 } },
                      { from: { x: 200, y: 160 }, to: { x: 250, y: 150 } },
                      { from: { x: 250, y: 150 }, to: { x: 180, y: 200 } },
                      { from: { x: 180, y: 200 }, to: { x: 120, y: 220 } },
                    ].map((arc, i) => (
                      <path
                        key={i}
                        ref={(el) => {
                          mapArcsRef.current[i] = el
                        }}
                        d={`M ${arc.from.x} ${arc.from.y} Q ${(arc.from.x + arc.to.x) / 2} ${(arc.from.y + arc.to.y) / 2 - 30} ${arc.to.x} ${arc.to.y}`}
                        stroke="#0B5E8E"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="1000"
                        strokeDashoffset="1000"
                        opacity="0.4"
                      />
                    ))}

                    {/* Region dots */}
                    {[
                      { x: 150, y: 140, label: "Med" },
                      { x: 200, y: 160, label: "Black" },
                      { x: 250, y: 150, label: "N.Afr" },
                      { x: 180, y: 200, label: "W.Afr" },
                      { x: 120, y: 220, label: "S.Am" },
                    ].map((dot, i) => (
                      <g key={i}>
                        <circle
                          ref={(el) => {
                            mapDotsRef.current[i] = el
                          }}
                          cx={dot.x}
                          cy={dot.y}
                          r="8"
                          fill="#0B5E8E"
                          opacity="0"
                          style={{ transform: "scale(0)" }}
                        />
                        <text
                          x={dot.x}
                          y={dot.y - 15}
                          textAnchor="middle"
                          className="text-xs fill-slate-600"
                          style={{ opacity: 0.6 }}
                        >
                          {dot.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* CHAPTER 4 VISUAL: Execution steps */}
                <div
                  ref={visual4Ref}
                  className="absolute inset-0 p-8"
                  style={{ opacity: 0 }}
                >
                  <svg
                    viewBox="0 0 400 500"
                    className="w-full h-full"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    {/* Progress line */}
                    <path
                      ref={progressLineRef}
                      d="M 50 50 L 50 450"
                      stroke="#0B5E8E"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="1000"
                      strokeDashoffset="1000"
                      opacity="0.3"
                    />
                  </svg>
                  <div className="relative space-y-4 pt-8">
                    {businessSteps.map((step, i) => (
                      <div
                        key={i}
                        ref={(el) => {
                          stepCardsRef.current[i] = el
                        }}
                        className="flex items-start gap-4"
                        style={{ opacity: 0, transform: "translateY(40px) scale(0.95)" }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B5E8E] text-sm font-semibold text-white flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-slate-700">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

