"use client"

import { SiteHeader } from "@/components/site-header"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useRef, useState, useEffect } from "react"
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

function OperationalFootprintCarousel({ t }: { t: (k: string) => string }) {
  const [api, setApi] = useState<CarouselApi | undefined>()
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    api.on("select", () => setSelected(api.selectedScrollSnap()))
    return () => api.off("select")
  }, [api])
  const cardClass =
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm p-6 min-h-[160px] flex flex-col"
  const dubaiCard = (
    <div className={cardClass}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 space-y-4">
        <p className="text-white/70 text-sm font-medium uppercase tracking-wide">{t("globalPage.dubai")}</p>
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 style={{ fontFamily: "var(--font-sans), sans-serif", color: "#ffffff", fontWeight: 500, fontSize: "1.15rem" }}>
              {t("globalPage.headquarters")}
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.5" }}>{t("globalPage.headquartersDesc")}</p>
          </div>
          <div className="pt-2 border-t border-white/10 space-y-1">
            <h3 style={{ fontFamily: "var(--font-sans), sans-serif", color: "#ffffff", fontWeight: 500, fontSize: "1.15rem" }}>
              {t("globalPage.tradingOffice")}
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.5" }}>{t("globalPage.tradingOfficeDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  )
  const offices = [
    { location: t("contactPage.serbia"), title: t("globalPage.operationalTeam"), desc: t("globalPage.operationalTeamDesc") },
    { location: t("contactPage.turkey"), title: t("globalPage.operationalTeam"), desc: t("globalPage.operationalTeamMed") },
    { location: t("contactPage.switzerland"), title: t("globalPage.operationalTeam"), desc: t("globalPage.operationalTeamEu") },
  ]
  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        <CarouselItem className="pl-2 md:pl-4 basis-full">{dubaiCard}</CarouselItem>
        {offices.map((office) => (
          <CarouselItem key={office.location} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <p className="text-white/70 text-sm font-medium uppercase tracking-wide">{office.location}</p>
                <h3 style={{ fontFamily: "var(--font-sans), sans-serif", color: "#ffffff", fontWeight: 500, fontSize: "1.15rem" }}>{office.title}</h3>
                <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.5" }}>{office.desc}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
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

function EstablishedRelationsCarousel({ t }: { t: (k: string) => string }) {
  const [api, setApi] = useState<CarouselApi | undefined>()
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    api.on("select", () => setSelected(api.selectedScrollSnap()))
    return () => api.off("select")
  }, [api])
  const cardClass =
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm p-6 min-h-[160px] flex flex-col"
  const items = [
    { title: t("globalPage.majorRefineries"), desc: t("globalPage.majorRefineriesDesc") },
    { title: t("globalPage.nationalOilCompanies"), desc: t("globalPage.nationalOilCompaniesDesc") },
    { title: t("globalPage.tradingCompanies"), desc: t("globalPage.tradingCompaniesDesc") },
  ]
  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {items.map((item) => (
          <CarouselItem key={item.title} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-3">
                <h3 style={{ fontFamily: "var(--font-sans), sans-serif", color: "#ffffff", fontWeight: 500, fontSize: "1.1rem" }}>{item.title}</h3>
                <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
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

const KEY_MARKETS_ROWS = [
  { marketKey: "marketMorocco", productsKey: "productsMorocco", counterpartiesKey: "counterpartiesMorocco" },
  { marketKey: "marketBolivia", productsKey: "productsBolivia", counterpartiesKey: "counterpartiesBolivia" },
  { marketKey: "marketGhana", productsKey: "productsGhana", counterpartiesKey: "counterpartiesGhana" },
  { marketKey: "marketSenegal", productsKey: "productsSenegal", counterpartiesKey: "counterpartiesSenegal" },
] as const

function KeyMarketsCarousel({ t }: { t: (k: string) => string }) {
  const [api, setApi] = useState<CarouselApi | undefined>()
  const [selected, setSelected] = useState(0)
  const [expandedMarkets, setExpandedMarkets] = useState<boolean[]>([false, false, false, false])
  useEffect(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    api.on("select", () => setSelected(api.selectedScrollSnap()))
    return () => api.off("select")
  }, [api])
  const toggleMarket = (index: number) => {
    setExpandedMarkets((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }
  const cardClass =
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/60 hover:shadow-[0_0_14px_rgba(59,130,246,0.25)] active:border-blue-500/60 active:shadow-[0_0_14px_rgba(59,130,246,0.25)]"
  const renderCard = (row: (typeof KEY_MARKETS_ROWS)[number], index: number) => {
    const isOpen = expandedMarkets[index]
    const marketName = t(`globalPage.${row.marketKey}`)
    return (
      <div key={row.marketKey} className={cardClass}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => toggleMarket(index)}
            className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded border-0 bg-transparent text-left hover:bg-white/5 transition-colors"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse ${marketName}` : `Expand ${marketName}`}
          >
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "1rem",
                lineHeight: "1.4",
              }}
            >
              {marketName}
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
          {isOpen && (
            <>
              <div className="py-3 px-4 border-t border-white/15">
                <p className="text-white text-xs font-semibold uppercase tracking-wide mb-0.5">
                  {t("globalPage.productsVolumes")}
                </p>
                <p style={{ color: "#ffffff", fontSize: "0.9rem", lineHeight: "1.55" }}>
                  {t(`globalPage.${row.productsKey}`)}
                </p>
              </div>
              <div className="py-3 px-4 border-t border-white/15">
                <p className="text-white text-xs font-semibold uppercase tracking-wide mb-0.5">
                  {t("globalPage.counterparties")}
                </p>
                <p style={{ color: "#ffffff", fontSize: "0.9rem", lineHeight: "1.55" }}>
                  {t(`globalPage.${row.counterpartiesKey}`)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  /* Mobile: 2 slides, 2 markets stacked per slide; each market is a CTA that expands to show details. */
  const slide0 = [KEY_MARKETS_ROWS[0], KEY_MARKETS_ROWS[1]]
  const slide1 = [KEY_MARKETS_ROWS[2], KEY_MARKETS_ROWS[3]]
  const slides = [slide0, slide1]
  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {slides.map((pair, slideIndex) => (
          <CarouselItem key={slideIndex} className="pl-2 md:pl-4 basis-full">
            <div className="space-y-4">
              {pair.map((row, i) => renderCard(row, slideIndex * 2 + i))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
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

export default function GlobalPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const isStatsInView = useInView(statsRef, { once: false, margin: "-100px" })
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const [tradingRegionOpen, setTradingRegionOpen] = useState<boolean[]>([false, false, false, false, false])
  const [privilegedExpanded, setPrivilegedExpanded] = useState(false)

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
            <source src="/global_hero.mp4" type="video/mp4" />
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
                {t("globalPage.pageTitle")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-[clamp(1.1rem,2.5vw,1.5rem)] text-white/90 leading-[1.6] text-center font-light tracking-[0.02em] max-w-2xl mx-auto"
              >
                {t("globalPage.heroSubtitle")}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isStatsInView ? 1 : 0, y: isStatsInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter targetValue={5} isInView={isStatsInView} duration={1500} />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide uppercase">
                  {t("globalPage.statGlobalRegions")}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isStatsInView ? 1 : 0, y: isStatsInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter
                    targetValue={110}
                    finalDisplay="110+"
                    isInView={isStatsInView}
                    duration={1500}
                  />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide uppercase">
                  {t("globalPage.statReliablePartners")}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isStatsInView ? 1 : 0, y: isStatsInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter targetValue={4} isInView={isStatsInView} duration={1500} />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide uppercase">
                  {t("globalPage.statOperationalOffices")}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isStatsInView ? 1 : 0, y: isStatsInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  {t("globalPage.since2022")}
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide uppercase">
                  {t("globalPage.statYearIncorporation")}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Page Content – after hero + values; mobile text scaled via .page-global-content */}
        <section
          className="page-global-content"
          style={{
            position: "relative",
            backgroundColor: "#000000",
            width: "100%",
            paddingTop: "4rem",
            paddingBottom: "2rem",
          }}
        >
          <div className="page-global-inner mx-auto w-full max-w-7xl px-8 md:px-12 space-y-24">
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-0"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("globalPage.intro1")}
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("globalPage.intro2")}
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("globalPage.intro3")}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative rounded-lg overflow-hidden h-[280px] lg:h-[380px] w-full mt-6"
              >
                <img
                  src="/world_map_blue.jpeg"
                  alt="Global presence map"
                  className="w-full h-full object-cover object-[center_70%]"
                />
              </motion.div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Operational Footprint */}
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
                  {t("globalPage.operationalFootprintTitle")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("globalPage.operationalFootprintDesc")}
                </p>
              </div>

              {/* Mobile: carousel. Desktop: grid unchanged. */}
              <div className="md:hidden">
                <OperationalFootprintCarousel t={t} />
              </div>
              <div className="hidden md:grid grid-cols-2 gap-6">
                {/* Dubai: single card with Headquarters + Trading Office */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: 0 }}
                  className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-4">
                    <p className="text-white/70 text-sm font-medium uppercase tracking-wide">{t("globalPage.dubai")}</p>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3
                          style={{
                            fontFamily: "var(--font-sans), sans-serif",
                            color: "#ffffff",
                            fontWeight: 500,
                            fontSize: "1.15rem",
                          }}
                        >
                          {t("globalPage.headquarters")}
                        </h3>
                        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.5" }}>
                          {t("globalPage.headquartersDesc")}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <h3
                          style={{
                            fontFamily: "var(--font-sans), sans-serif",
                            color: "#ffffff",
                            fontWeight: 500,
                            fontSize: "1.15rem",
                          }}
                        >
                          {t("globalPage.tradingOffice")}
                        </h3>
                        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.5" }}>
                          {t("globalPage.tradingOfficeDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                {[
                  { location: t("contactPage.serbia"), title: t("globalPage.operationalTeam"), desc: t("globalPage.operationalTeamDesc") },
                  { location: t("contactPage.turkey"), title: t("globalPage.operationalTeam"), desc: t("globalPage.operationalTeamMed") },
                  { location: t("contactPage.switzerland"), title: t("globalPage.operationalTeam"), desc: t("globalPage.operationalTeamEu") },
                ].map((office, i) => (
                  <motion.div
                    key={office.location + office.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: (i + 1) * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 space-y-2">
                      <p className="text-white/70 text-sm font-medium uppercase tracking-wide">
                        {office.location}
                      </p>
                      <h3
                        style={{
                          fontFamily: "var(--font-sans), sans-serif",
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "1.15rem",
                        }}
                      >
                        {office.title}
                      </h3>
                      <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.5" }}>
                        {office.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pl-4 border-l-2 border-blue-500/50">
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "1.05rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("globalPage.multiJurisdictionalText")}
                </p>
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Trading Footprint */}
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
                  {t("globalPage.tradingFootprintTitle")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("globalPage.tradingFootprintDesc")}
                </p>
              </div>

              {/* Mobile: dropdown CTAs (like Geographic Trading Focus regions). Desktop: grid unchanged. */}
              <div className="md:hidden space-y-6">
                {[
                  { titleKey: "regionMedSea", descKey: "regionMedSeaDesc" },
                  { titleKey: "regionBlackSea", descKey: "regionBlackSeaDesc" },
                  { titleKey: "regionNorthAfrica", descKey: "regionNorthAfricaDesc" },
                  { titleKey: "regionWestAfrica", descKey: "regionWestAfricaDesc" },
                  { titleKey: "regionSouthAmerica", descKey: "regionSouthAmericaDesc" },
                ].map((region, index) => (
                  <motion.div
                    key={region.titleKey}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="space-y-2 pl-4 border-l-2 border-blue-500/50"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setTradingRegionOpen((prev) => {
                          const next = [...prev]
                          next[index] = !next[index]
                          return next
                        })
                      }
                      className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99] text-left"
                      aria-expanded={tradingRegionOpen[index]}
                    >
                      <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 500 }}>
                        {t(`globalPage.${region.titleKey}`)}
                      </span>
                      {tradingRegionOpen[index] ? (
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
                      className={tradingRegionOpen[index] ? "block" : "hidden"}
                      style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "1.05rem", lineHeight: "1.7" }}
                    >
                      {t(`globalPage.${region.descKey}`)}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { titleKey: "regionMedSea", descKey: "regionMedSeaDesc" },
                  { titleKey: "regionBlackSea", descKey: "regionBlackSeaDesc" },
                  { titleKey: "regionNorthAfrica", descKey: "regionNorthAfricaDesc" },
                  { titleKey: "regionWestAfrica", descKey: "regionWestAfricaDesc" },
                  { titleKey: "regionSouthAmerica", descKey: "regionSouthAmericaDesc" },
                ].map((region, i) => (
                  <motion.div
                    key={region.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="pl-4 border-l-2 border-blue-500/50 space-y-2"
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        color: "#ffffff",
                        fontWeight: 500,
                        fontSize: "1.1rem",
                      }}
                    >
                      {t(`globalPage.${region.titleKey}`)}
                    </h3>
                    <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                      {t(`globalPage.${region.descKey}`)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Key Markets & Volumes */}
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
                  {t("globalPage.keyMarketsAndVolumes")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("globalPage.keyMarketsDesc")}
                </p>
              </div>

              {/* Mobile: carousel (4 market cards). Desktop: table unchanged. */}
              <div className="md:hidden">
                <KeyMarketsCarousel t={t} />
              </div>
              <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-blue-500/30 bg-white/5">
                        <th
                          className="text-left py-4 px-6 text-white/90 text-xs font-semibold uppercase tracking-widest"
                          style={{ minWidth: "140px" }}
                        >
                          {t("globalPage.market")}
                        </th>
                        <th
                          className="text-left py-4 px-6 text-white/90 text-xs font-semibold uppercase tracking-widest"
                          style={{ minWidth: "260px" }}
                        >
                          {t("globalPage.productsVolumes")}
                        </th>
                        <th className="text-left py-4 px-6 text-white/90 text-xs font-semibold uppercase tracking-widest">
                          {t("globalPage.counterparties")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { marketKey: "marketMorocco", productsKey: "productsMorocco", counterpartiesKey: "counterpartiesMorocco" },
                        { marketKey: "marketBolivia", productsKey: "productsBolivia", counterpartiesKey: "counterpartiesBolivia" },
                        { marketKey: "marketGhana", productsKey: "productsGhana", counterpartiesKey: "counterpartiesGhana" },
                        { marketKey: "marketSenegal", productsKey: "productsSenegal", counterpartiesKey: "counterpartiesSenegal" },
                      ].map((row) => (
                        <tr
                          key={row.marketKey}
                          className="border-b border-white/10 last:border-b-0 transition-colors duration-150 hover:bg-white/[0.04]"
                        >
                          <td
                            className="py-5 px-6 align-top"
                            style={{
                              fontFamily: "var(--font-sans), sans-serif",
                              color: "#ffffff",
                              fontWeight: 600,
                              fontSize: "1rem",
                              lineHeight: "1.4",
                            }}
                          >
                            {t(`globalPage.${row.marketKey}`)}
                          </td>
                          <td
                            className="py-5 px-6 align-top"
                            style={{
                              color: "rgba(255, 255, 255, 0.88)",
                              fontSize: "0.95rem",
                              lineHeight: "1.55",
                            }}
                          >
                            {t(`globalPage.${row.productsKey}`)}
                          </td>
                          <td
                            className="py-5 px-6 align-top"
                            style={{
                              color: "rgba(255, 255, 255, 0.82)",
                              fontSize: "0.95rem",
                              lineHeight: "1.55",
                            }}
                          >
                            {t(`globalPage.${row.counterpartiesKey}`)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Established Relationships */}
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
                  {t("globalPage.establishedRelations")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("globalPage.establishedRelationsDesc")}
                </p>
              </div>

              {/* Mobile: carousel. Desktop: grid unchanged. */}
              <div className="md:hidden">
                <EstablishedRelationsCarousel t={t} />
              </div>
              <div className="hidden md:grid grid-cols-3 gap-6">
                {[
                  { title: t("globalPage.majorRefineries"), desc: t("globalPage.majorRefineriesDesc") },
                  { title: t("globalPage.nationalOilCompanies"), desc: t("globalPage.nationalOilCompaniesDesc") },
                  { title: t("globalPage.tradingCompanies"), desc: t("globalPage.tradingCompaniesDesc") },
                ].map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 space-y-3">
                      <h3
                        style={{
                          fontFamily: "var(--font-sans), sans-serif",
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "1.1rem",
                        }}
                      >
                        {card.title}
                      </h3>
                      <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                        {card.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Privileged Relationships – mobile: CTA only, expand for text (like Navigating on compliance). Desktop: full box. */}
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
                    marginBottom: "1.5rem",
                  }}
                >
                  {t("globalPage.privilegedRelationsTitle")}
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
                  {t("globalPage.privilegedRelationsParagraph")}
                </p>
                <div className="md:hidden mt-2">
                  <button
                    type="button"
                    onClick={() => setPrivilegedExpanded((v) => !v)}
                    className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99] text-left"
                    aria-expanded={privilegedExpanded}
                    aria-label={privilegedExpanded ? "Collapse" : "Expand to view details"}
                  >
                    <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 500 }}>
                      {t("globalPage.privilegedRelationsTitle")}
                    </span>
                    {privilegedExpanded ? (
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
                    className={privilegedExpanded ? "block mt-3" : "hidden"}
                    style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "1rem", lineHeight: "1.7", fontWeight: 300 }}
                  >
                    {t("globalPage.privilegedRelationsParagraph")}
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
                {t("globalPage.ctaTitle")}
              </h2>
              <button
                type="button"
                onClick={() => router.push("/contact")}
                className="group relative inline-flex items-center gap-3 px-12 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ pointerEvents: "auto" }}
              >
                <span className="relative z-10">{t("common.contactOurTeam")}</span>
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
