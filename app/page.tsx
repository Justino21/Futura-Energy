"use client"

import { useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import ScrollVideoExperience from "@/components/scroll-video-experience"

export default function HomePage() {
  useEffect(() => {
    document.body.classList.add("page-home")
    return () => document.body.classList.remove("page-home")
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="relative">
        <ScrollVideoExperience />
      </main>
      <SiteFooter />
    </>
  )
}
