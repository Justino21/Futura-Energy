'use client'

import { useEffect, useRef, useCallback } from 'react'

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
  }
}

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

export default function TurnstileCaptcha({ onVerify, onError, onExpire }: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey) {
      console.warn('Turnstile site key not configured')
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      theme: 'dark',
      size: 'normal',
    })
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    if (scriptLoadedRef.current) {
      renderWidget()
      return
    }

    const existingScript = document.querySelector('script[src*="turnstile"]')
    if (existingScript) {
      scriptLoadedRef.current = true
      if (window.turnstile) {
        renderWidget()
      } else {
        existingScript.addEventListener('load', renderWidget)
      }
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      scriptLoadedRef.current = true
      renderWidget()
    }
    document.head.appendChild(script)

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  return <div ref={containerRef} className="flex justify-center" />
}
