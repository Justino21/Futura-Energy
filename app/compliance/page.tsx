"use client"

import { SiteHeader } from "@/components/site-header"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ChevronDown, ChevronUp, Shield } from "lucide-react"
import { useRef, useState, useEffect, useCallback } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/src/contexts/language-context"

function AutoCounter({
  targetValue,
  suffix = "",
  prefix = "",
  finalDisplay = "",
  isInView = false,
  duration = 1500,
}: {
  targetValue: number
  suffix?: string
  prefix?: string
  finalDisplay?: string
  isInView?: boolean
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    if (!isInView) {
      setCount(0)
      setShowFinal(false)
      return
    }
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round((targetValue - 0) * eased)
      setCount(currentValue)
      if (progress < 1) requestAnimationFrame(animate)
      else if (finalDisplay) setTimeout(() => setShowFinal(true), 200)
    }
    requestAnimationFrame(animate)
  }, [isInView, targetValue, duration, finalDisplay])

  return (
    <span className="tabular-nums relative inline-block">
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: showFinal && finalDisplay ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="inline-block"
      >
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </motion.span>
      {finalDisplay && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: showFinal ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute left-0 top-0 inline-block"
        >
          {finalDisplay}
        </motion.span>
      )}
    </span>
  )
}

function QuarterText({ index }: { index: number }) {
  const { t } = useLanguage()
  const fullLabel = t(`compliancePage.riskCat${index}FullLabel`)
  const measureCount = index === 2 ? 4 : 3
  const measures = Array.from({ length: measureCount }, (_, i) =>
    t(`compliancePage.riskCat${index}Measure${i + 1}`)
  )
  return (
    <div className="w-full h-[7.5rem] pl-4 border-l-2 border-blue-500/50 space-y-2 overflow-hidden">
      <h3
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          color: "#ffffff",
          fontWeight: 500,
          fontSize: "1.1rem",
          lineHeight: "1.3",
          letterSpacing: "-0.01em",
        }}
      >
        {fullLabel}
      </h3>
      <ul className="mt-1.5 space-y-1">
        {measures.map((measure, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/50" />
            <span
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.9rem",
                lineHeight: "1.45",
              }}
            >
              {measure}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const COMPLIANCE_FRAMEWORK_ITEMS = [
  { titleKey: "kycTitle", descKey: "kycDesc" },
  { titleKey: "sanctionsTitle", descKey: "sanctionsDesc" },
  { titleKey: "antiBriberyTitle", descKey: "antiBriberyDesc" },
  { titleKey: "amlCtfTitle", descKey: "amlCtfDesc" },
] as const

function ComplianceFrameworkCarousel({ t }: { t: (key: string) => string }) {
  const [api, setApi] = useState<CarouselApi | undefined>()
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    const onSelect = () => setSelected(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => api.off("select", onSelect)
  }, [api])
  const cardClass =
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm p-6 min-h-[180px] flex flex-col"
  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true, dragFree: false }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {COMPLIANCE_FRAMEWORK_ITEMS.map((item) => (
          <CarouselItem key={item.titleKey} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-blue-400/80 flex-shrink-0" />
                  <h3 style={{ fontFamily: "var(--font-sans), sans-serif", color: "#ffffff", fontWeight: 500, fontSize: "1.2rem", lineHeight: "1.3" }}>
                    {t(`compliancePage.${item.titleKey}`)}
                  </h3>
                </div>
                <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "1rem", lineHeight: "1.7" }}>
                  {t(`compliancePage.${item.descKey}`)}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {COMPLIANCE_FRAMEWORK_ITEMS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${i === selected ? "w-6 bg-white/90" : "w-2 bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </Carousel>
  )
}

const DUE_DILIGENCE_ITEMS = [
  { step: "1", titleKey: "initialScreeningTitle", descKey: "initialScreeningDesc" },
  { step: "2", titleKey: "riskAssessmentTitle", descKey: "riskAssessmentDesc" },
  { step: "3", titleKey: "ongoingMonitoringTitle", descKey: "ongoingMonitoringDesc" },
] as const

function DueDiligenceCarousel({ t }: { t: (key: string) => string }) {
  const [api, setApi] = useState<CarouselApi | undefined>()
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    const onSelect = () => setSelected(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => api.off("select", onSelect)
  }, [api])
  const cardClass =
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm p-6 min-h-[180px] flex flex-col"
  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true, dragFree: false }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {DUE_DILIGENCE_ITEMS.map((item) => (
          <CarouselItem key={item.step} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-500/60 text-blue-400 font-serif text-lg" style={{ fontFamily: "var(--font-serif), serif" }}>
                  {item.step}
                </span>
                <h3 style={{ fontFamily: "var(--font-sans), sans-serif", color: "#ffffff", fontWeight: 500, fontSize: "1.2rem", lineHeight: "1.3" }}>
                  {t(`compliancePage.${item.titleKey}`)}
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "1rem", lineHeight: "1.7" }}>
                  {t(`compliancePage.${item.descKey}`)}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {DUE_DILIGENCE_ITEMS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${i === selected ? "w-6 bg-white/90" : "w-2 bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </Carousel>
  )
}

const CONTINUOUS_IMPROVEMENT_ITEMS = [
  { titleKey: "regulatoryMonitoringTitle", descKey: "regulatoryMonitoringDesc" },
  { titleKey: "internalTrainingTitle", descKey: "internalTrainingDesc" },
  { titleKey: "advisorySupportTitle", descKey: "advisorySupportDesc" },
] as const

function ContinuousImprovementCarousel({ t }: { t: (key: string) => string }) {
  const [api, setApi] = useState<CarouselApi | undefined>()
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    const onSelect = () => setSelected(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => api.off("select", onSelect)
  }, [api])
  const cardClass =
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm p-6 min-h-[180px] flex flex-col"
  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true, dragFree: false }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {CONTINUOUS_IMPROVEMENT_ITEMS.map((item) => (
          <CarouselItem key={item.titleKey} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-3">
                <h3 style={{ fontFamily: "var(--font-sans), sans-serif", color: "#ffffff", fontWeight: 500, fontSize: "1.2rem", lineHeight: "1.3" }}>
                  {t(`compliancePage.${item.titleKey}`)}
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "1rem", lineHeight: "1.7" }}>
                  {t(`compliancePage.${item.descKey}`)}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {CONTINUOUS_IMPROVEMENT_ITEMS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${i === selected ? "w-6 bg-white/90" : "w-2 bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </Carousel>
  )
}

function RiskFrameworkCircle() {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const [riskOpen, setRiskOpen] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false])

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        video.currentTime = 0
        video.play().catch(() => {})
      },
      { threshold: 0.25, rootMargin: "0px" }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = mobileVideoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        el.currentTime = 0
        el.play().catch(() => {})
      },
      { threshold: 0.25, rootMargin: "0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const toggleRisk = (i: number) => {
    setRiskOpen((prev) => {
      const next = [...prev] as [boolean, boolean, boolean, boolean]
      next[i] = !next[i]
      return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2
          style={{
            fontFamily: "var(--font-serif), serif",
            color: "#ffffff",
            fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
          }}
        >
          {t("compliancePage.riskManagementFramework")}
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.65)",
            fontSize: "1.1rem",
            lineHeight: "1.65",
          }}
        >
          {t("compliancePage.riskFrameworkSubtitle")}
        </p>
      </div>

      {/* Mobile only: video below title, then 4 dropdowns (same design as Geographic Trading Focus regions on trading page) */}
      <div className="sm:hidden space-y-6">
        <div className="relative w-full aspect-square max-w-[280px] mx-auto overflow-hidden rounded-lg">
          <video
            ref={mobileVideoRef}
            src="/framework_cgi.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "brightness(1.12) contrast(1.08)",
            }}
            playsInline
            muted
            loop={false}
            onEnded={(e) => e.currentTarget.pause()}
            aria-label="Risk management framework"
          />
        </div>
        <div className="space-y-6">
          {[0, 1, 2, 3].map((index) => {
            const fullLabel = t(`compliancePage.riskCat${index}FullLabel`)
            const measureCount = index === 2 ? 4 : 3
            const measures = Array.from({ length: measureCount }, (_, i) =>
              t(`compliancePage.riskCat${index}Measure${i + 1}`)
            )
            const isOpen = riskOpen[index]
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-2 pl-4 border-l-2 border-blue-500/50"
              >
                <button
                  type="button"
                  onClick={() => toggleRisk(index)}
                  className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99] text-left"
                  aria-expanded={isOpen}
                  aria-label={isOpen ? `Collapse ${fullLabel}` : `Expand ${fullLabel}`}
                >
                  <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 500 }}>
                    {fullLabel}
                  </span>
                  {isOpen ? (
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex shrink-0"
                    >
                      <ChevronUp className="w-4 h-4 text-[#3d7dd4]/90" strokeWidth={1.8} />
                    </motion.span>
                  ) : (
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex shrink-0"
                    >
                      <ChevronDown className="w-4 h-4 text-[#3d7dd4]/90" strokeWidth={1.8} />
                    </motion.span>
                  )}
                </button>
                <ul className={isOpen ? "mt-1.5 space-y-1 block" : "hidden"}>
                  {measures.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/50" />
                      <span
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontSize: "0.9rem",
                          lineHeight: "1.45",
                        }}
                      >
                        {m}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Desktop: unchanged grid with video in center and 4 QuarterText */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-stretch gap-8 sm:gap-0 max-w-6xl mx-auto">
        {/* Left column: animate in one by one after title/video */}
        <div className="grid grid-rows-[1fr_1fr] gap-8 sm:gap-10 sm:pr-10 sm:min-w-0 sm:w-[340px] sm:justify-self-end items-center justify-items-end">
          <motion.div
            className="w-full max-w-[340px] flex justify-end"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.48 }}
          >
            <QuarterText index={3} />
          </motion.div>
          <motion.div
            className="w-full max-w-[340px] flex justify-end"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.6 }}
          >
            <QuarterText index={2} />
          </motion.div>
        </div>

        {/* Container has no visible border: video fades into page like trading first section */}
        <div
          ref={containerRef}
          className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] flex justify-center items-center flex-shrink-0 justify-self-center overflow-visible"
        >
          <video
            ref={videoRef}
            src="/framework_cgi.mp4"
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            style={{
              filter: "brightness(1.12) contrast(1.08)",
              maskImage: "radial-gradient(circle at 50% 50%, black 42%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 42%, transparent 78%)",
            }}
            playsInline
            muted
            loop={false}
            onEnded={(e) => e.currentTarget.pause()}
            aria-label="Risk management framework"
          />
          {/* Brighten most of the circle, almost to the border */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.07) 55%, rgba(255,255,255,0.03) 75%, transparent 90%)",
              maskImage: "radial-gradient(circle at 50% 50%, black 42%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 42%, transparent 78%)",
            }}
          />
        </div>

        {/* Right column: animate in one by one after title/video */}
        <div className="grid grid-rows-[1fr_1fr] gap-8 sm:gap-10 sm:pl-32 sm:min-w-0 sm:w-[340px] sm:justify-self-start items-center justify-items-start">
          <motion.div
            className="w-full max-w-[340px] flex justify-start"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.72 }}
          >
            <QuarterText index={0} />
          </motion.div>
          <motion.div
            className="w-full max-w-[340px] flex justify-start"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.84 }}
          >
            <QuarterText index={1} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CompliancePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLElement>(null)
  const introSectionRef = useRef<HTMLDivElement>(null)
  const [replayOverlayOpacity, setReplayOverlayOpacity] = useState(0)
  const [navigatingExpanded, setNavigatingExpanded] = useState(false)
  const introVideoHasEndedRef = useRef(false)
  const introVideoRef = useRef<HTMLVideoElement>(null)
  const reverseRafRef = useRef<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const { scrollYProgress: introScrollProgress } = useScroll({
    target: introSectionRef,
    offset: ["start end", "end start"],
  })
  const introParallaxY = useTransform(introScrollProgress, [0, 0.5, 1], [24, 0, -24])
  const isStatsInView = useInView(statsRef, { once: false, margin: "-100px" })
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  const REVERSE_SPEED = 8
  const startIntroVideoReverse = useCallback(() => {
    const video = introVideoRef.current
    if (!video) return
    video.pause()
    let lastTime = performance.now()
    const tick = () => {
      const now = performance.now()
      const delta = (now - lastTime) / 1000
      lastTime = now
      video.currentTime = Math.max(0, video.currentTime - delta * REVERSE_SPEED)
      if (video.currentTime <= 0) {
        video.currentTime = 0
        if (reverseRafRef.current != null) cancelAnimationFrame(reverseRafRef.current)
        reverseRafRef.current = null
        setReplayOverlayOpacity(0)
        introVideoHasEndedRef.current = false
        requestAnimationFrame(() => {
          video.play().catch(() => {})
        })
        return
      }
      reverseRafRef.current = requestAnimationFrame(tick)
    }
    reverseRafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    return () => {
      if (reverseRafRef.current != null) cancelAnimationFrame(reverseRafRef.current)
    }
  }, [])

  return (
    <>
      <SiteHeader />

      <main className="relative" style={{ minHeight: "100vh", backgroundColor: "#000000" }}>
        {/* Hero Video Section */}
        <section
          ref={heroRef}
          className="relative w-full h-screen overflow-hidden"
          style={{ backgroundColor: "#000" }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              imageRendering: "crisp-edges",
              WebkitImageRendering: "crisp-edges",
              willChange: "transform",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
          >
            <source src="/Risk_Hero2.mp4" type="video/mp4" />
          </video>

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8"
            style={{ opacity }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            />
            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[clamp(2.8rem,7vw,5rem)] font-serif tracking-[-0.02em] text-white leading-[1.05] mb-6 text-center"
              >
                {t("compliancePage.pageTitle")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-[clamp(1.1rem,2.5vw,1.5rem)] text-white/90 leading-[1.6] text-center font-light tracking-[0.02em] max-w-2xl mx-auto"
              >
                {t("compliancePage.heroSubtitle")}
              </motion.p>
          </div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            style={{ opacity }}
            initial={{ y: 0 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-white/80 text-xs tracking-wider uppercase font-light">{t("common.scroll")}</span>
            <ChevronDown className="w-8 h-8 text-white/80" strokeWidth={1.5} />
          </motion.div>
        </section>

        {/* Stats Countup Section */}
        <section
          ref={statsRef}
          className="relative w-full pt-8 pb-6 px-8 md:px-12"
          style={{ backgroundColor: "#000000" }}
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  label: t("compliancePage.statCounterpartyScreening"),
                  node: (
                    <AutoCounter
                      targetValue={100}
                      suffix="%"
                      isInView={isStatsInView}
                      duration={1500}
                    />
                  ),
                },
                {
                  label: t("compliancePage.statCorePolicies"),
                  node: (
                    <AutoCounter targetValue={4} isInView={isStatsInView} duration={1500} />
                  ),
                },
                {
                  label: t("compliancePage.statRiskCategories"),
                  node: (
                    <AutoCounter targetValue={4} isInView={isStatsInView} duration={1500} />
                  ),
                },
              ].map(({ label, node }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isStatsInView ? 1 : 0, y: isStatsInView ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: (i + 1) * 0.1 }}
                  className="text-center"
                >
                  <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                    {node}
                  </div>
                  <div className="text-white/80 text-sm md:text-base font-light tracking-wide uppercase">
                    {label}
                </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Page Content - after hero + volumes; mobile text scaled via .page-compliance-content */}
        <section
          className="page-compliance-content"
          style={{
            position: "relative",
            backgroundColor: "#000000",
            width: "100%",
            paddingTop: "4rem",
            paddingBottom: "2rem",
          }}
        >
          <div className="page-compliance-inner mx-auto w-full max-w-7xl px-8 md:px-12 space-y-24">
            {/* Intro: video left (fading like trading), text right */}
            <motion.div
              ref={introSectionRef}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Video left — same fading/mask treatment as trading first section */}
              <motion.div
                className="relative w-full max-w-xl mx-auto overflow-visible lg:order-1 order-2"
                style={{ height: "280px", y: introParallaxY }}
              >
                <video
                  ref={introVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: "brightness(1.35) contrast(1.1)",
                    backfaceVisibility: "hidden",
                    transform: "translateZ(0) scale(1.05)",
                    willChange: "transform",
                    mixBlendMode: "screen",
                    opacity: 0.92,
                    maskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 15%, transparent 65%)",
                    WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 15%, transparent 65%)",
                  }}
                  onEnded={() => {
                    introVideoHasEndedRef.current = true
                    setReplayOverlayOpacity(1)
                    setTimeout(() => startIntroVideoReverse(), 80)
                  }}
                  onPlay={() => {
                    if (introVideoHasEndedRef.current) {
                      setReplayOverlayOpacity(0)
                      introVideoHasEndedRef.current = false
                    }
                  }}
                >
                  <source src="/lock_cgi.mp4" type="video/mp4" />
                </video>
                {/* Fade to black after video ends for smoother replay transition */}
                <div
                  className="absolute inset-0 bg-black pointer-events-none"
                  style={{
                    opacity: replayOverlayOpacity,
                    transition: "opacity 0.12s ease-in-out",
                  }}
                  aria-hidden
                />
              </motion.div>
              <div className="space-y-6 lg:order-2 order-1">
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "1.35rem",
                    lineHeight: "1.9",
                    fontWeight: 300,
                  }}
                >
                  {t("compliancePage.intro1")}
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("compliancePage.intro2")}
                </p>
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Compliance Framework */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h2
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    color: "#ffffff",
                    fontWeight: 400,
                    fontSize: "clamp(2rem, 4vw, 2.5rem)",
                    lineHeight: "1.2",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("compliancePage.complianceFramework")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("compliancePage.complianceFrameworkDesc")}
                </p>
              </div>

              {/* Mobile: carousel with dots and blue border/glow. Desktop: grid unchanged. */}
              <div className="md:hidden">
                <ComplianceFrameworkCarousel t={t} />
              </div>
              <div className="hidden md:grid grid-cols-2 gap-6">
                {[
                  { titleKey: "kycTitle", descKey: "kycDesc" },
                  { titleKey: "sanctionsTitle", descKey: "sanctionsDesc" },
                  { titleKey: "antiBriberyTitle", descKey: "antiBriberyDesc" },
                  { titleKey: "amlCtfTitle", descKey: "amlCtfDesc" },
                ].map((item, i) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-blue-400/80 flex-shrink-0" />
                        <h3
                          style={{
                            fontFamily: "var(--font-sans), sans-serif",
                            color: "#ffffff",
                            fontWeight: 500,
                            fontSize: "1.2rem",
                            lineHeight: "1.3",
                          }}
                        >
                          {t(`compliancePage.${item.titleKey}`)}
                        </h3>
                      </div>
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.85)",
                          fontSize: "1rem",
                          lineHeight: "1.7",
                        }}
                      >
                        {t(`compliancePage.${item.descKey}`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Risk Management Framework - Interactive circle */}
            <RiskFrameworkCircle />

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Due Diligence Process */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h2
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    color: "#ffffff",
                    fontWeight: 400,
                    fontSize: "clamp(2rem, 4vw, 2.5rem)",
                    lineHeight: "1.2",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("compliancePage.dueDiligenceTitle")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("compliancePage.dueDiligenceDesc")}
                </p>
              </div>
              {/* Mobile: carousel. Desktop: grid unchanged. */}
              <div className="md:hidden">
                <DueDiligenceCarousel t={t} />
              </div>
              <div className="hidden md:grid grid-cols-3 gap-6">
                {[
                  { step: "1", titleKey: "initialScreeningTitle", descKey: "initialScreeningDesc" },
                  { step: "2", titleKey: "riskAssessmentTitle", descKey: "riskAssessmentDesc" },
                  { step: "3", titleKey: "ongoingMonitoringTitle", descKey: "ongoingMonitoringDesc" },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-3">
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-500/60 text-blue-400 font-serif text-lg"
                        style={{ fontFamily: "var(--font-serif), serif" }}
                      >
                        {item.step}
                      </span>
                      <h3
                        style={{
                          fontFamily: "var(--font-sans), sans-serif",
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "1.2rem",
                          lineHeight: "1.3",
                        }}
                      >
                        {t(`compliancePage.${item.titleKey}`)}
                      </h3>
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.85)",
                          fontSize: "1rem",
                          lineHeight: "1.7",
                        }}
                      >
                        {t(`compliancePage.${item.descKey}`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Continuous Improvement */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h2
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    color: "#ffffff",
                    fontWeight: 400,
                    fontSize: "clamp(2rem, 4vw, 2.5rem)",
                    lineHeight: "1.2",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("compliancePage.continuousImprovementTitle")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("compliancePage.continuousImprovementDesc")}
                </p>
              </div>
              {/* Mobile: carousel. Desktop: grid unchanged. */}
              <div className="md:hidden">
                <ContinuousImprovementCarousel t={t} />
              </div>
              <div className="hidden md:grid grid-cols-3 gap-6">
                {[
                  { titleKey: "regulatoryMonitoringTitle", descKey: "regulatoryMonitoringDesc" },
                  { titleKey: "internalTrainingTitle", descKey: "internalTrainingDesc" },
                  { titleKey: "advisorySupportTitle", descKey: "advisorySupportDesc" },
                ].map((item, i) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-3">
                      <h3
                        style={{
                          fontFamily: "var(--font-sans), sans-serif",
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "1.2rem",
                          lineHeight: "1.3",
                        }}
                      >
                        {t(`compliancePage.${item.titleKey}`)}
                      </h3>
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.85)",
                          fontSize: "1rem",
                          lineHeight: "1.7",
                        }}
                      >
                        {t(`compliancePage.${item.descKey}`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Navigating Complex Regulatory Environments – mobile: CTA only, expand for text (Trusted Partner style). Desktop: full box. */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="group relative overflow-hidden px-0 py-0 -mt-10 mb-24 md:mt-0 md:mb-16 md:rounded-lg md:border md:border-white/10 md:bg-gradient-to-br md:from-white/5 md:to-white/0 md:p-8 md:p-10 md:hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block" />
              <div className="relative z-10">
                <h2
                  className="hidden md:block"
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    color: "#ffffff",
                    fontWeight: 400,
                    fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                    lineHeight: "1.2",
                    letterSpacing: "-0.02em",
                    marginBottom: "1rem",
                  }}
                >
                  {t("compliancePage.navigatingTitle")}
                </h2>
                <p
                  className="hidden md:block"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("compliancePage.navigatingDesc")}
                </p>
                {/* Mobile only: CTA then description below when expanded */}
                <div className="md:hidden mt-2">
                  <button
                    type="button"
                    onClick={() => setNavigatingExpanded((v) => !v)}
                    className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99] text-left"
                    aria-expanded={navigatingExpanded}
                    aria-label={
                      navigatingExpanded
                        ? "Collapse (tap again)"
                        : "Expand to view details"
                    }
                  >
                    <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 500 }}>
                      {t("compliancePage.navigatingTitle")}
                    </span>
                    {navigatingExpanded ? (
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex shrink-0"
                      >
                        <ChevronUp className="w-4 h-4 text-[#3d7dd4]/90" strokeWidth={1.8} />
                      </motion.span>
                    ) : (
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex shrink-0"
                      >
                        <ChevronDown className="w-4 h-4 text-[#3d7dd4]/90" strokeWidth={1.8} />
                      </motion.span>
                    )}
                  </button>
                  <p
                    className={navigatingExpanded ? "block mt-3" : "hidden"}
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: "1rem",
                      lineHeight: "1.7",
                      fontWeight: 300,
                    }}
                  >
                    {t("compliancePage.navigatingDesc")}
                  </p>
                </div>
            </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center pt-0 pb-16 space-y-8 -mt-8"
            >
              <h2
                style={{
                  fontFamily: "var(--font-serif), serif",
                  color: "#ffffff",
                  fontWeight: 400,
                  fontSize: "clamp(2rem, 4vw, 2.5rem)",
                  lineHeight: "1.3",
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                }}
              >
                {t("compliancePage.ctaTitle")}
              </h2>
              <button
                type="button"
                onClick={() => router.push("/contact")}
                className="group relative inline-flex items-center gap-3 px-12 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ pointerEvents: "auto" }}
              >
                <span className="relative z-10">{t("common.contactComplianceTeam")}</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">
                  →
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </motion.div>
          </div>

          {/* Footnote */}
          <div className="w-full pb-0 mt-8">
            <div className="mx-auto w-full max-w-7xl px-8 md:px-12 border-t border-white/20 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <p className="text-white/70 text-xs">
                  © {new Date().getFullYear()} {t("footer.copyrightSuffix")}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-xs text-white/70">
                  <a href="/about" className="hover:text-white transition-colors">{t("footer.aboutUs")}</a>
                  <a href="/contact" className="hover:text-white transition-colors">{t("footer.contact")}</a>
                  <a href="/Futura_Energy_Privacy_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.privacy")}</a>
                  <a href="/Futura_Energy_Cookie_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.cookies")}</a>
                  <a href="/Futura_Energy_Terms_of_Use.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.terms")}</a>
              </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
