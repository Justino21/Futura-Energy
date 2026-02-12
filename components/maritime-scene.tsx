"use client"

import { useEffect, useRef } from "react"

interface MaritimeSceneProps {
  scrollProgress: number
}

export default function MaritimeScene({ scrollProgress }: MaritimeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{
        zIndex: 0,
        background: 'linear-gradient(180deg, oklch(0.35 0.15 240) 0%, oklch(0.45 0.12 240) 50%, oklch(0.25 0.12 240) 100%)',
        opacity: 1 - scrollProgress * 0.9
      }}
    >
      {/* Animated ocean waves */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '40%',
          background: 'linear-gradient(180deg, transparent, oklch(0.3 0.1 240) 30%, oklch(0.25 0.08 240) 100%)',
          opacity: 1 - scrollProgress * 0.8
        }}
      >
        {/* Wave layers */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`wave-${i}`}
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${30 + i * 10}%`,
              background: `url("data:image/svg+xml,%3Csvg width='1200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,100 Q300,${50 + i * 20} 600,100 T1200,100 L1200,200 L0,200 Z' fill='oklch(0.${25 + i * 5} 0.${8 + i * 2} 240)'/%3E%3C/svg%3E")`,
              backgroundSize: '1200px 200px',
              backgroundRepeat: 'repeat-x',
              animation: `wave-animation ${8 + i * 2}s linear infinite`,
              opacity: 0.6 - i * 0.1,
              willChange: 'transform'
            }}
          />
        ))}
      </div>

      {/* Animated cargo ships/oil tankers */}
      {[
        { src: '/oil-tanker-vessel-at-sea-maritime.jpg', delay: 0, speed: 25, size: 'large' },
        { src: '/crude-oil-tanker-vessel-maritime.jpg', delay: 3, speed: 30, size: 'medium' },
        { src: '/massive-crude-oil-tanker-vessel-sailing-at-sea.jpg', delay: 6, speed: 20, size: 'large' },
        { src: '/large-cargo-ship-and-oil-tanker-at-industrial-port.jpg', delay: 9, speed: 28, size: 'medium' },
      ].map((ship, index) => (
        <div
          key={`ship-${index}`}
          className="absolute"
          style={{
            bottom: `${15 + index * 8}%`,
            left: '-400px',
            width: ship.size === 'large' ? '500px' : '350px',
            height: ship.size === 'large' ? '200px' : '140px',
            animation: `ship-sail-${index} ${ship.speed}s linear infinite`,
            animationDelay: `${ship.delay}s`,
            opacity: (1 - scrollProgress) * 0.9,
            willChange: 'transform',
            pointerEvents: 'none'
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              backgroundImage: `url(${ship.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '8px',
              boxShadow: `
                0 10px 40px rgba(0, 0, 0, 0.4),
                0 0 60px rgba(100, 150, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              transform: 'perspective(1000px) rotateY(-5deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Ship glow effect */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(150, 200, 255, 0.2), transparent)',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      ))}

      {/* Industrial port/cranes in background */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '30%',
          backgroundImage: 'url(/large-cargo-ship-and-oil-tanker-at-industrial-port.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: (1 - scrollProgress) * 0.3,
          filter: 'brightness(0.4) contrast(1.2)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
        }}
      />

      {/* Atmospheric particles - sea spray, mist */}
      {[...Array(50)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            bottom: `${Math.random() * 40}%`,
            left: `${Math.random() * 100}%`,
            background: 'rgba(200, 220, 255, 0.6)',
            animation: `particle-float ${10 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: (1 - scrollProgress) * (0.3 + Math.random() * 0.3),
            willChange: 'transform',
            pointerEvents: 'none',
            boxShadow: '0 0 6px rgba(200, 220, 255, 0.8)'
          }}
        />
      ))}

      {/* Sun/moon in sky */}
      <div
        className="absolute"
        style={{
          top: '15%',
          right: '15%',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255, 220, 150, 0.4), rgba(255, 200, 100, 0.2), transparent)',
          borderRadius: '50%',
          opacity: (1 - scrollProgress) * 0.6,
          filter: 'blur(20px)',
          animation: 'sun-glow 4s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

