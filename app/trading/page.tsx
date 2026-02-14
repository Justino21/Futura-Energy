"use client"

import { SiteHeader } from "@/components/site-header"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/src/contexts/language-context"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

// Auto Counter component that counts up automatically when in view
function AutoCounter({ 
  targetValue, 
  suffix = '', 
  prefix = '',
  finalDisplay = '',
  isInView = false,
  duration = 1500
}: { 
  targetValue: number; 
  suffix?: string; 
  prefix?: string;
  finalDisplay?: string;
  isInView?: boolean;
  duration?: number;
}) {
  const [count, setCount] = useState(0)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    if (!isInView) {
      // Reset when out of view
      setCount(0)
      setShowFinal(false)
      return
    }

    // Start countup animation
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + (targetValue - startValue) * eased)
      
      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // After reaching target, show final display if provided
        if (finalDisplay) {
          setTimeout(() => setShowFinal(true), 200)
        }
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, targetValue, duration, finalDisplay])

  return (
    <span className="tabular-nums relative inline-block">
      {/* Counting number - fades out when final display appears */}
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: showFinal && finalDisplay ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="inline-block"
      >
        {prefix}{count.toLocaleString()}{suffix}
      </motion.span>
      
      {/* Final display - fades in after countup completes; centered above label */}
      {finalDisplay && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: showFinal ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute left-1/2 top-0 -translate-x-1/2 inline-block whitespace-nowrap"
        >
          {finalDisplay}
        </motion.span>
      )}
    </span>
  )
}

const CORE_PRODUCTS = [
  { titleKey: "tradingPage.crudeOil", descKey: "tradingPage.crudeOilDesc" },
  { titleKey: "tradingPage.middleDistillates", descKey: "tradingPage.middleDistillatesDesc" },
  { titleKey: "tradingPage.fuelOilFeedstocks", descKey: "tradingPage.fuelOilFeedstocksDesc" },
  { titleKey: "tradingPage.lightProducts", descKey: "tradingPage.lightProductsDesc" },
] as const

function CoreProductsCarousel({ t }: { t: (key: string) => string }) {
  const [api, setApi] = useState<CarouselApi | undefined>()
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    const onSelect = () => setSelected(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => api.off("select", onSelect)
  }, [api])

  /* Mobile: blue outline + blue glow always on; desktop would use white border + hover (carousel is mobile-only) */
  const cardClass =
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm p-6 min-h-[180px] flex flex-col"
  const h3Style = {
    fontFamily: "var(--font-sans), sans-serif",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "1.35rem",
    lineHeight: "1.3",
  } as const
  const pStyle = {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "1rem",
    lineHeight: "1.7",
  } as const

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: true, dragFree: false }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {CORE_PRODUCTS.map((item) => (
          <CarouselItem key={item.titleKey} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-3">
                <h3 style={h3Style}>{t(item.titleKey)}</h3>
                <p style={pStyle}>{t(item.descKey)}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {CORE_PRODUCTS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === selected
                ? "w-6 bg-white/90"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </Carousel>
  )
}

const PHYSICAL_CAPABILITY_ITEMS = [
  { titleKey: "tradingPage.dedicatedRegionalTeams", descKey: "tradingPage.dedicatedRegionalTeamsDesc" },
  { titleKey: "tradingPage.physicalDeliveryInfrastructure", descKey: "tradingPage.physicalDeliveryInfrastructureDesc" },
  { titleKey: "tradingPage.integratedLogisticsCoordination", descKey: "tradingPage.integratedLogisticsCoordinationDesc" },
] as const

function PhysicalCapabilityCarousel({ t }: { t: (key: string) => string }) {
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
  const h3Style = {
    fontFamily: "var(--font-sans), sans-serif",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "1.3rem",
    lineHeight: "1.3",
  } as const
  const pStyle = {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "1rem",
    lineHeight: "1.7",
  } as const

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: true, dragFree: false }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {PHYSICAL_CAPABILITY_ITEMS.map((item) => (
          <CarouselItem key={item.titleKey} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-3">
                <h3 style={h3Style}>{t(item.titleKey)}</h3>
                <p style={pStyle}>{t(item.descKey)}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {PHYSICAL_CAPABILITY_ITEMS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === selected
                ? "w-6 bg-white/90"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </Carousel>
  )
}

const TRUSTED_PARTNER_ITEMS = [
  { titleKey: "tradingPage.reliableExecution", descKey: "tradingPage.reliableExecutionDesc" },
  { titleKey: "tradingPage.operationalFlexibility", descKey: "tradingPage.operationalFlexibilityDesc" },
  { titleKey: "tradingPage.longTermCommitment", descKey: "tradingPage.longTermCommitmentDesc" },
] as const

function TrustedPartnerCarousel({ t }: { t: (key: string) => string }) {
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
  const h3Style = {
    fontFamily: "var(--font-sans), sans-serif",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "1.2rem",
    lineHeight: "1.3",
  } as const
  const pStyle = {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "1rem",
    lineHeight: "1.7",
  } as const

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: true, dragFree: false }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {TRUSTED_PARTNER_ITEMS.map((item) => (
          <CarouselItem key={item.titleKey} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                    <span className="text-blue-400 text-lg">✓</span>
                  </div>
                  <h3 style={h3Style}>{t(item.titleKey)}</h3>
                </div>
                <p style={pStyle}>{t(item.descKey)}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {TRUSTED_PARTNER_ITEMS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === selected
                ? "w-6 bg-white/90"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </Carousel>
  )
}

export default function TradingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLElement>(null)
  const cgiSectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const { scrollYProgress: cgiScrollProgress } = useScroll({
    target: cgiSectionRef,
    offset: ["start end", "end start"]
  })
  const cgiParallaxY = useTransform(cgiScrollProgress, [0, 0.5, 1], [24, 0, -24])
  
  const isStatsInView = useInView(statsRef, { once: false, margin: "-100px" })
  const [geoRegionOpen, setGeoRegionOpen] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [tradingModelExpanded, setTradingModelExpanded] = useState(false)

  // Fade out as user scrolls (starts fading at 0, fully faded at 0.3)
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <>
      <SiteHeader />

      <main className="relative" style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
        {/* Hero Video Section */}
        <section 
          ref={heroRef}
          className="relative w-full h-screen overflow-hidden"
          style={{ backgroundColor: '#000' }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/Futura_Ultimate.png"
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              imageRendering: 'crisp-edges',
              WebkitImageRendering: 'crisp-edges',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
            // @ts-expect-error fetchPriority is valid for faster mobile load
            fetchPriority="high"
          >
            <source src="/Futura_Trade_Hero2.0.mp4" type="video/mp4" />
          </video>
          
          {/* Hero Title and Subtitle */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8"
            style={{ opacity }}
          >
            {/* Glass Overlay for Text Readability */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
              }}
            />
            
            {/* Text Content */}
            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[clamp(2.8rem,7vw,5rem)] font-serif tracking-[-0.02em] text-white leading-[1.05] mb-6 text-center"
              >
                {t("tradingPage.heroTitle")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-[clamp(1.1rem,2.5vw,1.5rem)] text-white/90 leading-[1.6] text-center font-light tracking-[0.02em]"
              >
                {t("tradingPage.heroSubtitle")}
              </motion.p>
            </div>
          </motion.div>
          
          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            style={{ opacity }}
            initial={{ y: 0 }}
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-white/80 text-xs tracking-wider uppercase font-light">{t("common.scroll")}</span>
            <ChevronDown 
              className="w-8 h-8 text-white/80" 
              strokeWidth={1.5}
            />
          </motion.div>
        </section>

        {/* Stats Countup Section */}
        <section 
          ref={statsRef}
          className="relative w-full pt-8 pb-6 px-8 md:px-12"
          style={{ backgroundColor: '#000000' }}
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* ~1M Metric Tons / Month */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isStatsInView ? 1 : 0,
                  y: isStatsInView ? 0 : 20
                }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter 
                    targetValue={1000000}
                    finalDisplay="~1M"
                    isInView={isStatsInView}
                    duration={1500}
                  />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide">
                  {t("tradingPage.statMetricTons")}
                </div>
              </motion.div>

              {/* 2–3M Barrels Crude Oil / Month */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isStatsInView ? 1 : 0,
                  y: isStatsInView ? 0 : 20
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter 
                    targetValue={2500000}
                    finalDisplay="2–3M"
                    isInView={isStatsInView}
                    duration={1500}
                  />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide">
                  {t("tradingPage.statBarrels")}
                </div>
              </motion.div>

              {/* 110+ Global Partners */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isStatsInView ? 1 : 0,
                  y: isStatsInView ? 0 : 20
                }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter 
                    targetValue={110}
                    suffix="+"
                    isInView={isStatsInView}
                    duration={1500}
                  />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide">
                  {t("tradingPage.statGlobalPartners")}
                </div>
              </motion.div>

              {/* 5 Key Trading Regions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isStatsInView ? 1 : 0,
                  y: isStatsInView ? 0 : 20
                }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter 
                    targetValue={5}
                    isInView={isStatsInView}
                    duration={1500}
                  />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide">
                  {t("tradingPage.statKeyRegions")}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Page Content - after hero + volumes; mobile text scaled via .page-trading-content */}
        <section 
          className="page-trading-content"
          style={{
            position: 'relative',
            backgroundColor: '#000000',
            width: '100%',
            paddingTop: '4rem',
            paddingBottom: '2rem',
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-8 md:px-12 space-y-24">
            {/* Introduction - With CGI render */}
            <motion.div
              ref={cgiSectionRef}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <p style={{ 
                  color: '#ffffff', 
                  fontSize: '1.35rem', 
                  lineHeight: '1.9',
                  fontWeight: 300,
                }}>
                  {t("tradingPage.intro1")}
                </p>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: '1.2rem', 
                  lineHeight: '1.8',
                  fontWeight: 300,
                }}>
                  {t("tradingPage.intro2")}
                </p>
              </div>
              {/* Container has no visible border: video fades fully into page so edges are imperceptible */}
              <motion.div
                className="relative w-full max-w-xl mx-auto overflow-visible"
                style={{ height: '280px', y: cgiParallaxY }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: 'brightness(1.35) contrast(1.1)',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0) scale(1.05)',
                    willChange: 'transform',
                    mixBlendMode: 'screen',
                    opacity: 0.92,
                    maskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, black 15%, transparent 65%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, black 15%, transparent 65%)',
                  }}
                >
                  <source src="/cgi_trade.mp4" type="video/mp4" />
                </video>
              </motion.div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Core Traded Products - Card Layout */}
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
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t("tradingPage.coreProductsTitle")}
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '1.15rem', 
                  lineHeight: '1.7',
                }}>
                  {t("tradingPage.coreProductsDesc")}
                </p>
              </div>
              
              {/* Mobile: carousel (swipe + dots) */}
              <div className="md:hidden w-full">
                <CoreProductsCarousel t={t} />
              </div>
              {/* Desktop: grid unchanged */}
              <div className="hidden md:grid grid-cols-2 gap-6">
                {[
                  { titleKey: "tradingPage.crudeOil", descKey: "tradingPage.crudeOilDesc" },
                  { titleKey: "tradingPage.middleDistillates", descKey: "tradingPage.middleDistillatesDesc" },
                  { titleKey: "tradingPage.fuelOilFeedstocks", descKey: "tradingPage.fuelOilFeedstocksDesc" },
                  { titleKey: "tradingPage.lightProducts", descKey: "tradingPage.lightProductsDesc" },
                ].map((item, index) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 space-y-3">
                      <h3 style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        color: "#ffffff",
                        fontWeight: 500,
                        fontSize: '1.35rem',
                        lineHeight: '1.3',
                      }}>
                        {t(item.titleKey)}
                      </h3>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '1rem',
                        lineHeight: '1.7',
                      }}>
                        {t(item.descKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Geographic Trading Focus - With Map */}
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
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t("tradingPage.geoFocusTitle")}
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '1.15rem', 
                  lineHeight: '1.7',
                }}>
                  {t("tradingPage.geoFocusDesc")}
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  {[
                    { titleKey: "tradingPage.medBlackSea", descKey: "tradingPage.medBlackSeaDesc", index: 0 },
                    { titleKey: "tradingPage.westAfrica", descKey: "tradingPage.westAfricaDesc", index: 1 },
                    { titleKey: "tradingPage.latinAmerica", descKey: "tradingPage.latinAmericaDesc", index: 2 },
                  ].map(({ titleKey, descKey, index }) => (
                    <motion.div
                      key={titleKey}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="space-y-2 pl-4 border-l-2 border-blue-500/50 md:border-l-2"
                    >
                      {/* Desktop: plain title; Mobile: CTA with region name + jumping arrow */}
                      <div className="md:block">
                        <h3
                          className="hidden md:block"
                          style={{
                            fontFamily: "var(--font-sans), sans-serif",
                            color: "#ffffff",
                            fontWeight: 500,
                            fontSize: "1.3rem",
                            lineHeight: "1.3",
                          }}
                        >
                          {t(titleKey)}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setGeoRegionOpen((prev) => {
                              const next = [...prev] as [boolean, boolean, boolean]
                              next[index] = !next[index]
                              return next
                            })
                          }
                          className="md:hidden w-full flex items-center justify-between gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99] text-left"
                          aria-expanded={geoRegionOpen[index]}
                          aria-label={
                            geoRegionOpen[index]
                              ? `Collapse ${t(titleKey)}`
                              : `Expand ${t(titleKey)}`
                          }
                        >
                          <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 500 }}>
                            {t(titleKey)}
                          </span>
                          {geoRegionOpen[index] ? (
                            <motion.span
                              animate={{ y: [0, -3, 0] }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="inline-flex shrink-0"
                            >
                              <ChevronUp className="w-4 h-4 text-[#3d7dd4]/90" strokeWidth={1.8} />
                            </motion.span>
                          ) : (
                            <motion.span
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="inline-flex shrink-0"
                            >
                              <ChevronDown className="w-4 h-4 text-[#3d7dd4]/90" strokeWidth={1.8} />
                            </motion.span>
                          )}
                        </button>
                      </div>
                      <p
                        className={geoRegionOpen[index] ? "block" : "hidden md:block"}
                        style={{
                          color: "rgba(255, 255, 255, 0.85)",
                          fontSize: "1.05rem",
                          lineHeight: "1.7",
                        }}
                      >
                        {t(descKey)}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8 }}
                  className="relative h-[400px] rounded-lg overflow-hidden"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(0.6) contrast(1.2)',
                      objectPosition: 'right center',
                    }}
                  >
                    <source src="/globe.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </motion.div>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  fontSize: '1.1rem', 
                  lineHeight: '1.8',
                  marginTop: '2rem',
                  fontStyle: 'italic',
                }}
              >
                {t("tradingPage.regionalFocusQuote")}
              </motion.p>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Trading Model & Market Approach - With Image */}
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
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t("tradingPage.tradingModelTitle")}
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '1.15rem', 
                  lineHeight: '1.7',
                }}>
                  {t("tradingPage.tradingModelSubtitle")}
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  {/* Mobile: CTA to expand; Desktop: always show content */}
                  <div className={tradingModelExpanded ? "block" : "hidden md:block"}>
                    <p style={{ 
                      color: '#ffffff', 
                      fontSize: '1.2rem', 
                      lineHeight: '1.9',
                      fontWeight: 300,
                    }}>
                      {t("tradingPage.tradingModelPara")}
                    </p>

                    <div className="space-y-4 pl-4 border-l-2 border-blue-500/50 mt-6">
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.5 }}
                        className="flex items-start gap-4"
                      >
                        <span className="text-blue-400 text-xl mt-1">→</span>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          fontSize: '1.05rem', 
                          lineHeight: '1.8',
                        }}>
                          {t("tradingPage.bullet1")}
                        </p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-start gap-4"
                      >
                        <span className="text-blue-400 text-xl mt-1">→</span>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          fontSize: '1.05rem', 
                          lineHeight: '1.8',
                        }}>
                          {t("tradingPage.bullet2")}
                        </p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-start gap-4"
                      >
                        <span className="text-blue-400 text-xl mt-1">→</span>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          fontSize: '1.05rem', 
                          lineHeight: '1.8',
                        }}>
                          {t("tradingPage.bullet3")}
                        </p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex items-start gap-4"
                      >
                        <span className="text-blue-400 text-xl mt-1">→</span>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          fontSize: '1.05rem', 
                          lineHeight: '1.8',
                        }}>
                          {t("tradingPage.bullet4")}
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Mobile only: CTA to expand trading model text + 4 bullets */}
                  <div className="md:hidden">
                    <button
                      type="button"
                      onClick={() => setTradingModelExpanded((v) => !v)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99]"
                      aria-expanded={tradingModelExpanded}
                      aria-label={tradingModelExpanded ? "Collapse trading model details" : "Expand to view trading model and approach"}
                    >
                      <span>{tradingModelExpanded ? t("tradingPage.showLess") : t("tradingPage.viewTradingModel")}</span>
                      {tradingModelExpanded ? (
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
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8 }}
                  className="relative h-[400px] rounded-lg overflow-hidden"
                >
                  <img 
                    src="/image3_trade.jpeg"
                    alt="Trading Operations"
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(0.85) contrast(1.15)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {/* Subtle edge fade for smooth integration */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: `
                      radial-gradient(ellipse at center, transparent 0%, transparent 70%, rgba(0, 0, 0, 0.25) 100%),
                      linear-gradient(to right, rgba(0, 0, 0, 0.2) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.2) 100%)
                    `,
                  }} />
                  {/* Subtle border glow for integration */}
                  <div className="absolute inset-0 pointer-events-none rounded-lg" style={{
                    boxShadow: 'inset 0 0 60px 20px rgba(0, 0, 0, 0.3)',
                  }} />
                </motion.div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Physical Trading Capability - Enhanced Cards */}
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
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t("tradingPage.physicalCapabilityTitle")}
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '1.15rem', 
                  lineHeight: '1.7',
                }}>
                  {t("tradingPage.physicalCapabilityDesc")}
                </p>
              </div>
              
              {/* Mobile: carousel (same pattern as Core Traded Products) */}
              <div className="md:hidden w-full">
                <PhysicalCapabilityCarousel t={t} />
              </div>
              {/* Desktop: 3-column grid unchanged */}
              <div className="hidden md:grid grid-cols-3 gap-6">
                {PHYSICAL_CAPABILITY_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative group overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-3">
                      <h3 style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        color: "#ffffff",
                        fontWeight: 500,
                        fontSize: "1.3rem",
                        lineHeight: "1.3",
                      }}>
                        {t(item.titleKey)}
                      </h3>
                      <p style={{
                        color: "rgba(255, 255, 255, 0.85)",
                        fontSize: "1rem",
                        lineHeight: "1.7",
                      }}>
                        {t(item.descKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* A Trusted Trading Partner - Enhanced Cards */}
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
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t("tradingPage.trustedPartnerTitle")}
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '1.15rem', 
                  lineHeight: '1.7',
                }}>
                  {t("tradingPage.trustedPartnerSubtitle")}
                </p>
              </div>
              
              {/* Mobile: carousel (same pattern as Core Products / Physical Capability) */}
              <div className="md:hidden w-full">
                <TrustedPartnerCarousel t={t} />
              </div>
              {/* Desktop: 3-column grid unchanged */}
              <div className="hidden md:grid grid-cols-3 gap-6">
                {TRUSTED_PARTNER_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                          <span className="text-blue-400 text-lg">✓</span>
                        </div>
                        <h3 style={{
                          fontFamily: "var(--font-sans), sans-serif",
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "1.2rem",
                          lineHeight: "1.3",
                        }}>
                          {t(item.titleKey)}
                        </h3>
                      </div>
                      <p style={{
                        color: "rgba(255, 255, 255, 0.85)",
                        fontSize: "1rem",
                        lineHeight: "1.7",
                      }}>
                        {t(item.descKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
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
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  lineHeight: '1.3',
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                }}
              >
                {t("tradingPage.ctaTitle")}
              </h2>
              
              <button
                type="button"
                onClick={() => router.push('/contact')}
                className="group relative inline-flex items-center gap-3 px-12 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
                style={{
                  pointerEvents: 'auto',
                }}
              >
                <span className="relative z-10">{t("common.contactTradingDesk")}</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">→</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </motion.div>
          </div>

          {/* Footnote - Full Width */}
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
