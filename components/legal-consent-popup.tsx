"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/src/contexts/language-context"

const STORAGE_KEY = "futura-legal-consent"

export default function LegalConsentPopup() {
  const { t } = useLanguage()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const accepted = localStorage.getItem(STORAGE_KEY)
    if (accepted !== "true") setShow(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-consent-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#0c0c0c] shadow-2xl p-6 md:p-8">
        <h2
          id="legal-consent-title"
          className="text-lg md:text-xl font-medium text-white mb-4"
          style={{ fontFamily: "var(--font-serif), serif" }}
        >
          {t("legalConsent.title")}
        </h2>
        <p className="text-sm text-white/80 leading-relaxed mb-5">
          {t("legalConsent.message")}{" "}
          <a
            href="/Futura_Energy_Terms_of_Use.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6ba3e8] hover:text-[#8bbcf0] underline transition-colors"
          >
            {t("footer.terms")}
          </a>
          {", "}
          <a
            href="/Futura_Energy_Privacy_Policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6ba3e8] hover:text-[#8bbcf0] underline transition-colors"
          >
            {t("footer.privacy")}
          </a>
          {" "}{t("legalConsent.and")}{" "}
          <a
            href="/Futura_Energy_Cookie_Policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6ba3e8] hover:text-[#8bbcf0] underline transition-colors"
          >
            {t("footer.cookies")}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#3d7dd4] hover:bg-[#4a8fe8] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d7dd4] focus:ring-offset-2 focus:ring-offset-[#0c0c0c]"
        >
          {t("legalConsent.agree")}
        </button>
      </div>
    </div>
  )
}
