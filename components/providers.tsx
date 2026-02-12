"use client"

import { LanguageProvider } from "@/src/contexts/language-context"
import LoadingWrapper from "@/components/loading-wrapper"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <LoadingWrapper>
        {children}
      </LoadingWrapper>
    </LanguageProvider>
  )
}

