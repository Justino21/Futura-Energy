"use client"

import Link from "next/link"
import { Linkedin, Instagram, Facebook } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"
import { useLanguage } from "@/src/contexts/language-context"

export default function SiteFooter() {
  const { t } = useLanguage()
  
  return (
    <footer className="border-t-2 border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-8 lg:px-12 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-foreground">
                {t("footer.aboutUs")}
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                {t("footer.contact")}
              </Link>
              <Link href="/Futura_Energy_Privacy_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                {t("footer.privacy")}
              </Link>
              <Link href="/Futura_Energy_Cookie_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                {t("footer.cookies")}
              </Link>
              <Link href="/Futura_Energy_Terms_of_Use.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                {t("footer.terms")}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X"
              >
                <FaXTwitter className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
