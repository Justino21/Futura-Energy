"use client"

interface FuturisticSceneProps {
  scrollProgress: number
}

export default function FuturisticScene({ scrollProgress }: FuturisticSceneProps) {
  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{
        zIndex: 99998,
        background: 'radial-gradient(ellipse at center, oklch(0.12 0.12 240) 0%, oklch(0.08 0.08 240) 100%)',
        pointerEvents: 'none'
      }}
    >
      {/* Dark background - particles will form white circle on top */}
    </div>
  )
}
