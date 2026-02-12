"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ScrollCountUpProps {
  value: number
  scrollProgress: number // 0 to 1
  startProgress?: number // When to start counting (default 0.4)
  endProgress?: number // When to finish counting (default 0.8)
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  label?: string
  labelClassName?: string
  forceVisible?: boolean // If true, always stay visible regardless of scroll progress
}

export default function ScrollCountUp({
  value,
  scrollProgress,
  startProgress = 0.4,
  endProgress = 0.8,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  label = "",
  labelClassName = "",
  forceVisible = false,
}: ScrollCountUpProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    // Calculate progress within the countup range
    if (scrollProgress < startProgress) {
      setDisplayValue(0)
      return
    }
    
    if (scrollProgress >= endProgress) {
      setDisplayValue(value)
      return
    }

    // Map scroll progress to countup progress (0 to 1)
    const countupProgress = (scrollProgress - startProgress) / (endProgress - startProgress)
    
    // Apply easing for smooth animation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easedProgress = easeOutCubic(countupProgress)
    
    // Calculate current value
    const currentValue = value * easedProgress
    setDisplayValue(currentValue)
  }, [scrollProgress, value, startProgress, endProgress])

  // Format the number
  const formatNumber = (num: number): string => {
    if (decimals === 0) {
      return Math.round(num).toLocaleString()
    }
    return num.toFixed(decimals).toLocaleString()
  }

  // Calculate label opacity - fades in as counting starts
  const labelFadeStart = startProgress
  const labelFadeEnd = startProgress + 0.1 // Fade in over first 10% of countup
  const labelOpacity = scrollProgress < labelFadeStart 
    ? 0 
    : scrollProgress >= labelFadeEnd 
    ? 1 
    : (scrollProgress - labelFadeStart) / (labelFadeEnd - labelFadeStart)

  return (
    <div className="text-center">
      <motion.div
        className={className}
        style={{
          letterSpacing: '0.05em',
          // Force opacity to 1 if forceVisible is true, overriding any animation
          opacity: forceVisible ? 1 : undefined,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: forceVisible ? 1 : (scrollProgress >= startProgress ? 1 : 0),
          scale: forceVisible ? 1 : (scrollProgress >= startProgress ? 1 : 0.8),
        }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-white" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.55)' }}>
          {prefix}
          {formatNumber(displayValue)}
          {suffix}
        </span>
      </motion.div>
      {label && (
        <motion.div
          className={labelClassName}
          style={{
            opacity: labelOpacity,
          }}
          transition={{ duration: 0.5 }}
        >
          {label}
        </motion.div>
      )}
    </div>
  )
}

