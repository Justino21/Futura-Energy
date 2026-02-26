'use client';

import { useRef, useEffect, useLayoutEffect, useState, useCallback, memo } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import Lenis from 'lenis';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/src/contexts/language-context';

// ============================================
// CONFIGURATION - Optimized for smoothness
// ============================================
const TOTAL_FRAMES = 480;
const VIDEO_DURATION = 40;

// Pre-exported frames = instant load (no video decode). Run: ./scripts/export-home-frames.sh
const USE_PREEXPORTED_FRAMES = true;
const FRAMES_BASE = '/frames';
const FRAME_EXT = 'jpg';
// ffmpeg exports as frame_001..frame_480 (1-based); we use indices 0..479 so add 1 for filename
const getFrameSrc = (i: number) => `${FRAMES_BASE}/frame_${String(i + 1).padStart(3, '0')}.${FRAME_EXT}`;
const LERP_FACTOR = 0.08; // For sparse frames (later in scroll)
const LERP_INSTANT_RANGE = 150; // First 150 frames: no lerp = 1:1 scroll (perfect smooth at start)
const MOBILE_BG_LERP = 0.1; // Mobile: always smooth background (no instant snap)
const KEYFRAME_INTERVAL = 4; // Every 4th frame is a keyframe

// APPLE-STYLE LOADING: Load keyframes strategically for fast load + smoothness
// Smaller priority range (0-150) = fewer frames in 5s = faster show or more headroom
const TOTAL_KEYFRAMES = Math.ceil(TOTAL_FRAMES / KEYFRAME_INTERVAL); // 120 keyframes
const KEYFRAMES_TO_SHOW = 40; // Show page after 40 keyframes (covers 0-160) for faster load
const KEYFRAMES_COVERAGE = KEYFRAMES_TO_SHOW * KEYFRAME_INTERVAL; // 160 frames

const INITIAL_FRAMES = 150; // Target: 150 frames for "smooth from start" (filled in 5s)
const MIN_FRAMES_FOR_SMOOTH = 40; // Smooth from first frame we show
const PRIORITY_FILL_END = 150; // Fill 0-150 in 5s = one frame per position for first ~31% (achievable in 5s)

// Section timing - User specified
const SECTIONS = {
  hero: { start: 0, end: 0.145 },
  overview: { start: 0.40, end: 0.48 },
  trading: { start: 0.15, end: 0.34 },
  logistics: { start: 0.52, end: 0.64 },
  risk: { start: 0.72, end: 0.83 },
  global: { start: 0.86, end: 1.0, noFadeOut: true },
  footnote: { start: 0.90, end: 1.0, noFadeOut: true },
};

// Mobile scroll-snap section heights (vh) – one per “magnet” so users don’t skip (sum = 800)
const NUM_SECTIONS = 8;
const SECTION_HEIGHT_VH = 100;
const SNAP_DURATION = 0.8;
const SNAP_EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);
const WHEEL_THRESHOLD = 25;
// Mobile: slower scroll (taller sections) + one JS-controlled smooth snap (no CSS snap)
const MOBILE_SECTION_HEIGHT_VH = 100;
const MOBILE_SNAP_DURATION_MS = 450;
const MOBILE_SNAP_DELAY_MS = 120;
const MOBILE_SNAP_THRESHOLD_PX = 12;

// Ultra-smooth spring config
const SMOOTH_SPRING = { stiffness: 40, damping: 20, mass: 1.2 };

// Frame type: ImageBitmap (video path) or HTMLImageElement (pre-exported images)
type FrameSource = ImageBitmap | HTMLImageElement;

// ============================================
// PERSISTENT FRAME CACHE - Survives navigation
// ============================================
const frameCache = {
  frames: null as (FrameSource | null)[] | null,
  videoRef: null as HTMLVideoElement | null,
  offscreenRef: null as HTMLCanvasElement | null,
  offscreenCtxRef: null as CanvasRenderingContext2D | null,
  isLoaded: false,
  loadedCount: 0,
};

// Helper to check if cache is valid and has enough frames
const isCacheValid = (): boolean => {
  if (!frameCache.frames || !frameCache.isLoaded) return false;
  const loadedFrames = frameCache.frames.filter(f => f !== null).length;
  return loadedFrames >= KEYFRAMES_TO_SHOW; // At least have keyframes loaded
};

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
      style={{ pointerEvents: 'auto' }}
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
  align?: 'center' | 'left' | 'right' | 'top-left' | 'top-left-high' | 'top-right' | 'bottom-left' | 'bottom-left-footer' | 'bottom-right' | 'top' | 'bottom';
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
  
  // Mobile: center + padding. Desktop: original alignment (no extra padding).
  const alignClasses: Record<string, string> = {
    'center': 'items-center justify-center px-4 pt-[12vh] pb-32 md:px-0 md:pt-0 md:pb-0',
    'left': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-center md:justify-start md:pl-[8vw] md:pt-0 md:pb-0 md:px-0',
    'right': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-center md:justify-end md:pr-[8vw] md:pt-0 md:pb-0 md:px-0',
    'top-left': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-start md:justify-start md:pl-[8vw] md:pt-[15vh] md:pb-0 md:px-0',
    'top-left-high': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-start md:justify-start md:pl-[8vw] md:pt-[8vh] md:pb-0 md:px-0',
    'top-right': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-start md:justify-end md:pr-[8vw] md:pt-[15vh] md:pb-0 md:px-0',
    'bottom-left': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-end md:justify-start md:pl-[8vw] md:pb-[15vh] md:pt-0 md:px-0',
    'bottom-left-footer': 'items-end justify-center px-4 pt-0 pb-4 md:items-end md:justify-start md:pl-[8vw] md:pb-4 md:pt-0 md:px-0',
    'bottom-right': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-end md:justify-end md:pr-[8vw] md:pb-[15vh] md:pt-0 md:px-0',
    'top': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-start md:justify-center md:pt-[15vh] md:px-0 md:pb-0',
    'bottom': 'items-center justify-center px-4 pt-[12vh] pb-32 md:items-end md:justify-center md:pb-[15vh] md:px-0 md:pt-0',
  };

  const textAlign: Record<string, string> = {
    'center': 'text-center',
    'left': 'text-center md:text-left',
    'right': 'text-center md:text-right',
    'top-left': 'text-center md:text-left',
    'top-left-high': 'text-center md:text-left',
    'top-right': 'text-center md:text-right',
    'bottom-left': 'text-center md:text-left',
    'bottom-left-footer': 'text-center md:text-left',
    'bottom-right': 'text-center md:text-right',
    'top': 'text-center',
    'bottom': 'text-center',
  };

  return (
    <motion.div
      className={`fixed inset-0 flex pointer-events-none z-20 ${alignClasses[align]}`}
      style={{ opacity: smoothOpacity, y: smoothY, zIndex: 100 }}
    >
      <div className={`pointer-events-auto w-full max-w-[600px] px-6 max-md:max-w-[24rem] max-md:px-6 max-md:mx-auto ${textAlign[align]} relative`} style={{ zIndex: 101 }}>
        {children(visible, sectionProgress)}
      </div>
    </motion.div>
  );
});

// ============================================
// MAIN SCROLL VIDEO COMPONENT
// ============================================
export default function ScrollVideoExperience() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isLongCtaLanguage = language === 'es' || language === 'fr';
  const heroCtaBottom = isLongCtaLanguage ? '10vh' : language === 'de' ? '18vh' : '22vh';
  const tradingCtaBottom = isLongCtaLanguage ? '10vh' : language === 'de' ? '16vh' : '18vh';
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<(FrameSource | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const lenisRef = useRef<Lenis | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isSmoothReady, setIsSmoothReady] = useState(false); // True when enough frames for smooth scrolling
  const [showQualityIndicator, setShowQualityIndicator] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // null = not yet measured (don't init Lenis)

  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number>();
  const lastDrawnFrameRef = useRef(-1);
  const isExtractingRef = useRef(false);
  const pageShownRef = useRef(false);
  const smoothRangeEndRef = useRef(LERP_INSTANT_RANGE); // instant lerp up to this frame (set when we show)
  const isSnappingRef = useRef(false);

  // Pre-exported: frame 0 is preloaded in layout. Video path: video preloaded in layout.
  const loadSingleFrameImage = useCallback((index: number): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = getFrameSrc(index);
    });
  }, []);

  // Mobile: start requesting first frame immediately on mount (hits preload cache for instant show)
  useLayoutEffect(() => {
    if (!USE_PREEXPORTED_FRAMES) return;
    const img = new Image();
    img.fetchPriority = 'high';
    img.src = getFrameSrc(0);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Hero CTA opacity - fades in starting at 2% scroll progress
  const heroCTAOpa = useTransform(scrollYProgress, [0, 0.02, 1], [0, 1, 1]);
  const heroCTAY = useTransform(scrollYProgress, [0, 0.02], [20, 0]);

  // Track scroll progress for percentage display
  const [displayProgress, setDisplayProgress] = useState(0);
  const [showHeroCTA, setShowHeroCTA] = useState(false);
  const [showTradingCTA, setShowTradingCTA] = useState(false);
  const [showLogisticsCTA, setShowLogisticsCTA] = useState(false);
  const [showRiskCTA, setShowRiskCTA] = useState(false);
  const [showGlobalCTA, setShowGlobalCTA] = useState(false);
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setDisplayProgress(v);
      // Show CTAs when their sections are visible
      setShowHeroCTA(v >= SECTIONS.hero.start && v <= SECTIONS.hero.end);
      setShowTradingCTA(v >= SECTIONS.trading.start && v <= SECTIONS.trading.end);
      setShowLogisticsCTA(v >= SECTIONS.logistics.start && v <= SECTIONS.logistics.end);
      setShowRiskCTA(v >= SECTIONS.risk.start && v <= SECTIONS.risk.end);
      setShowGlobalCTA(v >= SECTIONS.global.start && v <= SECTIONS.global.end);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Frame extraction - at display size for faster decode and less memory (createImageBitmap resize)
  const extractFrame = useCallback(async (index: number): Promise<ImageBitmap | null> => {
    const video = videoRef.current;
    const ctx = offscreenCtxRef.current;
    const offscreen = offscreenRef.current;
    if (!video || !ctx || !offscreen) return null;

    video.currentTime = (index / TOTAL_FRAMES) * VIDEO_DURATION;
    await new Promise<void>(resolve => { video.onseeked = () => resolve(); });
    ctx.drawImage(video, 0, 0);

    const vw = offscreen.width;
    const vh = offscreen.height;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2);
    const dw = (typeof window !== 'undefined' ? window.innerWidth : 1920) * dpr;
    const dh = (typeof window !== 'undefined' ? window.innerHeight : 1080) * dpr;
    const scale = Math.max(dw / vw, dh / vh);
    const outW = Math.round(vw * scale);
    const outH = Math.round(vh * scale);

    try {
      return await createImageBitmap(offscreen, {
        resizeWidth: outW,
        resizeHeight: outH,
        resizeQuality: 'medium',
      });
    } catch {
      return await createImageBitmap(offscreen);
    }
  }, []);

  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Set actual canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Set display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Enable hardware acceleration
    canvas.style.willChange = 'transform';
    canvas.style.transform = 'translateZ(0)';
    
    // Optimize context settings
    const ctx = canvas.getContext('2d', { 
      alpha: false, 
      desynchronized: true,
      willReadFrequently: false 
    });
    if (ctx) {
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  }, []);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, frame: FrameSource, w: number, h: number) => {
    const fw = frame.width;
    const fh = frame.height;
    const scale = Math.max(w / fw, h / fh);
    const x = (w - fw * scale) / 2;
    const y = (h - fh * scale) / 2;
    ctx.drawImage(frame, x, y, fw * scale, fh * scale);
  }, []);

  // Extract remaining frames in background - optimized for smoothness
  const extractRemaining = useCallback(async () => {
    if (isExtractingRef.current) return;
    isExtractingRef.current = true;

    // Strategy: Load keyframes first (every 4th frame) for smooth scrolling
    // Then fill in gaps progressively
    const keyframeInterval = 4;
    
    // Phase 1: Load all keyframes (every 4th frame) - critical for smoothness
    for (let i = 0; i < TOTAL_FRAMES; i += keyframeInterval) {
      if (!framesRef.current[i]) {
        framesRef.current[i] = await extractFrame(i);
        const newCount = framesRef.current.filter(f => f !== null).length;
        setLoadedCount(newCount);
        
        // Update cache
        frameCache.frames = [...framesRef.current];
        frameCache.loadedCount = newCount;
        
        // Update smooth-ready when we reach minimum
        if (newCount >= MIN_FRAMES_FOR_SMOOTH) {
          setIsSmoothReady(true);
        }
      }
      // Yield every 40 frames to prevent blocking
      if (i % 40 === 0 && i > 0) await new Promise(r => setTimeout(r, 0));
    }

    // Phase 2: Fill in gaps between keyframes in small batches
    const processBatch = async (startIdx: number, endIdx: number) => {
      for (let i = startIdx; i < endIdx; i++) {
        if (!framesRef.current[i]) {
          framesRef.current[i] = await extractFrame(i);
          const newCount = framesRef.current.filter(f => f !== null).length;
          setLoadedCount(newCount);
          
          // Update cache periodically
          if (i % 10 === 0) {
            frameCache.frames = [...framesRef.current];
            frameCache.loadedCount = newCount;
          }
          
          // Update smooth-ready when we reach minimum
          if (newCount >= MIN_FRAMES_FOR_SMOOTH) {
            setIsSmoothReady(true);
          }
        }
        // Yield every 5 frames to keep UI responsive
        if (i % 5 === 0 && i > startIdx) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
    };

    // Fill gaps in small batches to prevent blocking
    for (let batchStart = INITIAL_FRAMES; batchStart < TOTAL_FRAMES; batchStart += 20) {
      const batchEnd = Math.min(batchStart + 20, TOTAL_FRAMES);
      await processBatch(batchStart, batchEnd);
      // Small delay between batches
      await new Promise(r => setTimeout(r, 1));
    }
    
    // Final cache update
    frameCache.frames = [...framesRef.current];
    frameCache.loadedCount = framesRef.current.filter(f => f !== null).length;

    isExtractingRef.current = false;
  }, [extractFrame]);

  // Check cache on mount - if frames are cached, use them immediately
  useEffect(() => {
    if (isCacheValid() && frameCache.frames) {
      console.log('✅ Using cached frames - instant smooth loading!');
      framesRef.current = [...frameCache.frames];
      const cachedCount = frameCache.frames.filter(f => f !== null).length;
      setLoadedCount(cachedCount);

      if (!USE_PREEXPORTED_FRAMES) {
        const video = document.createElement('video');
        video.src = '/Futura_Home_Final.mp4';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        videoRef.current = video;
        const firstFrame = framesRef.current.find(f => f !== null);
        if (firstFrame) {
          const offscreen = document.createElement('canvas');
          offscreen.width = firstFrame.width;
          offscreen.height = firstFrame.height;
          offscreenRef.current = offscreen;
          offscreenCtxRef.current = offscreen.getContext('2d', { willReadFrequently: true, alpha: false });
        }
        if (cachedCount < TOTAL_FRAMES) video.onloadeddata = () => extractRemaining();
      }

      const canvas = canvasRef.current;
      if (canvas && framesRef.current[0]) {
        setupCanvas(canvas);
        const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        if (ctx) drawFrame(ctx, framesRef.current[0], canvas.width, canvas.height);
      }
      let rangeEnd = 0;
      for (let i = 0; i <= LERP_INSTANT_RANGE; i++) if (framesRef.current[i]) rangeEnd = i;
      smoothRangeEndRef.current = rangeEnd;
      setIsReady(true);
      if (cachedCount >= MIN_FRAMES_FOR_SMOOTH) setIsSmoothReady(true);
    }
  }, [setupCanvas, drawFrame, extractRemaining]);

  // Initialize: pre-exported frames (instant) or video extraction (fallback)
  useEffect(() => {
    if (isCacheValid() && isReady) return;

    if (USE_PREEXPORTED_FRAMES) {
      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

      const loadFrameImages = async () => {
        const frames = framesRef.current;
        if (!frames) return;

        const showPage = (firstFrame: FrameSource) => {
          if (pageShownRef.current) return;
          pageShownRef.current = true;
          const canvas = canvasRef.current;
          if (canvas) {
            setupCanvas(canvas);
            const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
            if (ctx) drawFrame(ctx, firstFrame, canvas.width, canvas.height);
          }
          let rangeEnd = 0;
          for (let i = 0; i <= LERP_INSTANT_RANGE; i++) if (frames[i]) rangeEnd = i;
          smoothRangeEndRef.current = rangeEnd;
          setIsReady(true);
          setIsSmoothReady(true);
        };

        const first = await loadSingleFrameImage(0);
        if (!first) {
          console.warn('Pre-exported frame 0 not found. Run: ./scripts/export-home-frames.sh — falling back to video.');
          fallbackTimer = setTimeout(() => {
            if (pageShownRef.current) return;
            pageShownRef.current = true;
            const canvas = canvasRef.current;
            const f = framesRef.current;
            if (canvas && f?.[0]) {
              setupCanvas(canvas);
              const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
              if (ctx) drawFrame(ctx, f[0], canvas.width, canvas.height);
            }
            let rangeEnd = 0;
            if (f) for (let i = 0; i <= LERP_INSTANT_RANGE; i++) if (f[i]) rangeEnd = i;
            smoothRangeEndRef.current = rangeEnd;
            setIsReady(true);
            setIsSmoothReady(true);
          }, 5000);
          runVideoInit();
          return;
        }
        frames[0] = first;
        setLoadedCount(1);
        showPage(first);
        frameCache.frames = [...frames];
        frameCache.loadedCount = 1;
        frameCache.isLoaded = true;

        // Load all remaining frames in parallel batches so the whole scroll uses images (no video)
        const BATCH_SIZE = 24; // load 24 frames in parallel per batch
        const loadRange = async (start: number, end: number) => {
          for (let batchStart = start; batchStart < end; batchStart += BATCH_SIZE) {
            const batchEnd = Math.min(batchStart + BATCH_SIZE, end);
            const results = await Promise.all(
              Array.from({ length: batchEnd - batchStart }, (_, j) =>
                loadSingleFrameImage(batchStart + j)
              )
            );
            if (!framesRef.current) return;
            results.forEach((img, j) => {
              const i = batchStart + j;
              if (img) framesRef.current![i] = img;
            });
            const count = framesRef.current.filter(f => f !== null).length;
            setLoadedCount(count);
            const maxLoaded = Math.max(...results.map((_, j) => (results[j] ? batchStart + j : -1)));
            if (maxLoaded >= 0 && maxLoaded <= LERP_INSTANT_RANGE) smoothRangeEndRef.current = maxLoaded;
            frameCache.frames = [...framesRef.current];
            frameCache.loadedCount = count;
          }
        };
        loadRange(1, TOTAL_FRAMES).then(() => {
          if (framesRef.current) {
            frameCache.frames = [...framesRef.current];
            frameCache.loadedCount = framesRef.current.filter(f => f !== null).length;
            smoothRangeEndRef.current = TOTAL_FRAMES - 1; // full range smooth once all loaded
          }
        });
      };

      const runVideoInit = async () => {
        const video = document.createElement('video');
        video.src = '/Futura_Home_Final.mp4';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 3000);
          video.onloadeddata = () => { clearTimeout(timeout); resolve(); };
          video.onerror = () => { clearTimeout(timeout); reject(); };
        });
        videoRef.current = video;
        const offscreen = document.createElement('canvas');
        offscreen.width = video.videoWidth;
        offscreen.height = video.videoHeight;
        offscreenRef.current = offscreen;
        offscreenCtxRef.current = offscreen.getContext('2d', { willReadFrequently: true, alpha: false });
        for (let i = 0; i <= PRIORITY_FILL_END; i += KEYFRAME_INTERVAL) {
          if (!framesRef.current![i]) {
            framesRef.current![i] = await extractFrame(i);
            setLoadedCount(framesRef.current!.filter(f => f !== null).length);
          }
        }
        for (let i = 0; i < PRIORITY_FILL_END; i++) {
          if (!framesRef.current![i]) {
            framesRef.current![i] = await extractFrame(i);
            setLoadedCount(framesRef.current!.filter(f => f !== null).length);
          }
          if (i % 20 === 0 && i > 0) await new Promise(r => setTimeout(r, 0));
        }
        frameCache.frames = [...framesRef.current!];
        frameCache.loadedCount = framesRef.current!.filter(f => f !== null).length;
        frameCache.videoRef = video;
        frameCache.offscreenRef = offscreen;
        frameCache.offscreenCtxRef = offscreenCtxRef.current;
        frameCache.isLoaded = true;
        const visibleRangeEnd = 320;
        const runIdleBatch = async (deadline: IdleDeadline) => {
          const frames = framesRef.current;
          if (!frames) return;
          for (let i = PRIORITY_FILL_END; i < visibleRangeEnd && deadline.timeRemaining() > 2; i++) {
            if (!frames[i]) {
              frames[i] = await extractFrame(i);
              setLoadedCount(framesRef.current!.filter(f => f !== null).length);
            }
          }
          for (let i = PRIORITY_FILL_END + KEYFRAME_INTERVAL; i < TOTAL_FRAMES && deadline.timeRemaining() > 2; i += KEYFRAME_INTERVAL) {
            if (!frames[i]) {
              frames[i] = await extractFrame(i);
              setLoadedCount(framesRef.current!.filter(f => f !== null).length);
            }
          }
          frameCache.frames = [...framesRef.current!];
          frameCache.loadedCount = framesRef.current!.filter(f => f !== null).length;
          if (framesRef.current!.filter(f => f !== null).length < TOTAL_FRAMES) requestIdleCallback?.((d) => runIdleBatch(d), { timeout: 120 });
          else extractRemaining();
        };
        requestIdleCallback?.((deadline) => runIdleBatch(deadline), { timeout: 150 }) ?? extractRemaining();
      };

      loadFrameImages();
      return () => { if (fallbackTimer) clearTimeout(fallbackTimer); };
    }

    const maxWaitMs = (typeof window !== 'undefined' && window.innerWidth < 768) ? 2000 : 5000;
    const maxWaitTimer = setTimeout(() => {
      if (pageShownRef.current) return;
      pageShownRef.current = true;
      const canvas = canvasRef.current;
      const frames = framesRef.current;
      if (canvas) {
        setupCanvas(canvas);
        if (frames && frames[0]) {
          const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
          if (ctx) drawFrame(ctx, frames[0], canvas.width, canvas.height);
        }
      }
      let rangeEnd = 0;
      if (frames) for (let i = 0; i <= LERP_INSTANT_RANGE; i++) if (frames[i]) rangeEnd = i;
      smoothRangeEndRef.current = rangeEnd;
      setIsReady(true);
      setIsSmoothReady(true);
    }, maxWaitMs);

    const init = async () => {
      const video = document.createElement('video');
      video.src = '/Futura_Home_Final.mp4';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => { resolve(); }, 3000);
        video.onloadeddata = () => { clearTimeout(timeout); resolve(); };
        video.onerror = () => { clearTimeout(timeout); reject(); };
      });

      videoRef.current = video;
      const offscreen = document.createElement('canvas');
      offscreen.width = video.videoWidth;
      offscreen.height = video.videoHeight;
      offscreenRef.current = offscreen;
      offscreenCtxRef.current = offscreen.getContext('2d', { willReadFrequently: true, alpha: false });

      for (let i = 0; i <= PRIORITY_FILL_END; i += KEYFRAME_INTERVAL) {
        if (!framesRef.current[i]) {
          framesRef.current[i] = await extractFrame(i);
          setLoadedCount(framesRef.current.filter(f => f !== null).length);
        }
      }
      for (let i = 0; i < PRIORITY_FILL_END; i++) {
        if (!framesRef.current[i]) {
          framesRef.current[i] = await extractFrame(i);
          setLoadedCount(framesRef.current.filter(f => f !== null).length);
        }
        if (i % 20 === 0 && i > 0) await new Promise(r => setTimeout(r, 0));
      }

      frameCache.frames = [...framesRef.current];
      frameCache.loadedCount = framesRef.current.filter(f => f !== null).length;
      frameCache.videoRef = video;
      frameCache.offscreenRef = offscreen;
      frameCache.offscreenCtxRef = offscreenCtxRef.current;
      frameCache.isLoaded = true;

      const visibleRangeEnd = 320;
      const runIdleBatch = async (deadline: IdleDeadline) => {
        const frames = framesRef.current;
        if (!frames) return;
        for (let i = PRIORITY_FILL_END; i < visibleRangeEnd && deadline.timeRemaining() > 2; i++) {
          if (!frames[i]) {
            frames[i] = await extractFrame(i);
            setLoadedCount(framesRef.current!.filter(f => f !== null).length);
          }
        }
        for (let i = PRIORITY_FILL_END + KEYFRAME_INTERVAL; i < TOTAL_FRAMES && deadline.timeRemaining() > 2; i += KEYFRAME_INTERVAL) {
          if (!frames[i]) {
            frames[i] = await extractFrame(i);
            setLoadedCount(framesRef.current!.filter(f => f !== null).length);
          }
        }
        frameCache.frames = [...framesRef.current!];
        frameCache.loadedCount = framesRef.current!.filter(f => f !== null).length;
        const loaded = framesRef.current!.filter(f => f !== null).length;
        if (loaded < TOTAL_FRAMES) requestIdleCallback?.((d) => runIdleBatch(d), { timeout: 120 });
        else extractRemaining();
      };
      requestIdleCallback?.((deadline) => runIdleBatch(deadline), { timeout: 150 }) ?? extractRemaining();
    };

    init().catch(() => {
      if (!pageShownRef.current) { pageShownRef.current = true; setIsReady(true); }
    });
    return () => clearTimeout(maxWaitTimer);
  }, [extractFrame, extractRemaining, setupCanvas, drawFrame, loadSingleFrameImage]);

  const findFrame = useCallback((target: number): FrameSource | null => {
    const frames = framesRef.current;
    const idx = Math.round(Math.max(0, Math.min(TOTAL_FRAMES - 1, target)));
    
    // Exact match - fastest path
    if (frames[idx]) return frames[idx];
    
    // BULLETPROOF: Check nearby frames in expanding radius
    // Prioritize keyframes but accept any frame
    for (let off = 1; off <= 100; off++) {
      // Check before (prefer earlier frames for smoother backward scrolling)
      const beforeIdx = idx - off;
      if (beforeIdx >= 0 && frames[beforeIdx]) {
        return frames[beforeIdx];
      }
      // Check after
      const afterIdx = idx + off;
      if (afterIdx < TOTAL_FRAMES && frames[afterIdx]) {
        return frames[afterIdx];
      }
    }
    
    // Absolute last resort: find ANY loaded frame (should always find one since we load all keyframes)
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (frames[i]) return frames[i];
    }
    
    // This should NEVER happen if loading worked correctly
    // Return first frame as absolute fallback
    return frames[0] || null;
  }, []);

  // Update smooth-ready state when enough frames are loaded
  useEffect(() => {
    if (loadedCount >= MIN_FRAMES_FOR_SMOOTH && !isSmoothReady) {
      setIsSmoothReady(true);
    }
  }, [loadedCount, isSmoothReady]);

  // Show quality indicator for 10 seconds, then fade out (only once per session)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if we've already shown it in this session
    const indicatorShown = sessionStorage.getItem('futura-quality-indicator-shown');
    if (indicatorShown === 'true') {
      return; // Don't show again
    }
    
    if (isReady) {
      setShowQualityIndicator(true);
      
      // Mark as shown immediately
      sessionStorage.setItem('futura-quality-indicator-shown', 'true');
      
      // Fade out after 10 seconds
      const timer = setTimeout(() => {
        setShowQualityIndicator(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // Detect mobile for slower scroll + native scroll (so Safari minimizes browser UI)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lenis only on desktop; never init on mobile so Safari gets native scroll and minimizes UI
  useEffect(() => {
    if (!isReady || isMobile === null) return;
    if (isMobile === true) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      lerp: isSmoothReady ? 0.14 : 0.1,
      smoothWheel: true,
      syncTouch: true,
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothTouch: false,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    });

    return () => lenis.destroy();
  }, [isReady, isSmoothReady, isMobile]);

  // On mobile: drive frame from native scroll (so Safari minimizes UI and scroll feels correct)
  useEffect(() => {
    if (isMobile !== true || !isReady) return;
    const unsub = scrollYProgress.on('change', (v) => {
      targetFrameRef.current = v * (TOTAL_FRAMES - 1);
    });
    return unsub;
  }, [isMobile, isReady, scrollYProgress]);

  // When mobile menu is open: stop Lenis so home page cannot scroll behind the menu
  useEffect(() => {
    if (!isReady) return;
    const body = document.body;
    const check = () => {
      if (body.classList.contains('mobile-menu-open')) {
        lenisRef.current?.stop();
      } else {
        lenisRef.current?.start();
      }
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, [isReady]);

  // Section index from scroll (0..NUM_SECTIONS-1) and scroll to section (shared for snap + wheel)
  const getContainerBounds = useCallback((forMobile?: boolean | null) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = rect.top + window.scrollY;
    const wh = window.innerHeight;
    const sectionHeightPx = wh * (forMobile === true ? MOBILE_SECTION_HEIGHT_VH / 100 : 1);
    return { containerTop, wh, sectionHeightPx };
  }, []);

  const getCurrentSectionIndex = useCallback(() => {
    const b = getContainerBounds(isMobile);
    if (!b) return 0;
    const scrollY = window.scrollY;
    const raw = (scrollY - b.containerTop) / b.sectionHeightPx;
    return Math.max(0, Math.min(NUM_SECTIONS - 1, Math.round(raw)));
  }, [getContainerBounds, isMobile]);

  const scrollToSectionIndex = useCallback((index: number) => {
    const b = getContainerBounds(isMobile);
    if (!b) return;
    const targetY = b.containerTop + index * b.sectionHeightPx;
    isSnappingRef.current = true;
    
    // Desktop uses Lenis for smooth scrolling
    const lenis = lenisRef.current;
    if (lenis && isMobile === false) {
      lenis.scrollTo(targetY, {
        duration: SNAP_DURATION,
        easing: SNAP_EASE_OUT,
        onComplete: () => { isSnappingRef.current = false; },
      });
    } else {
      // Fallback for mobile (used by wheel events on desktop when Lenis not available)
      const startY = window.scrollY;
      const startT = performance.now();
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const elapsed = now - startT;
        const t = Math.min(1, elapsed / MOBILE_SNAP_DURATION_MS);
        const eased = easeOutCubic(t);
        window.scrollTo(0, startY + (targetY - startY) * eased);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          isSnappingRef.current = false;
        }
      };
      requestAnimationFrame(tick);
    }
  }, [getContainerBounds, isMobile]);

  // Desktop only: Snap to nearest section when scroll settles
  useEffect(() => {
    if (!isReady || !containerRef.current || isMobile !== false) return;
    const delayMs = 120;
    let t: ReturnType<typeof setTimeout> | null = null;
    const scheduleSnap = () => {
      if (isSnappingRef.current) return;
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        t = null;
        const idx = getCurrentSectionIndex();
        const b = getContainerBounds(isMobile);
        if (!b) return;
        const currentY = window.scrollY;
        const targetY = b.containerTop + idx * b.sectionHeightPx;
        if (Math.abs(currentY - targetY) < 8) return;
        scrollToSectionIndex(idx);
      }, delayMs);
    };
    const lenis = lenisRef.current;
    if (!lenis) return;
    const unsub = lenis.on('scroll', scheduleSnap);
    return () => {
      unsub();
      if (t) clearTimeout(t);
    };
  }, [isReady, isMobile, getContainerBounds, getCurrentSectionIndex, scrollToSectionIndex]);

  // Desktop only: one wheel tick = one section (impossible to skip)
  useEffect(() => {
    if (!isReady || isMobile !== false || !containerRef.current) return;
    const onWheel = (e: WheelEvent) => {
      if (isSnappingRef.current) return;
      const delta = e.deltaY;
      if (Math.abs(delta) < WHEEL_THRESHOLD) return;
      const idx = getCurrentSectionIndex();
      const next = delta > 0 ? Math.min(NUM_SECTIONS - 1, idx + 1) : Math.max(0, idx - 1);
      if (next === idx) return;
      e.preventDefault();
      scrollToSectionIndex(next);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isReady, isMobile, getCurrentSectionIndex, scrollToSectionIndex]);

  // Mobile: Natural scrolling with smart section snapping
  // Allows native touch scrolling but snaps to nearest section when scroll settles
  useEffect(() => {
    if (!isReady || isMobile !== true || !containerRef.current) return;

    let snapTimeout: ReturnType<typeof setTimeout> | null = null;
    let animationId: number | null = null;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let lastScrollTime = performance.now();

    // Smooth easing for snap animation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    // Animate to target section
    const animateToSection = (targetIdx: number) => {
      const b = getContainerBounds(true);
      if (!b) return;

      const targetY = b.containerTop + targetIdx * b.sectionHeightPx;
      const startY = window.scrollY;
      
      // Skip if already very close
      if (Math.abs(startY - targetY) < MOBILE_SNAP_THRESHOLD_PX) {
        isSnappingRef.current = false;
        return;
      }

      const startTime = performance.now();

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }

      isSnappingRef.current = true;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / MOBILE_SNAP_DURATION_MS);
        const eased = easeOutCubic(progress);
        const currentY = startY + (targetY - startY) * eased;

        window.scrollTo(0, currentY);

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          window.scrollTo(0, targetY);
          isSnappingRef.current = false;
          animationId = null;
        }
      };

      animationId = requestAnimationFrame(animate);
    };

    // Schedule snap after scroll settles
    const scheduleSnap = () => {
      if (isSnappingRef.current) return;

      if (snapTimeout) clearTimeout(snapTimeout);

      snapTimeout = setTimeout(() => {
        snapTimeout = null;
        if (isSnappingRef.current) return;

        const b = getContainerBounds(true);
        if (!b) return;

        const scrollY = window.scrollY;
        const relativeScroll = scrollY - b.containerTop;
        
        // Determine target section based on position and velocity
        let targetIdx: number;
        
        // If we have significant velocity, bias towards that direction
        if (Math.abs(scrollVelocity) > 0.5) {
          const currentSection = relativeScroll / b.sectionHeightPx;
          if (scrollVelocity > 0) {
            // Scrolling down - go to next section
            targetIdx = Math.min(NUM_SECTIONS - 1, Math.ceil(currentSection));
          } else {
            // Scrolling up - go to previous section
            targetIdx = Math.max(0, Math.floor(currentSection));
          }
        } else {
          // Low velocity - snap to nearest
          targetIdx = Math.round(relativeScroll / b.sectionHeightPx);
        }

        targetIdx = Math.max(0, Math.min(NUM_SECTIONS - 1, targetIdx));
        animateToSection(targetIdx);
      }, MOBILE_SNAP_DELAY_MS);
    };

    // Track scroll velocity
    const onScroll = () => {
      const now = performance.now();
      const deltaTime = now - lastScrollTime;
      const deltaY = window.scrollY - lastScrollY;
      
      if (deltaTime > 0) {
        scrollVelocity = deltaY / deltaTime;
      }
      
      lastScrollY = window.scrollY;
      lastScrollTime = now;

      // Only schedule snap if not currently animating
      if (!isSnappingRef.current) {
        scheduleSnap();
      }
    };

    // Block rapid scrolling during animation (optional enhancement)
    const onTouchStart = () => {
      // Cancel any pending snap when user touches
      if (snapTimeout) {
        clearTimeout(snapTimeout);
        snapTimeout = null;
      }
      // Reset velocity tracking
      lastScrollY = window.scrollY;
      lastScrollTime = performance.now();
      scrollVelocity = 0;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('touchstart', onTouchStart);
      if (snapTimeout) clearTimeout(snapTimeout);
      if (animationId !== null) cancelAnimationFrame(animationId);
    };
  }, [isReady, isMobile, getContainerBounds]);

  // Render loop - optimized for 60fps smoothness
  useEffect(() => {
    if (!isReady) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { 
      alpha: false, 
      desynchronized: true,
      willReadFrequently: false // Optimize for write performance
    });
    if (!canvas || !ctx) return;

    const animate = (time: number) => {
      lenisRef.current?.raf(time);
      const target = targetFrameRef.current;
      // Mobile: always smooth lerp so background isn't snappy; desktop: instant for first range then lerp
      const lerpFactor =
        isMobile === true
          ? MOBILE_BG_LERP
          : target <= smoothRangeEndRef.current
            ? 1
            : LERP_FACTOR;
      currentFrameRef.current = lerp(currentFrameRef.current, target, lerpFactor);
      
      const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(currentFrameRef.current)));
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
    return () => { 
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isReady, isMobile, drawFrame, findFrame]);

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

  return (
    <div
      ref={containerRef}
      className="home-scroll-container relative flex flex-col"
      style={{ height: 'auto' }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 bg-black home-canvas-fill"
        style={{ 
          willChange: 'transform', 
          transform: 'translateZ(0)', 
          zIndex: 1,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          perspective: 1000
        }}
      />

      {/* Subtle vignette – lighter on mobile so overlay stays clearer */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-50 max-md:opacity-30" style={{ zIndex: 5 }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] max-md:bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.35)_100%)]" />
      </div>

      {/* Mobile-only glass overlay for home (readability) – styled in globals.css @media (max-width: 767px) */}
      <div className="mobile-home-glass" aria-hidden="true" />

      {/* Mobile: scroll-snap magnets so users don’t skip sections */}
      {Array.from({ length: NUM_SECTIONS }, (_, i) => (
        <div
          key={i}
          className="home-snap-section flex-shrink-0"
          style={{ height: `${isMobile === true ? MOBILE_SECTION_HEIGHT_VH : SECTION_HEIGHT_VH}vh` }}
          aria-hidden
        />
      ))}

      {/* ========== HERO ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.hero.start} end={SECTIONS.hero.end} align="top-left">
        {(visible) => (
          <div className="relative max-md:mx-auto max-md:text-left">
            <FadeIn show={visible} delay={0}>
              <p className="text-[#7cb3ff] text-[11px] md:text-[13px] tracking-[0.25em] uppercase mb-3 md:mb-4 font-medium">{t('homePage.heroLabel')}</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h1 className="text-[1.75rem] leading-tight font-serif tracking-[-0.02em] text-white mb-4 md:mb-6 md:text-[clamp(2.8rem,7vw,5rem)] md:leading-[1.05]">
                {t('homePage.heroTitleLine1')}<br />{t('homePage.heroTitleLine2')}
              </h1>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p
                className={`text-white/90 text-[14px] leading-[1.6] font-light mb-4 max-md:max-w-full ${isLongCtaLanguage ? 'md:max-w-[520px]' : 'md:max-w-[360px]'} md:text-[20px] md:leading-[1.7]`}
              >
                {t('homePage.heroIntro')}
              </p>
            </FadeIn>
          </div>
        )}
      </Section>

      {/* Standalone CTA Button for Hero - Positioned below hero text */}
      {showHeroCTA && (
        <motion.div
          className="fixed home-cta-mobile"
          style={{
            left: '8vw',
            bottom: heroCtaBottom,
            zIndex: 1000,
            pointerEvents: 'auto',
            maxWidth: '450px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            opacity: heroCTAOpa,
            y: heroCTAY
          }}
        >
          <button
            type="button"
            onClick={() => {
              router.push('/about');
            }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
            style={{
              pointerEvents: 'auto',
              zIndex: 1001
            }}
          >
            <span className="relative z-10 tracking-wide">{t('homePage.learnMoreAboutUs')}</span>
            <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">→</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          </button>
        </motion.div>
      )}

      {/* ========== OVERVIEW ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.overview.start} end={SECTIONS.overview.end} align="bottom-left">
        {(visible, sectionProgress) => {
          // Counter finishes at 43% (0.375 into section), then stays static
          const counterProgress = Math.min(1, sectionProgress / 0.375);
          return (
            <div className="ml-0 -mb-4 md:ml-[6vw] md:-mb-[8vh] max-md:text-left">
              <FadeIn show={visible} delay={0}>
                <p className="text-[#7cb3ff] text-[11px] md:text-[14px] tracking-[0.25em] uppercase mb-5 md:mb-10 font-medium">{t('homePage.atGlance')}</p>
              </FadeIn>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:gap-x-24 md:gap-y-10 max-md:justify-items-start">
                {[
                  { val: 1, suf: ' MT', label: t('homePage.monthlyVolume') },
                  { val: 300, suf: 'K+', label: t('homePage.mtsStorageCapacity') },
                  { val: 110, suf: '+', label: t('homePage.globalPartners') },
                  { val: 20, suf: '+', label: t('homePage.teamMembers') },
                ].map((s, i) => (
                  <FadeIn key={s.label} show={visible} delay={0.05 + i * 0.05} direction="left">
                    <div>
                      <p className="text-[28px] md:text-[56px] font-[300] text-white tracking-tight leading-none mb-1 md:mb-2 tabular-nums">
                        <Counter value={s.val} suffix={s.suf} progress={counterProgress} />
                      </p>
                      <p className="text-white/70 text-[11px] md:text-[15px] font-normal tracking-wide">{s.label}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          );
        }}
      </Section>

      {/* ========== TRADING ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.trading.start} end={SECTIONS.trading.end} align="left">
        {(visible) => (
          <div className="max-w-[450px] max-md:max-w-full max-md:text-left">
            <FadeIn show={visible} delay={0}>
              <p className="text-[#5a9cff] text-[11px] md:text-[13px] tracking-[0.25em] uppercase mb-2 md:mb-3 font-medium">{t('homePage.coreBusiness')}</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[1.35rem] md:text-[clamp(2.2rem,5vw,3.8rem)] font-serif text-white tracking-tight leading-[1.1] mb-3 md:mb-5">
                {t('homePage.trading')}
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p className="text-white/90 text-[14px] md:text-[20px] leading-[1.6] md:leading-[1.7] font-light mb-4 md:mb-6">
                {t('homePage.tradingDescription')}
              </p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.3}>
              <div className="space-y-1.5 md:space-y-2.5 text-white/80 text-[13px] md:text-[16px] font-light mb-4 md:mb-6">
                <p>→ {t('homePage.shippingOptimization')}</p>
                <p>→ {t('homePage.storageManagement')}</p>
                <p>→ {t('homePage.riskHedging')}</p>
              </div>
            </FadeIn>
            
          </div>
        )}
      </Section>
      
      {/* Standalone CTA Button - Positioned lower for ES/FR so longer text doesn't cover content */}
      {showTradingCTA && (
        <motion.div
          className="fixed home-cta-mobile"
          style={{
            left: '8vw',
            bottom: tradingCtaBottom,
            zIndex: 1000,
            pointerEvents: 'auto',
            maxWidth: '450px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showTradingCTA ? 1 : 0, y: showTradingCTA ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <button
            type="button"
            onClick={() => {
              router.push('/trading');
            }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
            style={{
              pointerEvents: 'auto',
              zIndex: 1001
            }}
          >
            <span className="relative z-10 tracking-wide">{t('homePage.discoverTrading')}</span>
            <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">→</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          </button>
        </motion.div>
      )}

      {/* ========== LOGISTICS ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.logistics.start} end={SECTIONS.logistics.end} align="top-left">
        {(visible) => (
          <div className={`max-md:mt-0 max-md:text-left ${language === 'en' || language === 'de' ? 'md:mt-8' : 'md:mt-2'}`}>
            <FadeIn show={visible} delay={0}>
              <p className="text-[#4a8fe8] text-[11px] md:text-[13px] tracking-[0.25em] uppercase mb-2 md:mb-3 font-medium">{t('homePage.infrastructure')}</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[1.35rem] md:text-[clamp(2.2rem,6vw,3.8rem)] font-serif text-white tracking-tight leading-[1.1] mb-3 md:mb-5">
                {t('homePage.logisticsStorage')}
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p className="text-white/90 text-[14px] md:text-[20px] leading-[1.6] md:leading-[1.75] font-light mb-4 md:mb-6 max-w-[450px] max-md:max-w-full">
                {t('homePage.logisticsDescription')}
              </p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.3}>
              <p className="text-white/80 text-[13px] md:text-[16px] font-light border-l-2 border-[#4a8fe8]/60 pl-3 md:pl-4">
                {t('homePage.serbiaReserves')}
              </p>
            </FadeIn>
          </div>
        )}
      </Section>

      {/* Standalone CTA Button for Logistics - Positioned below Logistics section */}
      {showLogisticsCTA && (
        <motion.div
          className="fixed home-cta-mobile"
          style={{
            left: '8vw',
            bottom: '21.5vh',
            zIndex: 1000,
            pointerEvents: 'auto',
            maxWidth: '450px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showLogisticsCTA ? 1 : 0, y: showLogisticsCTA ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <button
            type="button"
            onClick={() => {
              router.push('/logistics');
            }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
            style={{
              pointerEvents: 'auto',
              zIndex: 1001
            }}
          >
            <span className="relative z-10 tracking-wide">{t('homePage.exploreInfrastructure')}</span>
            <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">→</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          </button>
        </motion.div>
      )}

      {/* ========== RISK & COMPLIANCE ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.risk.start} end={SECTIONS.risk.end} align="right">
        {(visible) => (
          <div className="max-w-[400px] max-md:max-w-full max-md:text-left text-center md:text-right md:ml-auto">
            <FadeIn show={visible} delay={0}>
              <p className="text-[#3d7dd4] text-[11px] md:text-[13px] tracking-[0.25em] uppercase mb-2 md:mb-3 font-medium">{t('homePage.governance')}</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[1.35rem] md:text-[clamp(2rem,5vw,3.2rem)] font-serif text-white tracking-tight leading-[1.1] mb-3 md:mb-5">
                {t('homePage.riskCompliance')}
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.2}>
              <p className="text-white/90 text-[14px] md:text-[20px] leading-[1.6] md:leading-[1.7] font-light mb-3 md:mb-4">
                {t('homePage.riskDescription')}
              </p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.3}>
              <div className="flex flex-wrap justify-center max-md:justify-start md:justify-end gap-2 mb-6 md:mb-8">
                {[t('homePage.kyc'), t('homePage.sanctions'), t('homePage.antiBribery'), t('homePage.aml')].map((item) => (
                  <span key={item} className="px-3 py-1 text-[11px] md:text-[12px] text-white/90 font-light border border-[#3d7dd4]/50 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        )}
      </Section>

      {/* Standalone CTA Button for Risk & Compliance - Positioned below Risk section */}
      {showRiskCTA && (
        <motion.div
          className="fixed home-cta-mobile"
          style={{
            right: '8vw',
            bottom: '18vh',
            zIndex: 1000,
            pointerEvents: 'auto',
            maxWidth: '450px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showRiskCTA ? 1 : 0, y: showRiskCTA ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <button
            type="button"
            onClick={() => {
              router.push('/compliance');
            }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
            style={{
              pointerEvents: 'auto',
              zIndex: 1001
            }}
          >
            <span className="relative z-10 tracking-wide">{t('homePage.learnGovernance')}</span>
            <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">→</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          </button>
        </motion.div>
      )}

      {/* ========== GLOBAL PRESENCE ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.global.start} end={SECTIONS.global.end} align="left" noFadeOut>
        {(visible) => (
          <div className="max-md:text-left">
            <FadeIn show={visible} delay={0}>
              <p className="text-[#6aa8f0] text-[11px] md:text-[13px] tracking-[0.25em] uppercase mb-2 md:mb-3 font-medium">{t('homePage.worldwide')}</p>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.1}>
              <h2 className="text-[1.35rem] md:text-[clamp(2.2rem,6vw,3.8rem)] font-serif text-white tracking-tight leading-[1.1] mb-4 md:mb-6">
                {t('homePage.globalPresence')}
              </h2>
            </FadeIn>
            
            <FadeIn show={visible} delay={0.15}>
              <p className="text-white/90 text-[13px] md:text-[15px] leading-[1.6] font-light mb-4 md:mb-5 max-w-[300px] max-md:max-w-full">
                {t('homePage.globalDescription')}
              </p>
            </FadeIn>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 md:gap-x-6 md:gap-y-4 max-w-[400px] max-md:max-w-full mb-6 md:mb-8 max-md:justify-items-start">
              {[
                { city: t('homePage.dubaiUAE'), role: t('homePage.globalHeadquarters'), primary: true },
                { city: t('homePage.genevaSwitzerland'), role: t('homePage.tradingOperations') },
                { city: t('homePage.belgradeSerbia'), role: t('homePage.regionalOperations') },
                { city: t('homePage.istanbulTurkey'), role: t('homePage.regionalOperations') },
              ].map((loc, i) => (
                <FadeIn key={loc.city} show={visible} delay={0.2 + i * 0.06} direction="left">
                  <div className="flex items-center gap-2 md:gap-2.5">
                    <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 ${loc.primary ? 'bg-[#6aa8f0]' : 'bg-white/50'}`} />
                    <div className="min-w-0">
                      <p className={`text-[12px] md:text-[14px] font-light ${loc.primary ? 'text-white' : 'text-white/90'}`}>{loc.city}</p>
                      <p className="text-white/70 text-[10px] md:text-[11px]">{loc.role}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Standalone CTA Button for Global Presence - Positioned below Global section */}
      {showGlobalCTA && (
        <motion.div
          className={cn("fixed home-cta-mobile", language === "de" && "home-cta-global-de", language === "fr" && "home-cta-global-fr")}
          style={{
            left: '8vw',
            bottom: '18vh',
            zIndex: 1000,
            pointerEvents: 'auto',
            maxWidth: '450px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showGlobalCTA ? 1 : 0, y: showGlobalCTA ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <button
            type="button"
            onClick={() => {
              router.push('/global');
            }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 text-white text-[16px] font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-sm hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-105 hover:shadow-[0_0_20px_rgba(61,125,212,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
            style={{
              pointerEvents: 'auto',
              zIndex: 1001
            }}
          >
            <span className="relative z-10 tracking-wide">{t('homePage.discoverGlobalNetwork')}</span>
            <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-[#3d7dd4]">→</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/20 to-[#3d7dd4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          </button>
        </motion.div>
      )}

      {/* ========== FOOTNOTE ========== */}
      <Section scrollProgress={scrollYProgress} start={SECTIONS.footnote.start} end={SECTIONS.footnote.end} align="bottom-left-footer" noFadeOut>
        {(visible) => (
          <div className="max-w-4xl w-full !pb-0">
            <FadeIn show={visible} delay={0}>
              <div className="border-t border-white/20 pt-6 pb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <p className="text-white/70 text-xs">
                    © {new Date().getFullYear()} {t('footer.copyrightSuffix')}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-xs text-white/70">
                    <a href="/about" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a>
                    <a href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</a>
                    <a href="/Futura_Energy_Privacy_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
                    <a href="/Futura_Energy_Cookie_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footer.cookies')}</a>
                    <a href="/Futura_Energy_Terms_of_Use.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footer.terms')}</a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </Section>

      {/* Loading State */}
      {!isReady && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-8"
          >
            <img 
              src="/Futura_Ultimate.png" 
              alt="Futura Energy" 
              className="w-auto h-16 md:h-20 object-contain"
            />
          </motion.div>
          
          {/* Blue Loading Spinner */}
          <motion.div
            className="w-8 h-8 border-2 border-[#3d7dd4] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          />
        </div>
      )}

      {/* Full Quality Indicator - Bottom Right */}
      {showQualityIndicator && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.5,
            exit: { duration: 0.8 }
          }}
        >
          <span className="text-white/90 text-[11px] font-light tracking-wide">{t('homePage.fullQuality')}</span>
          <motion.div
            className="w-4 h-4 border-2 border-[#3d7dd4] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

