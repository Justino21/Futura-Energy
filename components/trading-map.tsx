"use client"

import { useEffect, useRef, useState } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { geoMercator } from "d3-geo"

interface TradingMapProps {
  regions: string[]
}

export default function TradingMap({ regions }: TradingMapProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Region coordinates for highlighting
  const regionCoords: Record<string, [number, number]> = {
    "Mediterranean Sea": [20, 38],
    "Black Sea": [35, 43],
    "North Africa": [5, 30],
    "West Africa": [-10, 10],
    "South America": [-60, -15],
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          
          // Sequentially highlight regions with longer pauses
          regions.forEach((region, index) => {
            setTimeout(() => {
              setHighlightedRegion(region)
              setTimeout(() => {
                if (index === regions.length - 1) {
                  // Keep last region highlighted briefly, then fade all
                  setTimeout(() => {
                    setHighlightedRegion(null)
                  }, 1000)
                }
              }, 1000)
            }, index * 800)
          })
        }
      },
      { threshold: 0.15 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [regions])

  return (
    <div ref={ref} className="w-full h-[400px] relative bg-white">
      {/* Loading Animation */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-foreground/60">Loading world map...</p>
          </div>
        </div>
      )}
      
      <div
        className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
        }`}
      >
        <ComposableMap
          projection={geoMercator()}
          projectionConfig={{
            scale: 120,
            center: [20, 30],
          }}
          className="w-full h-full"
        >
          <Geographies
            geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
          >
            {({ geographies }) => {
              // Mark as loaded when geographies are available
              if (geographies.length > 0 && isLoading) {
                setTimeout(() => setIsLoading(false), 100)
              }
              
              return geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#F3F4F6"
                  stroke="#E5E7EB"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }}
          </Geographies>
          
          {/* Highlight regions with subtle markers */}
          {regions.map((region) => {
            const coords = regionCoords[region]
            if (!coords) return null
            
            return (
              <Marker key={region} coordinates={coords}>
                <circle
                  r={highlightedRegion === region ? 10 : 4}
                  fill="#0B1F33"
                  opacity={highlightedRegion === region ? 0.7 : 0.25}
                  style={{
                    transition: "all 0.8s ease-out",
                  }}
                />
              </Marker>
            )
          })}
        </ComposableMap>
      </div>
    </div>
  )
}

