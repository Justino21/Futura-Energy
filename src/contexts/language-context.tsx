"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { LanguageCode } from "@/src/translations"

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en")

  useEffect(() => {
    // Load saved language from localStorage (only on client)
    if (typeof window === "undefined") return
    
    const saved = localStorage.getItem("futura-language") as LanguageCode
    const availableLanguages = ["en", "es", "de", "fr"] as const
    if (saved && availableLanguages.includes(saved as any)) {
      setLanguageState(saved)
      if (typeof document !== "undefined") {
        document.documentElement.lang = saved
        document.documentElement.dir = ["ar", "he"].includes(saved) ? "rtl" : "ltr"
      }
    }
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("futura-language", lang)
    }
    // Update HTML lang attribute and direction
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
      document.documentElement.dir = ["ar", "he"].includes(lang) ? "rtl" : "ltr"
    }
  }

  const t = (key: string): string => {
    const { getTranslation } = require("@/src/translations")
    return getTranslation(language, key)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
