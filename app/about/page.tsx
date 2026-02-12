"use client"

import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/src/contexts/language-context"
import { motion } from "framer-motion"
import { useRef, useEffect } from "react"

const ABOUT_VIDEO_DURATION = 7

export default function AboutPage() {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTimeUpdate = () => {
      if (video.currentTime >= ABOUT_VIDEO_DURATION) video.currentTime = 0
    }
    video.addEventListener("timeupdate", onTimeUpdate)
    return () => video.removeEventListener("timeupdate", onTimeUpdate)
  }, [])

  useEffect(() => {
    document.body.classList.add("page-about-body")
    const html = document.documentElement
    const body = document.body
    const prevHtmlBg = html.style.backgroundColor
    const prevBodyBg = body.style.backgroundColor
    html.style.backgroundColor = "#000"
    body.style.backgroundColor = "#000"
    return () => {
      document.body.classList.remove("page-about-body")
      html.style.backgroundColor = prevHtmlBg
      body.style.backgroundColor = prevBodyBg
    }
  }, [])

  return (
    <>
      {/* Full-page black backdrop so no white ever shows below content */}
      <div
        aria-hidden
        className="fixed inset-0 bg-black -z-10"
        style={{ minHeight: "100vh" }}
      />
      <SiteHeader />

      <main 
        className="page-about flex flex-col min-h-screen pb-8 md:pb-0"
        style={{
          backgroundColor: '#000000',
          paddingTop: '6rem',
        }}
      >
        <div className="mx-auto max-w-3xl px-8 md:px-12 flex-1">
          {/* Quote - centered but closer to top */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center pt-8 pb-8"
          >
            <blockquote className="text-center about-quote">
              <p 
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                  fontWeight: 300,
                  lineHeight: '1.4',
                  marginBottom: '0.75rem',
                }}
              >
                {t("aboutPage.quote")}
              </p>
              <cite 
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem',
                  fontStyle: 'normal',
                }}
              >
                {t("aboutPage.quoteAuthor")}
              </cite>
            </blockquote>
          </motion.div>

          {/* Main content - mobile: two paragraphs in flow; desktop: two text containers with space */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="pb-0 about-main"
          >
            {/* Mobile: two paragraphs, no extra gap */}
            <div className="text-center md:hidden space-y-4">
              <p 
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  maxWidth: '42rem',
                  margin: '0 auto',
                }}
              >
                {t("aboutPage.mainText1")}
              </p>
              <p 
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  maxWidth: '42rem',
                  margin: '0 auto',
                }}
              >
                {t("aboutPage.mainText2")}
              </p>
            </div>

            {/* Desktop: two separate text containers with space between */}
            <div className="hidden md:block text-center space-y-10">
              <div 
                className="max-w-[42rem] mx-auto"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                }}
              >
                {t("aboutPage.mainText1")}
              </div>
              <div 
                className="max-w-[42rem] mx-auto"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                }}
              >
                {t("aboutPage.mainText2")}
              </div>
            </div>
          </motion.div>

          {/* About video - container, top and bottom cropped */}
          <div className="w-full mt-2 md:mt-16 md:mb-12">
            <div
              className="mx-auto max-w-md aspect-square overflow-hidden rounded-lg bg-black -mt-[25%] -mb-[25%]"
              style={{ clipPath: "inset(25% 0 25% 0)" }}
            >
              <video
                ref={videoRef}
                src="/about_render_final.mp4"
                className="w-full h-full object-cover object-center"
                playsInline
                autoPlay
                loop
                muted
              />
            </div>
          </div>
        </div>

        {/* Footnote - Full Width; desktop: same as trading page */}
        <div className="w-full pb-0 mt-auto pt-8 md:mt-8 md:pt-0 md:pb-6">
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
      </main>
    </>
  )
}
