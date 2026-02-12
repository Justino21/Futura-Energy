"use client"

import { useEffect, useState, useRef } from "react"

interface CountUpNumberProps {
  value: string
  duration?: number
  prefix?: string
  suffix?: string
}

export default function CountUpNumber({ value, duration = 2000, prefix = "", suffix = "" }: CountUpNumberProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Extract numeric value and unit
  const parseValue = (val: string): { number: number; unit: string } => {
    // Handle different formats: "350 KT", "2–3m BBLs", etc.
    const match = val.match(/([\d.–]+)\s*(.*)/)
    if (match) {
      const numStr = match[1]
      const unit = match[2] || ""
      
      // Handle ranges like "2–3"
      if (numStr.includes("–")) {
        return { number: parseFloat(numStr.split("–")[0]), unit: val }
      }
      
      // Handle "m" for millions
      if (numStr.includes("m")) {
        const num = parseFloat(numStr.replace("m", "")) * 1000000
        return { number: num, unit: unit }
      }
      
      return { number: parseFloat(numStr), unit: unit }
    }
    return { number: 0, unit: val }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const { number, unit } = parseValue(value)
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (number - startValue) * eased
      
      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(number)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration])

  const { number, unit } = parseValue(value)
  const displayValue = isVisible ? count : 0

  // Format the number
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K"
    }
    return Math.round(num).toString()
  }

  // If original value contains range or special format, preserve it (no animation)
  if (value.includes("–") || value.includes("m BBLs") || value.includes("BBLs")) {
    return (
      <span 
        ref={ref}
        className={`transition-opacity duration-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {prefix}{value}{suffix}
      </span>
    )
  }

  return (
    <span ref={ref}>
      {prefix}{formatNumber(displayValue)} {unit}{suffix}
    </span>
  )
}

