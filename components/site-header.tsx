"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Globe, Menu, X } from "lucide-react"
import { useLanguage } from "@/src/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "trading", href: "/trading" },
  { key: "logistics", href: "/logistics" },
  { key: "compliance", href: "/compliance" },
  { key: "global", href: "/global" },
  { key: "contact", href: "/contact" },
]

// Available languages: English, Spanish, German, French
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any)
  }

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY
      document.body.classList.add("mobile-menu-open")
      document.documentElement.classList.add("mobile-menu-open")
      document.body.style.top = `-${scrollY}px`
    } else {
      const scrollY = document.body.style.top ? Math.abs(parseInt(document.body.style.top, 10)) : 0
      document.body.classList.remove("mobile-menu-open")
      document.documentElement.classList.remove("mobile-menu-open")
      document.body.style.top = ""
      window.scrollTo(0, scrollY)
    }
    return () => {
      document.body.classList.remove("mobile-menu-open")
      document.documentElement.classList.remove("mobile-menu-open")
      document.body.style.top = ""
    }
  }, [mobileMenuOpen])

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        pathname === "/" && "site-header-home"
      )}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(2px) saturate(100%)',
        WebkitBackdropFilter: 'blur(2px) saturate(100%)',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
        <Link href="/" className="flex items-center h-full">
          <img
            src="/Futura_Ultimate.png"
            alt="Futura Energy"
            className="h-14 w-auto max-w-[100px] object-contain"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src.endsWith('Futura_Ultimate.png')) {
                el.src = '/futura-logo.png';
              }
            }}
          />
        </Link>

        {/* Desktop nav – unchanged, hidden on mobile via md:flex */}
        <div className="hidden md:flex items-center gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "text-sm font-normal relative pb-1 transition-colors group",
                pathname === item.href
                  ? "text-white"
                  : "text-white/90 hover:text-white",
              )}
            >
              {t(`nav.${item.key}`)}
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-300 ease-out",
                  pathname === item.href
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                )}
              />
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white/90 hover:text-white transition-colors p-1">
                <Globe className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>{t("language.select")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={language === lang.code ? "bg-secondary" : ""}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: hamburger – visible only below 768px */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden text-white/90 hover:text-white transition-colors p-2 -mr-2"
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu: portal to body so z-index is above home page fixed content */}
      {mounted &&
        createPortal(
          <div
            className={cn(
              "md:hidden fixed top-0 left-0 right-0 bottom-0 z-[1100] flex flex-col bg-black transition-transform duration-300 ease-out",
              mobileMenuOpen ? "translate-y-0 pointer-events-auto" : "-translate-y-full pointer-events-none"
            )}
            style={{ minHeight: "100vh", minHeight: "100dvh" }}
            aria-hidden={!mobileMenuOpen}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute top-0 right-0 z-10 p-3 mr-2 mt-1 text-white/90 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col flex-1 min-h-0 overflow-auto pt-[4.5rem] pb-10 px-5">
              <div className="flex justify-center mb-10 shrink-0">
                <img
                src="/Futura_Ultimate.png"
                alt="Futura Energy"
                className="h-10 w-auto max-w-[80px] object-contain"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src.endsWith('Futura_Ultimate.png')) {
                    el.src = '/futura-logo.png';
                  }
                }}
              />
              </div>
              <nav className="flex flex-col gap-0.5 shrink-0">
                {navigationItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "py-3.5 px-4 text-[15px] font-medium rounded-md transition-colors text-white",
                      pathname === item.href ? "bg-white/15" : "hover:bg-white/10 active:bg-white/15"
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 pt-5 border-t border-white/25 shrink-0">
                <p className="text-white/70 text-[13px] font-medium mb-2.5 px-4">{t("language.select")}</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "py-2 px-3.5 text-[13px] rounded-md transition-colors text-white",
                        language === lang.code ? "bg-white/25" : "bg-white/10 hover:bg-white/15"
                      )}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  )
}
