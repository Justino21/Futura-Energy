"use client"

import { SiteHeader } from "@/components/site-header"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useRef } from "react"

export default function StoragePage() {
  const heroRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
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
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/Futura_Trade_Hero2.0.mp4" type="video/mp4" />
          </video>
          
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
            <span className="text-white/80 text-xs tracking-wider uppercase font-light">Scroll</span>
            <ChevronDown 
              className="w-8 h-8 text-white/80" 
              strokeWidth={1.5}
            />
          </motion.div>
        </section>

        {/* Normal Page Content */}
        <section 
          style={{
            position: 'relative',
            backgroundColor: '#000000',
            width: '100%',
            minHeight: '100vh',
            paddingTop: '6rem',
            paddingBottom: '6rem',
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-8 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  color: "#ffffff",
                  fontWeight: 400,
                  fontSize: '2.5rem',
                  lineHeight: '1.2',
                  marginBottom: '2rem',
                }}
              >
                Storage
              </h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                style={{ 
                  color: '#ffffff', 
                  fontSize: '1.25rem', 
                  lineHeight: '1.7',
                  marginBottom: '1.5rem'
                }}
              >
                Strategic storage facilities positioned across the Mediterranean and Black Sea regions. Expert Danube river barge operations and professional chartering services.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ 
                  color: '#ffffff', 
                  fontSize: '1.25rem', 
                  lineHeight: '1.7',
                }}
              >
                Managing strategic petroleum reserves for the Republic of Serbia since 2014, ensuring reliable supply chain operations and optimal storage solutions.
              </motion.p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}


