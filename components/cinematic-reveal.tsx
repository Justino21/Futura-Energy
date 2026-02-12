"use client"

import { useEffect, useRef } from "react"

interface CinematicRevealProps {
  scrollProgress: number
}

export default function CinematicReveal({ scrollProgress }: CinematicRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate morphing values based on scroll
  const getMorphValue = (offset: number) => {
    return Math.sin(scrollProgress * Math.PI * 2 + offset) * 0.5 + 0.5
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{
        zIndex: 0,
        background: 'linear-gradient(135deg, oklch(0.45 0.12 240) 0%, oklch(0.35 0.15 240) 50%, oklch(0.25 0.12 240) 100%)',
        opacity: 1 - scrollProgress * 0.9
      }}
    >
      {/* Layered geometric shapes representing energy flows */}
      {[...Array(5)].map((_, i) => {
        const size = 400 + i * 150
        const rotation = scrollProgress * 360 + i * 45
        const morph = getMorphValue(i * 0.5)
        const scale = 0.8 + morph * 0.4
        const opacity = (1 - scrollProgress) * (0.15 - i * 0.02)
        
        return (
          <div
            key={i}
            className="absolute"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              opacity: opacity,
              willChange: 'transform, opacity',
              transition: 'opacity 0.3s ease-out',
              pointerEvents: 'none'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(100, 150, 255, 0.3)" />
                  <stop offset="50%" stopColor="rgba(150, 200, 255, 0.2)" />
                  <stop offset="100%" stopColor="rgba(100, 150, 255, 0.1)" />
                </linearGradient>
              </defs>
              <path
                d={`M 100,20 
                    Q ${120 + morph * 20},${60 + morph * 10} ${100 + morph * 30},100
                    Q ${80 - morph * 20},${140 - morph * 10} 100,180
                    Q ${120 - morph * 20},${140 + morph * 10} ${100 - morph * 30},100
                    Q ${80 + morph * 20},${60 - morph * 10} 100,20 Z`}
                fill={`url(#gradient-${i})`}
                stroke="rgba(150, 200, 255, 0.2)"
                strokeWidth="1"
              />
            </svg>
          </div>
        )
      })}

      {/* Energy flow lines - elegant connections */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const distance = 200 + scrollProgress * 300
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        const opacity = (1 - scrollProgress) * 0.3
        
        return (
          <div
            key={`line-${i}`}
            className="absolute"
            style={{
              width: '2px',
              height: `${100 + scrollProgress * 200}px`,
              top: '50%',
              left: '50%',
              transformOrigin: 'top center',
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle * 180 / Math.PI}deg)`,
              background: `linear-gradient(to bottom, rgba(150, 200, 255, ${opacity}), transparent)`,
              opacity: opacity,
              willChange: 'transform, opacity',
              transition: 'opacity 0.3s ease-out',
              pointerEvents: 'none'
            }}
          />
        )
      })}

      {/* Central energy core - pulsing effect */}
      <div
        className="absolute"
        style={{
          width: '300px',
          height: '300px',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${1 - scrollProgress * 0.5})`,
          opacity: (1 - scrollProgress) * 0.4,
          willChange: 'transform, opacity',
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          pointerEvents: 'none'
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(150, 200, 255, 0.3) 0%, transparent 70%)',
            boxShadow: '0 0 100px rgba(150, 200, 255, 0.2)',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        />
      </div>

      {/* Depth layers with parallax */}
      {[...Array(3)].map((_, i) => {
        const parallax = (1 - scrollProgress) * (i + 1) * 50
        const scale = 1 + (1 - scrollProgress) * (i + 1) * 0.1
        const opacity = (1 - scrollProgress) * 0.1
        
        return (
          <div
            key={`depth-${i}`}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${50 + i * 10}% ${50 + i * 10}%, rgba(100, 150, 255, ${opacity}), transparent)`,
              transform: `translateY(${parallax}px) scale(${scale})`,
              willChange: 'transform, opacity',
              transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
              pointerEvents: 'none'
            }}
          />
        )
      })}
    </div>
  )
}
