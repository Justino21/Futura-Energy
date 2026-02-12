"use client"

import { SiteHeader } from "@/components/site-header"
import { motion, useScroll, useTransform, useInView, useMotionValueEvent } from "framer-motion"
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

const STORAGE_NETWORK_ITEMS: {
  titleKey: string
  rows: { locationKey: string; capacityKey: string }[]
}[] = [
  {
    titleKey: "logisticsPage.ulsdStorage",
    rows: [
      { locationKey: "logisticsPage.storageLocationRomania", capacityKey: "logisticsPage.storageCapacity60000Mts" },
      { locationKey: "logisticsPage.storageLocationMersinTurkey", capacityKey: "logisticsPage.storageCapacity65000Mts" },
      { locationKey: "logisticsPage.storageLocationMersinTurkey", capacityKey: "logisticsPage.storageCapacity30000Mts" },
    ],
  },
  {
    titleKey: "logisticsPage.oilProductsTerminal",
    rows: [
      { locationKey: "logisticsPage.storageLocationSerbia", capacityKey: "logisticsPage.storageCapacity100000TsPlanned" },
      { locationKey: "logisticsPage.storageLocationMorocco", capacityKey: "logisticsPage.storageCapacity55000MtsPlanned" },
    ],
  },
  {
    titleKey: "logisticsPage.bitumenStorage",
    rows: [{ locationKey: "logisticsPage.storageLocationRomania", capacityKey: "logisticsPage.storageCapacity60000Mts" }],
  },
]

function StorageNetworkCarousel({ t }: { t: (key: string) => string }) {
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
    "group relative overflow-hidden rounded-lg border border-blue-500/40 bg-white/5 backdrop-blur-sm min-h-[200px] flex flex-col"

  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true, dragFree: false }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {STORAGE_NETWORK_ITEMS.map((item) => (
          <CarouselItem key={item.titleKey} className="pl-2 md:pl-4 basis-full">
            <div className={cardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="px-4 py-3 border-b border-white/10">
                  <span className="text-white/90 font-medium text-sm tracking-wide">{t(item.titleKey)}</span>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-white/70 text-xs font-medium uppercase tracking-wider">
                        {t("logisticsPage.location")}
                      </th>
                      <th className="px-4 py-3 text-white/70 text-xs font-medium uppercase tracking-wider">
                        {t("logisticsPage.capacity")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-white/90 text-sm">
                    {item.rows.map((row, i) => (
                      <tr
                        key={i}
                        className={i < item.rows.length - 1 ? "border-b border-white/5" : ""}
                      >
                        <td className="px-4 py-3">{t(row.locationKey)}</td>
                        <td className="px-4 py-3">{t(row.capacityKey)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {STORAGE_NETWORK_ITEMS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === selected ? "w-6 bg-white/90" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </Carousel>
  )
}

const STRATEGIC_VALUE_ITEMS = [
  { titleKey: "logisticsPage.bespokeSolutions", descKey: "logisticsPage.bespokeSolutionsDesc" },
  { titleKey: "logisticsPage.marketTiming", descKey: "logisticsPage.marketTimingDesc" },
  { titleKey: "logisticsPage.supplyContinuity", descKey: "logisticsPage.supplyContinuityDesc" },
] as const

function StrategicValueCarousel({ t }: { t: (key: string) => string }) {
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
    <Carousel setApi={setApi} opts={{ align: "start", loop: true, dragFree: false }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {STRATEGIC_VALUE_ITEMS.map((item) => (
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
        {STRATEGIC_VALUE_ITEMS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === selected ? "w-6 bg-white/90" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </Carousel>
  )
}

export default function LogisticsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLElement>(null)
  const [shippingOpen, setShippingOpen] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [trustedPartnerExpanded, setTrustedPartnerExpanded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const isStatsInView = useInView(statsRef, { once: false, margin: "-100px" })
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const [heroFaded, setHeroFaded] = useState(false)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setHeroFaded(latest >= 0.3)
  })

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
              filter: "brightness(1.3) contrast(1.5) saturate(1.1)",
              imageRendering: "crisp-edges",
              WebkitImageRendering: "crisp-edges",
              willChange: "transform",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
          >
            <source src="/trial_storage_hero.mp4" type="video/mp4" />
          </video>

          {/* Hero Title and Subtitle – opacity frozen once faded to avoid scroll-driven updates at bottom */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8"
            style={heroFaded ? { opacity: 0 } : { opacity }}
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
                {t("logisticsPage.pageTitle")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-[clamp(1.1rem,2.5vw,1.5rem)] text-white/90 leading-[1.6] text-center font-light tracking-[0.02em] max-w-2xl mx-auto"
              >
                {t("logisticsPage.heroSubtitle")}
              </motion.p>
          </div>
          </motion.div>

          {/* Scroll Indicator – opacity frozen when hero faded to avoid scroll-driven jitter */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            style={heroFaded ? { opacity: 0 } : { opacity }}
            initial={{ y: 0 }}
            animate={heroFaded ? { y: 0 } : { y: [0, 10, 0] }}
            transition={heroFaded ? { duration: 0 } : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isStatsInView ? 1 : 0, y: isStatsInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter
                    targetValue={300000}
                    finalDisplay="300,000+"
                    isInView={isStatsInView}
                    duration={1500}
                  />
                </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide">
                  {t("logisticsPage.statMtsTotal")}
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
                    targetValue={155000}
                    isInView={isStatsInView}
                    duration={1500}
                />
              </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide">
                  {t("logisticsPage.statMtsUlsd")}
            </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isStatsInView ? 1 : 0, y: isStatsInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-[clamp(2rem,4.5vw,2.75rem)] font-serif text-white mb-2">
                  <AutoCounter
                    targetValue={100000}
                    isInView={isStatsInView}
                    duration={1500}
                  />
          </div>
                <div className="text-white/80 text-sm md:text-base font-light tracking-wide">
                  {t("logisticsPage.statTsSerbia")}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Page Content - after hero + volumes; mobile text scaled via .page-logistics-content */}
        <section
          className="page-logistics-content"
          style={{
            position: "relative",
            backgroundColor: "#000000",
            width: "100%",
            paddingTop: "4rem",
            paddingBottom: "2rem",
          }}
        >
          <div className="page-logistics-inner mx-auto w-full max-w-7xl px-8 md:px-12 space-y-24">
            {/* Intro paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-8 lg:gap-12 items-start"
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
                    fontSize: "1.35rem",
                    lineHeight: "1.9",
                    fontWeight: 300,
                  }}
                >
                  {t("logisticsPage.intro1")}
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("logisticsPage.intro2")}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative rounded-lg overflow-hidden h-[280px] lg:h-[340px] w-full -mt-6 lg:-mt-8"
              >
                <img
                  src="/final_tank.png"
                  alt="Storage tank infrastructure"
                  className="w-full h-full object-contain object-center"
                  style={{ objectPosition: "center 58%" }}
                />
              </motion.div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Strategic Storage Network */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
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
                  {t("logisticsPage.strategicNetworkTitle")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("logisticsPage.strategicNetworkDesc")}
                </p>
              </motion.div>

              {/* Mobile: carousel; Desktop: 3-column grid */}
              <div className="lg:hidden w-full">
                <StorageNetworkCarousel t={t} />
              </div>
              <div className="hidden lg:grid grid-cols-3 gap-8">
                {STORAGE_NETWORK_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="px-4 py-3 border-b border-white/10">
                        <span className="text-white/90 font-medium text-sm tracking-wide">
                          {t(item.titleKey)}
                        </span>
                      </div>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-white/70 text-xs font-medium uppercase tracking-wider">
                              {t("logisticsPage.location")}
                            </th>
                            <th className="px-4 py-3 text-white/70 text-xs font-medium uppercase tracking-wider">
                              {t("logisticsPage.capacity")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-white/90 text-sm">
                          {item.rows.map((row, i) => (
                            <tr
                              key={i}
                              className={i < item.rows.length - 1 ? "border-b border-white/5" : ""}
                            >
                              <td className="px-4 py-3">{t(row.locationKey)}</td>
                              <td className="px-4 py-3">{t(row.capacityKey)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* The Strategic Value of Storage */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
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
                  {t("logisticsPage.strategicValueTitle")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.15rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("logisticsPage.strategicValueDesc")}
                </p>
              </motion.div>

              {/* Mobile: carousel; Desktop: 3-column grid */}
              <div className="md:hidden w-full">
                <StrategicValueCarousel t={t} />
              </div>
              <div className="hidden md:grid grid-cols-3 gap-6">
                {STRATEGIC_VALUE_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-3">
                      <h3
                        style={{
                          fontFamily: "var(--font-sans), sans-serif",
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "1.3rem",
                          lineHeight: "1.3",
                        }}
                      >
                        {t(item.titleKey)}
                      </h3>
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.85)",
                          fontSize: "1rem",
                          lineHeight: "1.7",
                        }}
                      >
                        {t(item.descKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Shipping & Maritime Operations – once: true so section doesn't re-animate on scroll */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
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
                  {t("logisticsPage.shippingTitle")}
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "1.15rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("logisticsPage.shippingDesc1")}
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.1rem",
                    lineHeight: "1.7",
                  }}
                >
                  {t("logisticsPage.shippingDesc2")}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  titleKey: "logisticsPage.deepSeaVessels",
                  sizeKey: "logisticsPage.deepSeaSize",
                  descKey: "logisticsPage.deepSeaDesc",
                  index: 0,
                },
                {
                  titleKey: "logisticsPage.regionalTankers",
                  sizeKey: "logisticsPage.regionalTankersSize",
                  descKey: "logisticsPage.regionalTankersDesc",
                  index: 1,
                },
                {
                  titleKey: "logisticsPage.riverLogistics",
                  sizeKey: "logisticsPage.riverLogisticsSize",
                  descKey: "logisticsPage.riverLogisticsDesc",
                  index: 2,
                },
              ].map(({ titleKey, sizeKey, descKey, index }) => (
                <motion.div
                  key={titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="pl-4 border-l-2 border-blue-500/50 space-y-2"
                >
                  {/* Desktop: plain title + size + desc */}
                  <h3
                    className="hidden md:block"
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      color: "#ffffff",
                      fontWeight: 500,
                      fontSize: "1.25rem",
                      lineHeight: "1.3",
                    }}
                  >
                    {t(titleKey)}
                  </h3>
                  {/* Mobile: CTA with title + jumping arrow */}
                  <button
                    type="button"
                    onClick={() =>
                      setShippingOpen((prev) => {
                        const next = [...prev] as [boolean, boolean, boolean]
                        next[index] = !next[index]
                        return next
                      })
                    }
                    className="md:hidden w-full flex items-center justify-between gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99] text-left"
                    aria-expanded={shippingOpen[index]}
                    aria-label={
                      shippingOpen[index] ? `Collapse ${t(titleKey)}` : `Expand ${t(titleKey)}`
                    }
                  >
                    <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 500 }}>
                      {t(titleKey)}
                    </span>
                    {shippingOpen[index] ? (
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
                    className={`text-white/80 text-sm font-medium ${shippingOpen[index] ? "block" : "hidden md:block"}`}
                  >
                    {t(sizeKey)}
                  </p>
                  <p
                    className={shippingOpen[index] ? "block" : "hidden md:block"}
                    style={{
                      color: "rgba(255, 255, 255, 0.85)",
                      fontSize: "1rem",
                      lineHeight: "1.7",
                    }}
                  >
                    {t(descKey)}
                  </p>
                </motion.div>
              ))}
              </div>

              {/* Vessel comparison image – isolated layer, no animation, prevents bounce/tweak from scroll or siblings */}
              <div
                className="w-full mt-10"
                style={{ contain: "layout paint", transform: "translateZ(0)" }}
              >
                <div className="relative inline-block max-w-full rounded-lg overflow-hidden bg-black -ml-2 md:-ml-3">
                  <img
                    src="/vessel_comp.png"
                    alt="Vessel size comparison"
                    className="block w-full h-auto"
                    style={{ verticalAlign: "middle" }}
                  />
                </div>
              </div>
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Trusted Partner for National Energy Security – mobile: CTA only, text below when expanded; tighter spacing. Desktop: full box. */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="group relative overflow-hidden px-4 py-0 -mt-10 mb-24 md:mt-0 md:mb-16 md:rounded-lg md:border md:border-white/10 md:bg-gradient-to-br md:from-white/5 md:to-white/0 md:p-8 md:p-10 md:hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
              >
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
                  {t("logisticsPage.trustedPartnerTitle")}
                </h2>
                {/* Desktop: description right after title */}
                <p
                  className="hidden md:block"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    fontWeight: 300,
                  }}
                >
                  {t("logisticsPage.trustedPartnerDesc")}
                </p>
                {/* Mobile only: CTA then description below when expanded */}
                <div className="md:hidden mt-2">
                  <button
                    type="button"
                    onClick={() => setTrustedPartnerExpanded((v) => !v)}
                    className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded border border-[#3d7dd4]/50 bg-[#3d7dd4]/5 text-white/95 font-light text-sm tracking-wide transition-all duration-200 hover:bg-[#3d7dd4]/15 hover:border-[#3d7dd4]/70 active:scale-[0.99] text-left"
                    aria-expanded={trustedPartnerExpanded}
                    aria-label={
                      trustedPartnerExpanded
                        ? "Collapse (tap again)"
                        : "Expand to view details"
                    }
                  >
                    <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 500 }}>
                      {t("logisticsPage.trustedPartnerTitle")}
                    </span>
                    {trustedPartnerExpanded ? (
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
                    className={trustedPartnerExpanded ? "block mt-3" : "hidden"}
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: "1rem",
                      lineHeight: "1.7",
                      fontWeight: 300,
                    }}
                  >
                    {t("logisticsPage.trustedPartnerDesc")}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center pt-0 pb-16 space-y-8 -mt-8"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
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
                {t("logisticsPage.inquireCta")}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
              <button
                type="button"
                onClick={() => router.push("/contact")}
                className="group relative inline-flex items-center gap-3 px-12 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ pointerEvents: "auto" }}
              >
                <span className="relative z-10">{t("common.contactLogisticsStorage")}</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">
                  →
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
              </motion.div>
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
