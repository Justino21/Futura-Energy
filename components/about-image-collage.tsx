"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function AboutImageCollage() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    // Curated industry-related images - expanded list to ensure full coverage
    const imageList = [
      '/large-oil-refinery-at-night-with-illuminated-proce.jpg',
      '/oil-refinery-processing-facility-night.jpg',
      '/modern-oil-refinery-at-sunset-with-industrial-infr.jpg',
      '/oil-storage-terminal-industrial-facility.jpg',
      '/massive-oil-storage-tanks-at-industrial-terminal-f.jpg',
      '/petroleum-storage-tanks-industrial-facility.jpg',
      '/industrial-storage-tanks-petroleum-facility.jpg',
      '/home-logistics-storage.jpg',
      '/oil-tanker-vessel-at-sea-maritime.jpg',
      '/crude-oil-tanker-vessel-maritime.jpg',
      '/massive-crude-oil-tanker-vessel-sailing-at-sea.jpg',
      '/large-cargo-ship-and-oil-tanker-at-industrial-port.jpg',
      '/cinematic-aerial-view-of-oil-tankers-at-industrial.jpg',
      '/cargo-ship-vessel-maritime-logistics.jpg',
      '/oil-tanker-at-port-industrial-maritime.jpg',
      '/massive-oil-tanker-vessel-at-industrial-port-durin.jpg',
      '/trading-desk-financial-monitors-data.jpg',
      '/global-trading-desk-operations-room.jpg',
      '/professional-trading-desk-with-multiple-screens-sh.jpg',
      '/financial-trading-screens-and-risk-management-dash.jpg',
      '/financial-data-risk-management-screens.jpg',
      '/financial-risk-management-data-analytics-screens.jpg',
      '/hero/Hero1.jpg',
      '/hero/Hero2.jpg',
      '/hero/Hero3.jpg',
      '/hero/Hero4.jpg',
      '/hero/Hero-replace.jpg',
      '/hero/Hero-4.1.jpg',
    ]

    setImages(imageList)
  }, [])

  if (images.length === 0) {
    return null
  }

  return (
    <div className="w-screen overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="flex h-[250px]">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="flex-shrink-0 relative"
            style={{
              width: `${100 / images.length}%`,
              minWidth: `${100 / images.length}%`,
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              priority={index < 5}
            />
            {/* Subtle divider between images */}
            {index < images.length - 1 && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-black/10 z-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

