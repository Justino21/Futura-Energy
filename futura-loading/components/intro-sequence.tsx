"use client"

import { useEffect, useState } from "react"
import FluidArtExperience from "./halftone-waves"
import Image from "next/image"

interface IntroSequenceProps {
  onComplete: () => void
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const particleCount = 100
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 1.5,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => {
      onComplete()
    }, 11000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 animate-particle-fade">
        <FluidArtExperience />
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-3 h-3 bg-blue-500/30 rounded-full animate-particle-dissolve"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${8 + particle.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="animate-logo-approach">
          <Image
            src="/futura-logo.png"
            alt="Futura Energy"
            width={800}
            height={400}
            className="w-auto h-auto max-w-[80vw] drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </div>
  )
}
