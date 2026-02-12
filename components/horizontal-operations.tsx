"use client"

import { useEffect, useRef, useState } from "react"
import ScrollReveal from "./scroll-reveal"

interface Operation {
  description: string
  type: string
}

interface HorizontalOperationsProps {
  operations: Operation[]
}

export default function HorizontalOperations({ operations }: HorizontalOperationsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current)
    }

    return () => {
      if (scrollContainerRef.current) {
        observer.unobserve(scrollContainerRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto pb-4 -mx-8 px-8"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#E5E7EB transparent",
      }}
    >
      <div className="flex gap-6 min-w-max">
        {operations.map((operation, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-[400px] transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="bg-white p-8 h-full border-l border-border/30">
              <div className="text-xs text-foreground/50 mb-4 uppercase tracking-wider font-medium">
                {operation.type}
              </div>
              <div className="text-lg text-foreground/80 leading-relaxed font-light">
                {operation.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

