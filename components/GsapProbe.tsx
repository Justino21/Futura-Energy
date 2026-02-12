"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function GsapProbe() {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    console.log("GSAP PROBE MOUNTED", gsap?.version);
    if (!boxRef.current) return;

    gsap.to(boxRef.current, {
      rotation: 360,
      duration: 2,
      repeat: -1,
      ease: "none",
      transformOrigin: "50% 50%",
    });
  }, []);

  return (
    <div style={{ height: "60vh", display: "grid", placeItems: "center", background: "#f1f5f9" }}>
      <div
        ref={boxRef}
        style={{ width: 120, height: 120, background: "#0B5E8E" }}
      />
    </div>
  );
}

