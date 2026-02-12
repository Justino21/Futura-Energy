'use client';

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import Lenis from 'lenis';
import Link from 'next/link';

// ============================================
// CONFIGURATION - Optimized for smoothness
// ============================================
const TOTAL_FRAMES = 480;
const VIDEO_DURATION = 40;
const LERP_FACTOR = 0.08; // Slightly faster for responsiveness
const INITIAL_FRAMES = 30;

// Section timing - User specified
const SECTIONS = {
  hero: { start: 0, end: 0.145 },
  overview: { start: 0.40, end: 0.48 },
  trading: { start: 0.15, end: 0.34 },
  logistics: { start: 0.52, end: 0.64 },
  risk: { start: 0.72, end: 0.83 },
  global: { start: 0.86, end: 1.0, noFadeOut: true },
};

// Ultra-smooth spring config
const SMOOTH_SPRING = { stiffness: 40, damping: 20, mass: 1.2 };

// ============================================
// SIMPLE FADE COMPONENT - No lag, pure smoothness
// ============================================
const FadeIn = memo(function FadeIn({
  children,
  delay = 0,
  show = true,
  className = '',
  direction = 'up'
}: {
  children: React.ReactNode;
  delay?: number;
  show?: boolean;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}) {
  const directionMap = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none: { x: 0, y: 0 }
  };

  const { x, y } = directionMap[direction];

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: show ? 1 : 0,
        y: show ? 0 : y,
        x: show ? 0 : x,
      }}
      transition={{
        duration: 0.7,
        delay: show ? delay : 0,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

// ============================================
// COUNTER - Scroll-based animated numbers
// ============================================
function Counter({ value, suffix = '', progress = 0 }: { value: number; suffix?: string; progress?: number }) {
  const eased = 1 - Math.pow(1 - Math.min(Math.max(progress, 0), 1), 3);
  const count = Math.round(eased * value);
  return <span className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
}

// ============================================
// SECTION COMPONENT - Handles scroll-based visibility
// ============================================
interface SectionProps {
  children: (visible: boolean, sectionProgress: number) => React.ReactNode;
  scrollProgress: MotionValue<number>;
  start: number;
  end: number;
  align?: 'center' | 'left' | 'right' | 'top-left' | 'top-left-high' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom';
  noFadeOut?: boolean;
}

const Section = memo(function Section({ children, scrollProgress, start, end, align = 'center', noFadeOut = false }: SectionProps) {
  const [visible, setVisible] = useState(false);
  const [sectionProgress, setSectionProgress] = useState(0);
  
  // Calculate animation points
  const fadeIn = start + (end - start) * 0.15;
  const fadeOut = end - (end - start) * 0.15;
  
  // If noFadeOut, stay at full opacity until end
  const opacity = noFadeOut
    ? useTransform(scrollProgress, [start, fadeIn, end], [0, 1, 1])
    : useTransform(scrollProgress, [start, fadeIn, fadeOut, end], [0, 1, 1, 0]);
  const y = noFadeOut
    ? useTransform(scrollProgress, [start, fadeIn, end], [30, 0, 0])
    : useTransform(scrollProgress, [start, fadeIn, fadeOut, end], [30, 0, 0, -20]);
  
  const smoothOpacity = useSpring(opacity, SMOOTH_SPRING);
  const smoothY = useSpring(y, SMOOTH_SPRING);
  
  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (v: number) => {
      setVisible(v >= start && v <= end);
      // Calculate progress within section (0 to 1)
      const progress = Math.max(0, Math.min(1, (v - start) / (end - start)));
      setSectionProgress(progress);
    });
    return () => unsubscribe();
  }, [scrollProgress, start, end]);
  
  // Position classes based on alignment
  const alignClasses: Record<string, string> = {
    'center': 'items-center justify-center',
    'left': 'items-center justify-start pl-[8vw]',
    'right': 'items-center justify-end pr-[8vw]',
    'top-left': 'items-start justify-start pl-[8vw] pt-[15vh]',
    'top-left-high': 'items-start justify-start pl-[8vw] pt-[8vh]',
    'top-right': 'items-start justify-end pr-[8vw] pt-[15vh]',
    'bottom-left': 'items-end justify-start pl-[8vw] pb-[15vh]',
    'bottom-right': 'items-end justify-end pr-[8vw] pb-[15vh]',
    'top': 'items-start justify-center pt-[15vh]',
    'bottom': 'items-end justify-center pb-[15vh]',
  };
  
  const textAlign: Record<string, string> = {
    'center': 'text-center',
    'left': 'text-left',
    'right': 'text-right',
    'top-left': 'text-left',
    'top-left-high': 'text-left',
    'top-right': 'text-right',
    'bottom-left': 'text-left',
    'bottom-right': 'text-right',
    'top': 'text-center',
    'bottom': 'text-center',
  };

  return (
    <motion.div
      className={`fixed inset-0 flex pointer-events-none z-20 ${alignClasses[align]}`}
      style={{ opacity: smoothOpacity, y: smoothY }}
    >
      <div className={`pointer-events-auto max-w-[600px] px-6 ${textAlign[align]}`}>
        {children(visible, sectionProgress)}
      </div>
    </motion.div>
  );
});

// ============================================
// MAIN SCROLL VIDEO COMPONENT
// ============================================
export default function ScrollVideoExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<(ImageBitmap | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const lenisRef = useRef<Lenis | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number>();
  const lastDrawnFrameRef = useRef(-1);
  const isExtractingRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Track scroll progress for percentage display
  const [displayProgress, setDisplayProgress] = useState(0);
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => setDisplayProgress(v));
    return () => unsubscribe();
  }, [scrollYProgress]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Frame extraction
  const extractFrame = useCallback(async (index: number): Promise<ImageBitmap | null> => {
    const video = videoRef.current;
    const ctx = offscreenCtxRef.current;
    const offscreen = offscreenRef.current;
    if (!video || !ctx || !offscreen) return null;

    video.currentTime = (index / TOTAL_FRAMES) * VIDEO_DURATION;
    await new Promise<void>(resolve => { video.onseeked = () => resolve(); });
    ctx.drawImage(video, 0, 0);
    return createImageBitmap(offscreen);
  }, []);

  // Initialize video
  useEffect(() => {
    const init = async () => {
      const video = document.createElement('video');
      video.src = '/video.mp4';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject();
      });

      videoRef.current = video;

      const offscreen = document.createElement('canvas');
      offscreen.width = video.videoWidth;
      offscreen.height = video.videoHeight;
      offscreenRef.current = offscreen;
      offscreenCtxRef.current = offscreen.getContext('2d', { willReadFrequently: true, alpha: false });

      // Extract initial frames
      for (let i = 0; i < INITIAL_FRAMES; i++) {
        framesRef.current[i] = await extractFrame(i);
        setLoadedCount(i + 1);
      }

      // Setup canvas
      const canvas = canvasRef.current;
      if (canvas) {
        setupCanvas(canvas);
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx && framesRef.current[0]) {
          drawFrame(ctx, framesRef.current[0], canvas.width, canvas.height);
        }
      }

      setIsReady(true);
      extractRemaining();
    };

    init();
  }, [extractFrame]);

  // Extract remaining frames in background
  const extractRemaining = useCallback(async () => {
    if (isExtractingRef.current) return;
    isExtractingRef.current = true;

    // Keyframes first
    for (let i = 0; i < TOTAL_FRAMES; i += 8) {
      if (!framesRef.current[i]) {
        framesRef.current[i] = await extractFrame(i);
        setLoadedCount(p => p + 1);
      }
    }

    // Fill in the rest
    for (let i = INITIAL_FRAMES; i < TOTAL_FRAMES; i++) {
      if (!framesRef.current[i]) {
        framesRef.current[i] = await extractFrame(i);
        setLoadedCount(p => p + 1);
      }
      if (i % 20 === 0) await new Promise(r => setTimeout(r, 0));
    }

    isExtractingRef.current = false;
  }, [extractFrame]);

  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }, []);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, frame: ImageBitmap, w: number, h: number) => {
    const scale = Math.max(w / frame.width, h / frame.height);
    const x = (w - frame.width * scale) / 2;
    const y = (h - frame.height * scale) / 2;
    ctx.drawImage(frame, x, y, frame.width * scale, frame.height * scale);
  }, []);

  const findFrame = useCallback((target: number): ImageBitmap | null => {
    const frames = framesRef.current;
    if (frames[target]) return frames[target];
    for (let off = 1; off < TOTAL_FRAMES; off++) {
      if (target - off >= 0 && frames[target - off]) return frames[target - off];
      if (target + off < TOTAL_FRAMES && frames[target + off]) return frames[target + off];
    }
    return frames[0];
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    if (!isReady) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    });

    return () => lenis.destroy();
  }, [isReady]);

  // Render loop
  useEffect(() => {
    if (!isReady) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false, desynchronized: true });
    if (!canvas || !ctx) return;

    const animate = (time: number) => {
      lenisRef.current?.raf(time);
      currentFrameRef.current = lerp(currentFrameRef.current, targetFrameRef.current, LERP_FACTOR);
      
      const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrameRef.current)));
      if (frameIdx !== lastDrawnFrameRef.current) {
        const frame = findFrame(frameIdx);
        if (frame) {
          drawFrame(ctx, frame, canvas.width, canvas.height);
          lastDrawnFrameRef.current = frameIdx;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isReady, drawFrame, findFrame]);

  // Resize handler
  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        setupCanvas(canvasRef.current);
        lastDrawnFrameRef.current = -1;
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setupCanvas]);

  const scrollHeight = `${(TOTAL_FRAMES / 60) * 100}vh`;
  const loadPct = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div ref={containerRef} className="relative" style={{ height: scrollHeight }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 bg-black"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      />

      {/* Subtle vignette for depth - very subtle */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* PERCENTAGE MARKER - Scroll to see where each section should go */}
      <div className="fixed top-4 right-4 z-50 bg-black/80 px-4 py-2 rounded-lg border border-white/20">
        <span className="text-white font-mono text-3xl font-bold">
          {Math.round(displayProgress * 100)}%
        </span>
      </div>

      {/* ========== HERO ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.hero.start} end={SECTIONS.hero.end} align="top-left">
        {(visible) => (
          <div className="relative">
            {/* Subtle glass background */}
            <div className="absolute -inset-6 -z-10 bg-black/20 backdrop-blur-[2px] rounded-2xl" />
            
            <FadeIn show={visible} delay={0}>
              <p className="text-[#7cb3ff] text-[13px] tracking-[0.25em] uppercase mb-4 font-medium">Futura</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h1 className="text-[clamp(2.8rem,7vw,5rem)] font-serif tracking-[-0.02em] text-white leading-[1.05] mb-6">
                Energy Trading<br />& Logistics
              </h1>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p className="text-white/90 text-[17px] leading-[1.7] font-light max-w-[360px]">
                Connecting global energy markets through strategic trading of crude oil and refined products across Europe, Africa, Middle East and Latin America.
              </p>
            </FadeIn>
          </div>
        )}
      </Section>

      {/* ========== OVERVIEW ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.overview.start} end={SECTIONS.overview.end} align="top-left-high">
        {(visible, sectionProgress) => {
          // Counter finishes at 43% (0.375 into section), then stays static
          const counterProgress = Math.min(1, sectionProgress / 0.375);
          return (
            <>
              <FadeIn show={visible} delay={0}>
                <p className="text-[#7cb3ff] text-[13px] tracking-[0.25em] uppercase mb-5 font-medium">At a Glance</p>
              </FadeIn>
              
              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                {[
                  { val: 1, suf: ' MT', label: 'Monthly Volume' },
                  { val: 300, suf: 'K+', label: 'MTS Storage Capacity' },
                  { val: 110, suf: '+', label: 'Global Partners' },
                  { val: 20, suf: '+', label: 'Team Members' },
                ].map((s, i) => (
                  <FadeIn key={s.label} show={visible} delay={0.05 + i * 0.05} direction="left">
                    <div>
                      <p className="text-[36px] font-[300] text-white tracking-tight leading-none mb-1">
                        <Counter value={s.val} suffix={s.suf} progress={counterProgress} />
                      </p>
                      <p className="text-white/80 text-[13px] font-light">{s.label}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </>
          );
        }}
      </Section>

      {/* ========== TRADING ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.trading.start} end={SECTIONS.trading.end} align="left">
        {(visible) => (
          <div className="max-w-[300px]">
            <FadeIn show={visible} delay={0}>
              <p className="text-[#5a9cff] text-[13px] tracking-[0.25em] uppercase mb-3 font-medium">Core Business</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-serif text-white tracking-tight leading-[1.1] mb-5">
                Trading
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p className="text-white/90 text-[16px] leading-[1.7] font-light mb-6">
                Maximizing value across the entire energy supply chain through strategic crude oil and refined product trading operations.
              </p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.3}>
              <div className="space-y-2.5 text-white/80 text-[14px] font-light">
                <p>→ Shipping & freight optimization</p>
                <p>→ Strategic storage management</p>
                <p>→ Comprehensive risk hedging</p>
              </div>
            </FadeIn>
          </div>
        )}
      </Section>

      {/* ========== LOGISTICS ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.logistics.start} end={SECTIONS.logistics.end} align="top-left">
        {(visible) => (
          <>
            <FadeIn show={visible} delay={0}>
              <p className="text-[#4a8fe8] text-[13px] tracking-[0.25em] uppercase mb-3 font-medium">Infrastructure</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[clamp(2.2rem,6vw,3.8rem)] font-serif text-white tracking-tight leading-[1.1] mb-5">
                Logistics &<br />Storage
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p className="text-white/90 text-[16px] leading-[1.75] font-light mb-6 max-w-[340px]">
                Strategic storage facilities positioned across the Mediterranean and Black Sea regions. Expert Danube river barge operations and professional chartering services.
              </p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.3}>
              <p className="text-white/80 text-[14px] font-light border-l-2 border-[#4a8fe8]/60 pl-4">
                Managing strategic petroleum reserves for the Republic of Serbia since 2014.
              </p>
            </FadeIn>
          </>
        )}
      </Section>

      {/* ========== RISK & COMPLIANCE ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.risk.start} end={SECTIONS.risk.end} align="right">
        {(visible) => (
          <div className="max-w-[280px] text-right">
            <FadeIn show={visible} delay={0}>
              <p className="text-[#3d7dd4] text-[13px] tracking-[0.25em] uppercase mb-3 font-medium">Governance</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-serif text-white tracking-tight leading-[1.1] mb-5">
                Risk &<br />Compliance
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p className="text-white/90 text-[15px] leading-[1.7] font-light mb-5">
                Comprehensive risk management framework ensuring robust trade control and full compliance with international export regulations.
              </p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.3}>
              <div className="flex flex-wrap justify-end gap-2">
                {['KYC', 'Sanctions', 'Anti-Bribery', 'AML'].map((item) => (
                  <span key={item} className="px-4 py-1.5 text-[12px] text-white/90 font-light border border-[#3d7dd4]/50 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        )}
      </Section>

      {/* ========== GLOBAL PRESENCE ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.global.start} end={SECTIONS.global.end} align="left" noFadeOut>
        {(visible) => (
          <>
            <FadeIn show={visible} delay={0}>
              <p className="text-[#6aa8f0] text-[13px] tracking-[0.25em] uppercase mb-3 font-medium">Worldwide</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[clamp(2.2rem,6vw,3.8rem)] font-serif text-white tracking-tight leading-[1.1] mb-6">
                Global<br />Presence
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.15}>
              <p className="text-white/90 text-[15px] leading-[1.6] font-light mb-6 max-w-[300px]">
                Strategic offices positioned across key energy trading hubs worldwide.
              </p>
            </FadeIn>
            
            <div className="space-y-3.5">
              {[
                { city: 'Dubai, UAE', role: 'Global Headquarters', primary: true },
                { city: 'Geneva, Switzerland', role: 'Trading Operations' },
                { city: 'Belgrade, Serbia', role: 'Regional Operations' },
                { city: 'Istanbul, Turkey', role: 'Regional Operations' },
              ].map((loc, i) => (
                <FadeIn key={loc.city} show={visible} delay={0.2 + i * 0.06} direction="left">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${loc.primary ? 'bg-[#6aa8f0]' : 'bg-white/50'}`} />
                    <div>
                      <p className={`text-[15px] font-light ${loc.primary ? 'text-white' : 'text-white/90'}`}>{loc.city}</p>
                      <p className="text-white/70 text-[12px]">{loc.role}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </>
        )}
      </Section>



      {/* Loading State */}
      {!isReady && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
          <p className="text-[11px] text-white/30 tracking-[0.3em] uppercase mb-6">Loading</p>
          <div className="w-24 h-[1px] bg-white/10 overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-white/40"
              initial={{ width: '0%' }}
              animate={{ width: `${(loadedCount / INITIAL_FRAMES) * 100}%` }}
              transition={{ duration: 0.15, ease: 'linear' }}
            />
          </div>
        </div>
      )}

      {/* Background progress */}
      {isReady && loadPct < 100 && (
        <p className="fixed top-6 right-6 z-30 text-[10px] text-white/15 tabular-nums">
          {loadPct}%
        </p>
      )}
    </div>
  );
}
