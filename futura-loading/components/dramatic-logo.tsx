"use client"

export default function DramaticLogo() {
  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-10"
      style={{ perspective: "2000px" }}
    >
      <div
        className="animate-slow-3d-turn flex flex-col items-center gap-4"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="text-white text-[120px] font-bold tracking-[0.2em] flex items-center gap-4">
          <span
            style={{
              textShadow: "4px 4px 0 #1a1a1a, 8px 8px 0 #0a0a0a, 12px 12px 0 #000, 16px 16px 20px rgba(0,0,0,0.4)",
            }}
          >
            F
          </span>
          <span
            style={{
              textShadow: "4px 4px 0 #1a1a1a, 8px 8px 0 #0a0a0a, 12px 12px 0 #000, 16px 16px 20px rgba(0,0,0,0.4)",
            }}
          >
            U
          </span>
          <span
            style={{
              textShadow: "4px 4px 0 #1a1a1a, 8px 8px 0 #0a0a0a, 12px 12px 0 #000, 16px 16px 20px rgba(0,0,0,0.4)",
            }}
          >
            T
          </span>
          <span
            style={{
              textShadow: "4px 4px 0 #1a1a1a, 8px 8px 0 #0a0a0a, 12px 12px 0 #000, 16px 16px 20px rgba(0,0,0,0.4)",
            }}
          >
            U
          </span>
          <span
            style={{
              textShadow: "4px 4px 0 #1a1a1a, 8px 8px 0 #0a0a0a, 12px 12px 0 #000, 16px 16px 20px rgba(0,0,0,0.4)",
            }}
          >
            R
          </span>
          <span
            style={{
              textShadow: "4px 4px 0 #1a1a1a, 8px 8px 0 #0a0a0a, 12px 12px 0 #000, 16px 16px 20px rgba(0,0,0,0.4)",
            }}
          >
            A
          </span>
        </div>
        <div className="text-white text-[80px] font-light tracking-[0.5em] -mt-8">
          <span
            style={{
              textShadow: "3px 3px 0 #1a1a1a, 6px 6px 0 #0a0a0a, 9px 9px 0 #000, 12px 12px 15px rgba(0,0,0,0.4)",
            }}
          >
            E N E R G Y
          </span>
        </div>
      </div>
    </div>
  )
}
