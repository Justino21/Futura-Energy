"use client"

import { useEffect, useState } from "react"

interface SmoothImageRevealProps {
  scrollProgress: number
}

export default function SmoothImageReveal({ scrollProgress }: SmoothImageRevealProps) {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    // Curated, high-quality images in logical order
    const imageList = [
      '/hero/Hero1.jpg',
      '/hero/Hero2.jpg',
      '/trading-desk-financial-monitors-data.jpg',
      '/global-trading-desk-operations-room.jpg',
      '/large-oil-refinery-at-night-with-illuminated-proce.jpg',
      '/oil-refinery-processing-facility-night.jpg',
      '/oil-storage-terminal-industrial-facility.jpg',
      '/massive-oil-storage-tanks-at-industrial-terminal-f.jpg',
      '/oil-tanker-vessel-at-sea-maritime.jpg',
      '/crude-oil-tanker-vessel-maritime.jpg',
      '/massive-crude-oil-tanker-vessel-sailing-at-sea.jpg',
      '/large-cargo-ship-and-oil-tanker-at-industrial-port.jpg',
      '/world-map-with-glowing-connection-lines-showing-gl.jpg',
    ]

    setImages(imageList)
  }, [])

  // Simple, elegant easing
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

  if (images.length === 0) {
    return null
  }

  // Calculate which image should be visible
  const totalImages = images.length
  const imageIndex = Math.floor(scrollProgress * totalImages * 1.2) // Slight overlap
  const currentImageIndex = Math.min(imageIndex, totalImages - 1)
  
  // Calculate fade between current and next image
  const progressInImage = (scrollProgress * totalImages * 1.2) % 1
  const nextImageIndex = Math.min(currentImageIndex + 1, totalImages - 1)
  const isLastImage = currentImageIndex === totalImages - 1

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{
        zIndex: 0,
        backgroundColor: 'oklch(0.45 0.12 240)' // Brand blue
      }}
    >
      {/* Current image - always clear and visible */}
      {images.map((src, index) => {
        const isCurrent = index === currentImageIndex
        const isNext = index === nextImageIndex && !isLastImage
        
        let opacity = 0
        let scale = 1
        let blur = 0
        
        if (isCurrent) {
          // Current image: fully visible, clear
          opacity = isLastImage ? 1 : 1 - (progressInImage * 0.3) // Slight fade as next appears
          scale = 1
          blur = 0
        } else if (isNext) {
          // Next image: fading in smoothly
          const fadeIn = easeOut(progressInImage)
          opacity = fadeIn * 0.7 // Start appearing
          scale = 1 + (1 - fadeIn) * 0.02 // Slight scale
          blur = (1 - fadeIn) * 3 // Minimal blur
        }
        
        return (
          <div
            key={`${src}-${index}`}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: opacity,
              transform: `scale(${scale})`,
              filter: `blur(${blur}px)`,
              transition: 'opacity 1.5s ease-out, transform 1.5s ease-out, filter 1.5s ease-out',
              willChange: 'opacity, transform, filter',
              zIndex: index,
              pointerEvents: 'none'
            }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )
      })}
      
      {/* Subtle overlay that fades away */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundColor: 'rgba(11, 31, 51, 0.25)',
          opacity: Math.max(0, 1 - scrollProgress * 1.5),
          transition: 'opacity 1s ease-out',
          zIndex: images.length + 1,
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
