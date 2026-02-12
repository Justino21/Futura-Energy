"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function GsapStep1() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const crudeFillRef = useRef<HTMLDivElement | null>(null);
  const refinedFillRef = useRef<HTMLDivElement | null>(null);
  const left1Ref = useRef<HTMLDivElement | null>(null);
  const left2Ref = useRef<HTMLDivElement | null>(null);
  const left3Ref = useRef<HTMLDivElement | null>(null);
  const railFillRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const pinAreaRef = useRef<HTMLDivElement | null>(null);
  const chapter1Ref = useRef<HTMLDivElement | null>(null);
  const chapter2Ref = useRef<HTMLDivElement | null>(null);
  const chapter3Ref = useRef<HTMLDivElement | null>(null);
  const arcRef = useRef<SVGPathElement | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    console.log("GSAP STEP 1 MOUNTED");

    // Check refs exist
    if (!crudeFillRef.current) {
      console.warn("crudeFillRef is null");
      return;
    }
    if (!refinedFillRef.current) {
      console.warn("refinedFillRef is null");
      return;
    }
    if (!left1Ref.current) {
      console.warn("left1Ref is null");
      return;
    }
    if (!left2Ref.current) {
      console.warn("left2Ref is null");
      return;
    }
    if (!left3Ref.current) {
      console.warn("left3Ref is null");
      return;
    }
    if (!wrapperRef.current) {
      console.warn("wrapperRef is null");
      return;
    }
    if (!pinAreaRef.current) {
      console.warn("pinAreaRef is null");
      return;
    }
    if (!chapter1Ref.current) {
      console.warn("chapter1Ref is null");
      return;
    }
    if (!chapter2Ref.current) {
      console.warn("chapter2Ref is null");
      return;
    }
    if (!chapter3Ref.current) {
      console.warn("chapter3Ref is null");
      return;
    }
    if (!railFillRef.current) {
      console.warn("railFillRef is null");
      return;
    }
    if (!glowRef.current) {
      console.warn("glowRef is null");
      return;
    }
    if (!arcRef.current) {
      console.warn("arcRef is null");
      return;
    }

    console.log("All refs exist:", {
      crudeFill: !!crudeFillRef.current,
      refinedFill: !!refinedFillRef.current,
      left1: !!left1Ref.current,
      left2: !!left2Ref.current,
      left3: !!left3Ref.current,
      railFill: !!railFillRef.current,
      glow: !!glowRef.current,
      wrapper: !!wrapperRef.current,
      pinArea: !!pinAreaRef.current,
      chapter1: !!chapter1Ref.current,
      chapter2: !!chapter2Ref.current,
      chapter3: !!chapter3Ref.current,
      arc: !!arcRef.current,
    });

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(left1Ref.current, { autoAlpha: 0, y: 24 }); // Will fade in early
      gsap.set(left2Ref.current, { autoAlpha: 0, y: 14 }); // Hidden until chapter transition
      gsap.set(left3Ref.current, { autoAlpha: 0, y: 14 }); // Hidden until chapter 3 transition
      gsap.set(crudeFillRef.current, { width: "12%" });
      gsap.set(refinedFillRef.current, { width: "8%" });
      gsap.set(chapter1Ref.current, { autoAlpha: 1, y: 0 });
      gsap.set(chapter2Ref.current, { autoAlpha: 0, y: 18, pointerEvents: "none" });
      gsap.set(chapter3Ref.current, { autoAlpha: 0, y: 18, pointerEvents: "none" });
      gsap.set(railFillRef.current, { width: "0%" }); // Progress rail starts empty
      gsap.set(glowRef.current, { x: 0, y: 0 }); // Glow starts at origin
      
      // Set initial state for Chapter 2 rail
      if (left2Ref.current) {
        const rail2 = left2Ref.current.querySelector(".progressRailFill");
        if (rail2) {
          gsap.set(rail2, { width: "0%" });
        }
      }
      
      // Set initial state for volume cards
      if (chapter2Ref.current) {
        const cards = chapter2Ref.current.querySelectorAll(".volCard");
        gsap.set(cards, { autoAlpha: 0, y: 14, scale: 0.98 });
      }
      
      // Set initial state for Chapter 3 dots and arc
      if (chapter3Ref.current) {
        const dots = chapter3Ref.current.querySelectorAll(".footprintDot");
        gsap.set(dots, { scale: 0, autoAlpha: 0 });
        
        // Set arc initial state (full dashoffset so it's invisible)
        if (arcRef.current) {
          const pathLength = arcRef.current.getTotalLength();
          gsap.set(arcRef.current, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          });
        }
      }
      
      // Set initial state for Chapter 3 rail
      if (left3Ref.current) {
        const rail3 = left3Ref.current.querySelector(".progressRailFill");
        if (rail3) {
          gsap.set(rail3, { width: "0%" });
        }
      }

      // Define segment duration per chapter
      const SEG = 1;
      const chapters = 3;
      const totalDuration = chapters * SEG;

      // Calculate ScrollTrigger end based on viewport height
      const scrollEnd = typeof window !== "undefined" 
        ? Math.round(window.innerHeight * chapters * 1.2)
        : 3600;

      // Create timeline with ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: `+=${scrollEnd}`,
          scrub: 1,
          pin: pinAreaRef.current,
          markers: false,
          anticipatePin: 1,
        },
      });

      // Add chapter labels
      tl.addLabel("c1", 0);
      tl.addLabel("c2", SEG);
      tl.addLabel("c3", SEG * 2);

      // ========== CHAPTER 1 SEGMENT (0 to SEG) ==========
      // Left text Chapter 1 fades in
      tl.to(left1Ref.current, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.4,
      }, "c1+=0.1");

      // Bars grow
      tl.to(crudeFillRef.current, {
        width: "72%",
        ease: "none",
        duration: SEG * 0.8,
      }, "c1");

      tl.to(refinedFillRef.current, {
        width: "55%",
        ease: "none",
        duration: SEG * 0.8,
      }, "c1");

      // Progress rail fills continuously
      tl.to(railFillRef.current, {
        width: "100%",
        ease: "none",
        duration: totalDuration,
      }, "c1");

      // Also animate the rail in Chapter 2 and 3 (synced)
      if (left2Ref.current) {
        const rail2 = left2Ref.current.querySelector(".progressRailFill");
        if (rail2) {
          tl.to(rail2, {
            width: "100%",
            ease: "none",
            duration: totalDuration,
          }, "c1");
        }
      }

      if (left3Ref.current) {
        const rail3 = left3Ref.current.querySelector(".progressRailFill");
        if (rail3) {
          tl.to(rail3, {
            width: "100%",
            ease: "none",
            duration: totalDuration,
          }, "c1");
        }
      }

      // Ambient glow drifts subtly
      tl.to(glowRef.current, {
        x: 80,
        y: -40,
        ease: "none",
        duration: totalDuration,
      }, "c1");

      // ========== CHAPTER 2 SEGMENT (SEG to SEG*2) ==========
      // Chapter 1 -> Chapter 2 crossfade (transition window)
      tl.to(chapter1Ref.current, {
        autoAlpha: 0,
        y: -12,
        ease: "power2.inOut",
        duration: 0.2,
      }, "c2");

      tl.to(chapter2Ref.current, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.2,
        pointerEvents: "auto",
      }, "c2");

      // Left text crossfade
      tl.to(left1Ref.current, {
        autoAlpha: 0,
        y: -10,
        ease: "power2.inOut",
        duration: 0.2,
      }, "c2");

      tl.to(left2Ref.current, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.2,
      }, "c2");

      // Animate volume cards with stagger (early in Chapter 2 segment)
      if (chapter2Ref.current) {
        const cards = chapter2Ref.current.querySelectorAll(".volCard");
        tl.to(cards, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          ease: "power2.out",
          stagger: 0.08,
          duration: 0.3,
        }, "c2+=0.25");

        // Hold Chapter 2 visible until end of segment (no fade out)
        tl.to(chapter2Ref.current, {
          autoAlpha: 1,
        }, `c2+=${SEG * 0.7}`);
      }

      // ========== CHAPTER 3 SEGMENT (SEG*2 to SEG*3) ==========
      // Chapter 2 -> Chapter 3 crossfade (transition window)
      tl.to(chapter2Ref.current, {
        autoAlpha: 0,
        y: -12,
        ease: "power2.inOut",
        duration: 0.2,
        pointerEvents: "none",
      }, "c3");

      tl.to(chapter3Ref.current, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.2,
        pointerEvents: "auto",
      }, "c3");

      // Left text crossfade
      tl.to(left2Ref.current, {
        autoAlpha: 0,
        y: -10,
        ease: "power2.inOut",
        duration: 0.2,
      }, "c3");

      tl.to(left3Ref.current, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.2,
      }, "c3");

      // Animate Chapter 3 dots with stagger (early in Chapter 3 segment)
      if (chapter3Ref.current) {
        const dots = chapter3Ref.current.querySelectorAll(".footprintDot");
        tl.to(dots, {
          scale: 1,
          autoAlpha: 1,
          ease: "power2.out",
          stagger: 0.08,
          duration: 0.3,
        }, "c3+=0.25");

        // Draw arc
        if (arcRef.current) {
          tl.to(arcRef.current, {
            strokeDashoffset: 0,
            ease: "none",
            duration: 0.3,
          }, "c3+=0.25");
        }
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const volumes = [
    { label: "ULSD", value: "350 KT" },
    { label: "Fuel Oil", value: "300 KT" },
    { label: "HSGO", value: "100 KT" },
    { label: "Gasoline", value: "100 KT" },
    { label: "VGO", value: "90 KT" },
    { label: "Crude Oil", value: "2–3m BBLs" },
  ];

  return (
    <div ref={rootRef}>
      <section
        ref={wrapperRef}
        id="step1"
        style={{
          height: "200vh",
          background: "#f1f5f9",
        }}
      >
        <div
          ref={pinAreaRef}
          id="pinArea"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          style={{
            height: "100vh",
            padding: "2rem",
            paddingTop: "calc(2rem + 32px)",
            position: "relative",
            overflow: "hidden",
            alignItems: "center",
          }}
        >
          {/* Ambient Glow Background */}
          <div
            ref={glowRef}
            style={{
              position: "absolute",
              width: "520px",
              height: "520px",
              borderRadius: "999px",
              background: "rgba(11, 94, 142, 0.25)",
              filter: "blur(70px)",
              opacity: 0.35,
              top: "10%",
              left: "5%",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          
          {/* Left Text Column */}
          <div
            style={{
              maxWidth: "520px",
              paddingTop: "32px",
              zIndex: 1,
            }}
          >
                {/* Text Overlay Container */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.78)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    padding: "2rem",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  {/* Chapter 1 Text */}
                  <div
                    ref={left1Ref}
                    style={{
                      position: "relative",
                    }}
                  >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#0B5E8E",
                  marginBottom: "0.75rem",
                }}
              >
                TRADING
              </div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 600,
                  marginBottom: "0.875rem",
                  color: "#0B1F33",
                  lineHeight: "1.2",
                }}
              >
                Trading at the core
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  color: "#4B5563",
                  marginBottom: "1.25rem",
                }}
              >
                Trading is at the core of Futura's activities, focused on crude oil and refined petroleum products.
              </p>
              {/* Progress Rail */}
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(226, 232, 240, 0.4)",
                  overflow: "hidden",
                  marginTop: "1.5rem",
                }}
              >
                <div
                  ref={railFillRef}
                  style={{
                    height: "4px",
                    borderRadius: "9999px",
                    backgroundColor: "#0B5E8E",
                    width: "0%",
                  }}
                />
              </div>
                  </div>

                  {/* Chapter 2 Text */}
                  <div
                    ref={left2Ref}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      transform: "translateY(14px)",
                    }}
                  >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#0B5E8E",
                  marginBottom: "0.75rem",
                }}
              >
                VOLUMES
              </div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 600,
                  marginBottom: "0.875rem",
                  color: "#0B1F33",
                  lineHeight: "1.2",
                }}
              >
                Monthly trading volumes
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  color: "#4B5563",
                  marginBottom: "1.25rem",
                }}
              >
                A consistent flow across refined products and crude oil, supporting repeatable execution across key corridors.
              </p>
              {/* Progress Rail (same position) */}
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(226, 232, 240, 0.4)",
                  overflow: "hidden",
                  marginTop: "1.5rem",
                }}
              >
                <div
                  className="progressRailFill"
                  style={{
                    height: "4px",
                    borderRadius: "9999px",
                    backgroundColor: "#0B5E8E",
                    width: "0%",
                  }}
                />
              </div>
                  </div>

                  {/* Chapter 3 Text */}
                  <div
                    ref={left3Ref}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      transform: "translateY(14px)",
                    }}
                  >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#0B5E8E",
                  marginBottom: "0.75rem",
                }}
              >
                FOOTPRINT
              </div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 600,
                  marginBottom: "0.875rem",
                  color: "#0B1F33",
                  lineHeight: "1.2",
                }}
              >
                Focused trading corridors
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  color: "#4B5563",
                  marginBottom: "1.25rem",
                }}
              >
                Active across the Mediterranean Sea, Black Sea, North Africa, West Africa and South America.
              </p>
              {/* Progress Rail (same position) */}
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(226, 232, 240, 0.4)",
                  overflow: "hidden",
                  marginTop: "1.5rem",
                }}
              >
                <div
                  className="progressRailFill"
                  style={{
                    height: "4px",
                    borderRadius: "9999px",
                    backgroundColor: "#0B5E8E",
                    width: "0%",
                  }}
                />
              </div>
                  </div>
                </div>
          </div>

          {/* Right Visual Stage Container */}
          <div
            className="h-[420px] md:h-[420px] w-full"
            style={{
              position: "relative",
              borderRadius: "24px",
              border: "1px solid rgb(226, 232, 240)",
              background: "linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(240, 253, 250, 0.92) 100%)",
              boxShadow: "0 20px 60px rgba(2, 8, 23, 0.08)",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            {/* Subtle background texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.3,
                pointerEvents: "none",
              }}
            />
            {/* Subtle radial highlight */}
            <div
              style={{
                position: "absolute",
                top: "-20%",
                right: "-10%",
                width: "60%",
                height: "60%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(11, 94, 142, 0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            {/* Chapter 1: Crude vs Refined Bars */}
            <div
              ref={chapter1Ref}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    borderRadius: "24px",
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(8px)",
                    padding: "48px",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        Crude
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Focus
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        borderRadius: "9999px",
                        backgroundColor: "#f1f5f9",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        ref={crudeFillRef}
                        style={{
                          height: "10px",
                          borderRadius: "9999px",
                          backgroundColor: "#0B5E8E",
                          width: "12%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        Refined Products
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Focus
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        borderRadius: "9999px",
                        backgroundColor: "#f1f5f9",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        ref={refinedFillRef}
                        style={{
                          height: "10px",
                          borderRadius: "9999px",
                          backgroundColor: "#0B5E8E",
                          width: "8%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            {/* Chapter 2: Monthly Trading Volumes */}
            <div
              ref={chapter2Ref}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                transform: "translateY(18px)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
                <div
                  style={{
                    width: "82%",
                    height: "75%",
                    maxWidth: "none",
                    borderRadius: "24px",
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    padding: "3.5rem",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "2rem",
                    }}
                  >
                    Monthly Trading Volumes
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px",
                    }}
                  >
                    {volumes.map((volume, index) => (
                      <div
                        key={index}
                        className="volCard"
                        style={{
                          borderRadius: "16px",
                          border: "1px solid rgb(226, 232, 240)",
                          background: "#f8fafc",
                          padding: "14px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            marginBottom: "8px",
                          }}
                        >
                          {volume.label}
                        </div>
                        <div
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          {volume.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            {/* Chapter 3: Trading Footprint */}
            <div
              ref={chapter3Ref}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                transform: "translateY(18px)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
                <div
                  style={{
                    width: "82%",
                    height: "75%",
                    maxWidth: "none",
                    borderRadius: "24px",
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    padding: "3.5rem",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Trading Footprint
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#64748b",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Focused corridors across key regions.
                  </p>
                  
                  {/* Region Pills */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "24px",
                    }}
                  >
                    {[
                      "Mediterranean Sea",
                      "Black Sea",
                      "North Africa",
                      "West Africa",
                      "South America",
                    ].map((region, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "#0B5E8E",
                          backgroundColor: "rgba(11, 94, 142, 0.1)",
                          padding: "6px 12px",
                          borderRadius: "9999px",
                          border: "1px solid rgba(11, 94, 142, 0.2)",
                        }}
                      >
                        {region}
                      </div>
                    ))}
                  </div>

                  {/* Map-like Stage */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "200px",
                      borderRadius: "16px",
                      background: "linear-gradient(rgba(241, 245, 249, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, 0.5) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                      border: "1px solid rgba(226, 232, 240, 0.5)",
                      overflow: "hidden",
                    }}
                  >
                    {/* SVG Arc Overlay */}
                    <svg
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <path
                        ref={arcRef}
                        d="M 20 80 Q 120 20, 220 80 T 420 80"
                        stroke="rgba(11, 94, 142, 0.65)"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </svg>

                    {/* Dots positioned at different locations */}
                    <div
                      className="footprintDot"
                      style={{
                        position: "absolute",
                        top: "20%",
                        left: "15%",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#0B5E8E",
                        boxShadow: "0 0 0 3px rgba(11, 94, 142, 0.15)",
                      }}
                    />
                    <div
                      className="footprintDot"
                      style={{
                        position: "absolute",
                        top: "30%",
                        left: "35%",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#0B5E8E",
                        boxShadow: "0 0 0 3px rgba(11, 94, 142, 0.15)",
                      }}
                    />
                    <div
                      className="footprintDot"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "55%",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#0B5E8E",
                        boxShadow: "0 0 0 3px rgba(11, 94, 142, 0.15)",
                      }}
                    />
                    <div
                      className="footprintDot"
                      style={{
                        position: "absolute",
                        top: "65%",
                        left: "75%",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#0B5E8E",
                        boxShadow: "0 0 0 3px rgba(11, 94, 142, 0.15)",
                      }}
                    />
                    <div
                      className="footprintDot"
                      style={{
                        position: "absolute",
                        top: "75%",
                        left: "25%",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#0B5E8E",
                        boxShadow: "0 0 0 3px rgba(11, 94, 142, 0.15)",
                      }}
                    />
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
