"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function TradingStoryScroll() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLElement | null>(null);

  const chapters = [
    {
      kicker: "TRADING",
      title: "Core Trading Activities",
      body: "Trading is at the core of Futura's activities, combining disciplined execution with structured risk controls. We focus on crude oil and refined petroleum product trading, supported by shipping and freight optimization, storage management, and hedging and risk management.",
      imageSrc: "/crude-oil-tanker-vessel-maritime.jpg",
      accent: "#0B5E8E",
    },
    {
      kicker: "VOLUMES",
      title: "Monthly Trading Volumes",
      body: "A consistent flow across refined products and crude oil, supporting repeatable execution across key corridors. Our monthly volumes include ULSD (350 KT), Fuel Oil (300 KT), HSGO (100 KT), Gasoline (100 KT), VGO (90 KT), and Crude Oil (2–3m BBLs).",
      imageSrc: "/oil-refinery-processing-facility-night.jpg",
      accent: "#10B981",
    },
    {
      kicker: "PROCEDURE",
      title: "Business Procedure",
      body: "Execution is supported by structured processes: supplier prepayment, FOB Baltic and Black Sea ports, loading & LC opening from the receiver, delivery 15–40 days depending on destination, and payment as per LC 30–45 days depending on client.",
      imageSrc: "/massive-oil-storage-tanks-at-industrial-terminal-f.jpg",
      accent: "#F59E0B",
    },
    {
      kicker: "FOOTPRINT",
      title: "Trading Footprint",
      body: "Active across the Mediterranean Sea, Black Sea, North Africa, West Africa, and South America. A focused footprint across key corridors, positioned to support supply and demand across these strategic regions.",
      imageSrc: "/large-cargo-ship-and-oil-tanker-at-industrial-port.jpg",
      accent: "#8B5CF6",
    },
    {
      kicker: "RELATIONSHIPS",
      title: "Counterpart Relationships",
      body: "We work with partners and counterparties across Europe, Africa, the Middle East, and Latin America. Annual term contracts with various National Oil Companies, and term/spot with major refineries and private importers.",
      imageSrc: "/financial-trading-screens-and-risk-management-dash.jpg",
      accent: "#EF4444",
    },
  ];

  // Define constants for precise scroll calculation
  const CHAPTERS = chapters.length;

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!wrapperRef.current || !pinRef.current || typeof window === "undefined") {
      return;
    }

    const VIEWPORT = window.innerHeight;
    const SCROLL_PER_CHAPTER = VIEWPORT * 0.5; // Further reduced scroll per chapter

    const ctx = gsap.context(() => {
      // Get all chapter elements
      const chapterTexts = pinRef.current?.querySelectorAll(".chapter-text");
      const chapterMedias = pinRef.current?.querySelectorAll(".chapter-media");
      const lightSweeps = pinRef.current?.querySelectorAll(".light-sweep");

      if (!chapterTexts || !chapterMedias || chapterTexts.length === 0) {
        return;
      }

      // Set initial states
      chapterTexts.forEach((el, i) => {
        gsap.set(el, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 30,
          x: 0,
          filter: "blur(0px)",
        });
      });

      chapterMedias.forEach((el, i) => {
        gsap.set(el, {
          opacity: i === 0 ? 1 : 0,
          scale: i === 0 ? 1 : 0.98,
          x: 0,
          y: i === 0 ? 0 : 20,
          filter: "blur(0px)",
        });
      });

      if (lightSweeps) {
        lightSweeps.forEach((el) => {
          gsap.set(el, { xPercent: -120 });
        });
      }

      // Create timeline with exact duration matching chapters - also handles pinning
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: () => `+=${(CHAPTERS - 1) * SCROLL_PER_CHAPTER}`,
          pin: pinRef.current,
          scrub: true,
          markers: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const segmentDuration = 1; // Duration per chapter - timeline will be exactly CHAPTERS units

      chapters.forEach((_, i) => {
        const startTime = i * segmentDuration;
        const textEl = chapterTexts[i];
        const mediaEl = chapterMedias[i];
        const sweepEl = lightSweeps?.[i];

        if (i === 0) {
          // First chapter: fade in
          tl.fromTo(
            textEl,
            { opacity: 0, y: 30, x: -10, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              x: 0,
              filter: "blur(0px)",
              duration: 0.5,
              ease: "power2.out",
            },
            startTime
          );

          tl.fromTo(
            mediaEl,
            { opacity: 0, scale: 0.98, y: 20, filter: "blur(8px)" },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.6,
              ease: "power2.out",
            },
            startTime
          );

          // Light sweep
          if (sweepEl) {
            tl.to(
              sweepEl,
              {
                xPercent: 120,
                duration: 0.4,
                ease: "power2.inOut",
              },
              startTime + 0.1
            );
          }
        } else {
          // Transition from previous chapter
          const prevText = chapterTexts[i - 1];
          const prevMedia = chapterMedias[i - 1];

          // Fade out previous
          tl.to(
            prevText,
            {
              opacity: 0,
              y: -20,
              filter: "blur(8px)",
              duration: 0.4,
              ease: "power2.in",
            },
            startTime - 0.2
          );

          tl.to(
            prevMedia,
            {
              opacity: 0,
              scale: 0.95,
              filter: "blur(8px)",
              duration: 0.4,
              ease: "power2.in",
            },
            startTime - 0.2
          );

          // Fade in new
          tl.fromTo(
            textEl,
            { opacity: 0, y: 30, x: -10, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              x: 0,
              filter: "blur(0px)",
              duration: 0.5,
              ease: "power2.out",
            },
            startTime - 0.1
          );

          tl.fromTo(
            mediaEl,
            { opacity: 0, scale: 0.98, x: 10, filter: "blur(8px)" },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              filter: "blur(0px)",
              duration: 0.6,
              ease: "power2.out",
            },
            startTime - 0.1
          );

          // Light sweep
          if (sweepEl) {
            tl.to(
              sweepEl,
              {
                xPercent: 120,
                duration: 0.4,
                ease: "power2.inOut",
              },
              startTime
            );
          }

          // Parallax on media during chapter
          tl.to(
            mediaEl,
            {
              y: -20,
              duration: segmentDuration * 0.6,
              ease: "none",
            },
            startTime
          );
        }
      });
    }, pinRef);

    // Refresh on resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [chapters.length]);

  // Calculate wrapper height - further reduced for faster scroll
  const wrapperHeight = typeof window !== "undefined" 
    ? `${CHAPTERS * window.innerHeight * 0.5}px` 
    : `${CHAPTERS * 50}vh`;

  return (
    <div
      ref={wrapperRef}
      style={{
        height: wrapperHeight,
      }}
    >
      <section
        ref={pinRef}
        className="relative min-h-screen overflow-hidden"
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />

        {/* Main content grid */}
        <div className="relative mx-auto max-w-6xl h-screen grid grid-cols-12 items-center gap-10 px-8">
          {/* Left: Text column */}
          <div className="col-span-5 relative">
            {chapters.map((chapter, i) => (
              <div
                key={i}
                className="chapter chapter-text absolute top-0 left-0 w-full"
                data-i={i}
              >
                <div className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3">
                  {chapter.kicker}
                </div>
                <h2 className="text-5xl font-semibold text-slate-900 mb-6 leading-tight">
                  {chapter.title}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {chapter.body}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Media column */}
          <div className="col-span-7 relative">
            {chapters.map((chapter, i) => (
              <div
                key={i}
                className="chapter chapter-media absolute inset-0 flex items-center justify-center"
                data-i={i}
              >
                <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={chapter.imageSrc}
                    alt={chapter.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.style.backgroundColor = chapter.accent;
                        parent.style.display = "flex";
                        parent.style.alignItems = "center";
                        parent.style.justifyContent = "center";
                        parent.style.color = "white";
                        parent.style.fontSize = "2rem";
                        parent.style.fontWeight = "600";
                        parent.textContent = `${i + 1}`;
                      }
                    }}
                  />
                  {/* Light sweep overlay */}
                  <div
                    className="light-sweep absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
