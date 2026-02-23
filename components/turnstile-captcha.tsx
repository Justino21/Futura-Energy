'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function TurnstileCaptcha({ onVerify, onError, onExpire }: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!SITE_KEY) {
      console.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured')
      setIsLoading(false)
      return
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return
      if (widgetIdRef.current) return

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => {
            onVerify(token)
          },
          'error-callback': () => {
            onError?.()
          },
          'expired-callback': () => {
            onExpire?.()
          },
          theme: 'dark',
          size: 'normal',
        })
        setIsLoading(false)
      } catch (err) {
        console.error('Turnstile render error:', err)
        setIsLoading(false)
      }
    }

    if (window.turnstile) {
      renderWidget()
      return
    }

    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')
    if (existingScript) {
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile)
          renderWidget()
        }
      }, 100)
      setTimeout(() => clearInterval(checkTurnstile), 10000)
      return () => clearInterval(checkTurnstile)
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => {
      const checkReady = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkReady)
          renderWidget()
        }
      }, 50)
      setTimeout(() => clearInterval(checkReady), 5000)
    }
    script.onerror = () => {
      console.error('Failed to load Turnstile script')
      setIsLoading(false)
    }
    document.head.appendChild(script)

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
        widgetIdRef.current = null
      }
    }
  }, [onVerify, onError, onExpire])

  if (!SITE_KEY) {
    return (
      <div className="text-center text-yellow-400 text-sm py-2">
        CAPTCHA not configured
      </div>
    )
  }

  return (
    <div className="flex justify-center min-h-[65px]">
      {isLoading && (
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
          Loading verification...
        </div>
      )}
      <div ref={containerRef} className={isLoading ? 'hidden' : ''} />
    </div>
  )
}
