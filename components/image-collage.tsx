"use client"

import { useEffect, useState } from "react"

interface ImageCollageProps {
  scrollProgress: number
  backgroundOpacity: number // Pass the blue background opacity to sync timing
}

export default function ImageCollage({ scrollProgress, backgroundOpacity }: ImageCollageProps) {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    // All available images for the collage
    const imageList = [
      // Hero images
      '/hero/Hero1.jpg',
      '/hero/Hero2.jpg',
      '/hero/Hero3.jpg',
      '/hero/Hero4.jpg',
      '/hero/Hero-replace.jpg',
      '/hero/Hero-4.1.jpg',
      // Trading & Operations
      '/trading-desk-financial-monitors-data.jpg',
      '/global-trading-desk-operations-room.jpg',
      '/professional-trading-desk-with-multiple-screens-sh.jpg',
      '/financial-trading-screens-and-risk-management-dash.jpg',
      '/financial-data-risk-management-screens.jpg',
      '/financial-risk-management-data-analytics-screens.jpg',
      // Refineries & Facilities
      '/large-oil-refinery-at-night-with-illuminated-proce.jpg',
      '/oil-refinery-processing-facility-night.jpg',
      '/modern-oil-refinery-at-sunset-with-industrial-infr.jpg',
      // Storage & Terminals
      '/oil-storage-terminal-industrial-facility.jpg',
      '/massive-oil-storage-tanks-at-industrial-terminal-f.jpg',
      '/petroleum-storage-tanks-industrial-facility.jpg',
      '/industrial-storage-tanks-petroleum-facility.jpg',
      '/home-logistics-storage.jpg',
      // Maritime & Shipping
      '/oil-tanker-vessel-at-sea-maritime.jpg',
      '/crude-oil-tanker-vessel-maritime.jpg',
      '/massive-crude-oil-tanker-vessel-sailing-at-sea.jpg',
      '/massive-oil-tanker-vessel-at-industrial-port-durin.jpg',
      '/oil-tanker-at-port-industrial-maritime.jpg',
      '/cargo-ship-vessel-maritime-logistics.jpg',
      '/large-cargo-ship-and-oil-tanker-at-industrial-port.jpg',
      '/cinematic-aerial-view-of-oil-tankers-at-industrial.jpg',
      // Maps & Global
      '/world-map-with-glowing-connection-lines-showing-gl.jpg',
      '/world-map-with-shipping-routes-and-trade-connectio.jpg',
    ]

    // Shuffle for randomness
    const shuffled = [...imageList]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    // Repeat to get exactly 50 images
    const repeated = []
    while (repeated.length < 50) {
      repeated.push(...shuffled)
    }
    
    setImages(repeated.slice(0, 50))
  }, [])

  // Calculate opacity for each image based on scroll progress
  // Images fade in/out as you scroll through them
  const getImageOpacity = (index: number, total: number) => {
    // Map scroll progress (0-1) to image index (0-49)
    const currentImageIndex = scrollProgress * total
    const distance = Math.abs(index - currentImageIndex)
    
    // Each image is visible for a range, with smooth fade
    if (distance < 2.5) {
      const baseOpacity = Math.max(0, 1 - distance / 2.5)
      return baseOpacity * 0.3 // Subtle - 30% max opacity
    }
    return 0
  }

  // Calculate subtle scale for depth effect - more refined
  const getImageScale = (index: number, total: number) => {
    const currentImageIndex = scrollProgress * total
    const distance = Math.abs(index - currentImageIndex)
    
    if (distance < 2.5) {
      return 1 + (1 - Math.min(distance / 2.5, 1)) * 0.05 // Even more subtle scale
    }
    return 1
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{
        height: '140vh', // 2 hero sections
      }}
    >
      {/* Dynamic grid collage - 7x7 grid = 49 images, plus 1 extra */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(7, 1fr)',
          gap: '3px',
          padding: '3px',
        }}
      >
        {images.slice(0, 49).map((src, index) => {
          const opacity = getImageOpacity(index, images.length)
          const scale = getImageScale(index, images.length)
          
          return (
            <div
              key={`${src}-${index}`}
              className="relative overflow-hidden bg-black/40"
              style={{
                opacity: opacity,
                transform: `scale(${scale})`,
                transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'opacity, transform',
              }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  filter: 'grayscale(30%) brightness(0.7) contrast(1.2)',
                }}
                loading="lazy"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
