"use client"

import { useEffect, useRef, useState } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { geoMercator } from "d3-geo"

export function WorldMap() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
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
  }, [])

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
        </ComposableMap>
      </div>
    </div>
  )
}
