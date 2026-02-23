"use client"

import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { motion } from "framer-motion"
import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, Search } from "lucide-react"
import { useLanguage } from "@/src/contexts/language-context"
import { PHONE_PREFIX_OPTIONS } from "@/src/data/country-calling-codes"
import TurnstileCaptcha from "@/components/turnstile-captcha"

const DEPARTMENT_OPTIONS = [
  { value: "trading@futuranrg.com", labelKey: "contactPage.deptTradingDesk" },
  { value: "operations@futuranrg.com", labelKey: "contactPage.deptOperationsLogistics" },
  { value: "legal@futuranrg.com", labelKey: "contactPage.deptLegalCorporate" },
  { value: "KYC@futuranrg.com", labelKey: "contactPage.deptComplianceKyc" },
] as const

export default function ContactPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    department: "trading@futuranrg.com",
    name: "",
    surname: "",
    email: "",
    phonePrefix: "+971",
    phone: "",
    message: "",
  })
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; surname?: boolean; email?: boolean; terms?: boolean; captcha?: boolean }>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>("")
  const [departmentOpen, setDepartmentOpen] = useState(false)
  const [phonePrefixOpen, setPhonePrefixOpen] = useState(false)
  const [phonePrefixSearch, setPhonePrefixSearch] = useState("")
  const departmentRef = useRef<HTMLDivElement>(null)
  const phonePrefixRef = useRef<HTMLDivElement>(null)
  const phoneSearchInputRef = useRef<HTMLInputElement>(null)
  const phoneListScrollRef = useRef<HTMLDivElement>(null)

  const getCountryLabel = (opt: (typeof PHONE_PREFIX_OPTIONS)[number]) => {
    const translated = t(`contactPage.countries.${opt.iso}`)
    return translated && !translated.startsWith("contactPage.") ? translated : opt.label
  }

  const searchTrimmed = phonePrefixSearch.trim()
  const q = searchTrimmed.toLowerCase()
  const digitsOnly = searchTrimmed.replace(/\D/g, "")
  const phonePrefixFiltered =
    searchTrimmed === ""
      ? PHONE_PREFIX_OPTIONS
      : PHONE_PREFIX_OPTIONS.filter((opt) => {
          const label = getCountryLabel(opt)
          const nameMatch =
            label.toLowerCase().includes(q) || opt.label.toLowerCase().includes(q)
          const codeMatch =
            digitsOnly.length > 0 &&
            opt.value.replace(/\D/g, "").startsWith(digitsOnly)
          return nameMatch || codeMatch
        })

  useEffect(() => {
    if (phoneListScrollRef.current) phoneListScrollRef.current.scrollTop = 0
  }, [phonePrefixSearch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (departmentRef.current && !departmentRef.current.contains(e.target as Node)) {
        setDepartmentOpen(false)
      }
      if (phonePrefixRef.current && !phonePrefixRef.current.contains(e.target as Node)) {
        setPhonePrefixOpen(false)
        setPhonePrefixSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token)
    setFieldErrors((prev) => ({ ...prev, captcha: false }))
  }, [])

  const handleCaptchaError = useCallback(() => {
    setCaptchaToken(null)
  }, [])

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nameEmpty = !formData.name.trim()
    const surnameEmpty = !formData.surname.trim()
    const emailEmpty = !formData.email.trim()
    const termsMissing = !acceptedTerms
    const captchaMissing = !captchaToken
    const hasErrors = nameEmpty || surnameEmpty || emailEmpty || termsMissing || captchaMissing
    setFieldErrors({
      name: nameEmpty,
      surname: surnameEmpty,
      email: emailEmpty,
      terms: termsMissing,
      captcha: captchaMissing,
    })
    if (hasErrors) return

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setSubmitErrorMessage("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: [formData.phonePrefix, formData.phone].filter(Boolean).join(" ").trim() || undefined,
          captchaToken,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitErrorMessage(typeof data?.error === "string" ? data.error : "Failed to send")
        setSubmitStatus("error")
        return
      }
      setSubmitStatus("success")
      setFormData({
        department: formData.department,
        name: "",
        surname: "",
        email: "",
        phonePrefix: formData.phonePrefix,
        phone: "",
        message: "",
      })
    } catch (e) {
      setSubmitStatus("error")
      setSubmitErrorMessage(e instanceof Error ? e.message : "Failed to send")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputBase = "w-full bg-white/5 border px-3 py-2.5 md:py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 rounded transition-colors"
  const inputValid = "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/30"
  const inputInvalid = "border-red-500 focus:border-red-500 focus:ring-red-500/50"
  const inputClass = (field: "name" | "surname" | "email") =>
    `${inputBase} ${fieldErrors[field] ? inputInvalid : inputValid}`

  return (
    <>
      <SiteHeader />

      <main
        className="relative flex flex-col"
        style={{ backgroundColor: "#000000", minHeight: "100vh" }}
      >
        <section className="flex-1 flex flex-col justify-center pt-20 pb-24 md:pb-6 px-8 md:px-12">
          <div className="mx-auto w-full max-w-lg md:max-w-5xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 md:mb-10"
              style={{
                fontFamily: "var(--font-serif), serif",
                color: "#ffffff",
                fontWeight: 400,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                lineHeight: "1.2",
                letterSpacing: "-0.02em",
              }}
            >
              {t("contactPage.pageTitle")}
            </motion.h1>

            {/* Desktop: left = office info card, right = form card. Mobile: stacked. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 md:items-stretch">
              {/* Left: Office Headquarters + General Inquiries – card on desktop, same blue borders. */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="mb-6 md:mb-0 md:rounded-xl md:border md:border-white/10 md:bg-gradient-to-br md:from-white/5 md:to-white/0 md:p-6 md:pr-8 md:hover:border-blue-500/40 md:transition-all md:duration-300"
              >
                <div className="pl-4 border-l-2 border-blue-500/50 md:pl-5">
                  <h2
                    className="text-white font-medium mb-1 md:mb-1.5 md:text-base"
                    style={{ fontFamily: "var(--font-sans), sans-serif" }}
                  >
                    {t("contactPage.officeHeadquarters")}
                  </h2>
                  <p className="text-white/85 text-sm leading-relaxed md:text-[0.9375rem]">
                    {t("contactPage.companyNameDMCC")}
                    <br />
                    {t("contactPage.addressUnit")}
                    <br />
                    {t("contactPage.addressPlot")}
                    <br />
                    {t("contactPage.addressJLT")}
                    <br />
                    {t("contactPage.dubaiUAE")}
                  </p>
                </div>
                <div className="mt-6 pl-4 border-l-2 border-blue-500/50 md:pl-5">
                  <h2
                    className="text-white font-medium mb-1 md:mb-1.5 md:text-base"
                    style={{ fontFamily: "var(--font-sans), sans-serif" }}
                  >
                    {t("contactPage.generalInquiries")}
                  </h2>
                  <p className="text-white/85 text-sm leading-relaxed md:text-[0.9375rem]">
                    {t("contactPage.officeTel")}
                    <br />
                    {t("contactPage.officeEmail")}
                  </p>
                </div>
              </motion.div>

              {/* Right: Contact form card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative overflow-visible rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 md:p-8 pb-10 md:pb-8 hover:border-blue-500/40 transition-all duration-300 md:shadow-[0_0_30px_-10px_rgba(59,130,246,0.08)]"
              >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10">
                <h2
                  className="text-white font-medium mb-4 md:mb-5 md:text-base"
                  style={{ fontFamily: "var(--font-sans), sans-serif" }}
                >
                  {t("contactPage.formHeading")}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-4">
                  <div className="space-y-1 relative" ref={departmentRef}>
                    <label htmlFor="department" className="text-xs font-medium text-white/90 block">
                      {t("contactPage.department")}
                    </label>
                    <input type="hidden" name="department" value={formData.department} />
                    <button
                      type="button"
                      id="department"
                      onClick={() => setDepartmentOpen((open) => !open)}
                      className="w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 px-3 py-2.5 md:py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 rounded transition-colors text-left"
                    >
                      <span>
                        {t(DEPARTMENT_OPTIONS.find((o) => o.value === formData.department)?.labelKey ?? "contactPage.deptTradingDesk")}
                      </span>
                      <ChevronDown className={`w-4 h-4 shrink-0 text-white/70 transition-transform ${departmentOpen ? "rotate-180" : ""}`} strokeWidth={1.8} />
                    </button>
                    {departmentOpen && (
                      <div
                        className="absolute z-30 mt-1 w-full min-w-[200px] max-h-60 overflow-y-scroll overflow-x-hidden overscroll-contain rounded border border-white/10 bg-[#0c0c0c] shadow-lg py-1"
                        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <ul className="py-0">
                        {DEPARTMENT_OPTIONS.map((opt) => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, department: opt.value }))
                                setDepartmentOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                                formData.department === opt.value ? "bg-blue-500/20 text-white" : "text-white/90 hover:bg-white/10"
                              }`}
                            >
                              {t(opt.labelKey)}
                            </button>
                          </li>
                        ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-medium text-white/90 block">
                        {t("contactPage.name")} <span className={fieldErrors.name ? "text-red-400" : "text-white/90"}>*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: false }))
                        }}
                        className={inputClass("name")}
                        placeholder={t("contactPage.name")}
                      />
                      {fieldErrors.name && (
                        <p className="text-xs text-red-400">{t("contactPage.requiredFieldError")}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="surname" className="text-xs font-medium text-white/90 block">
                        {t("contactPage.surname")} <span className={fieldErrors.surname ? "text-red-400" : "text-white/90"}>*</span>
                      </label>
                      <input
                        type="text"
                        id="surname"
                        value={formData.surname}
                        onChange={(e) => {
                          setFormData({ ...formData, surname: e.target.value })
                          if (fieldErrors.surname) setFieldErrors((prev) => ({ ...prev, surname: false }))
                        }}
                        className={inputClass("surname")}
                        placeholder={t("contactPage.surname")}
                      />
                      {fieldErrors.surname && (
                        <p className="text-xs text-red-400">{t("contactPage.requiredFieldError")}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-medium text-white/90 block">
                      {t("contactPage.email")} <span className={fieldErrors.email ? "text-red-400" : "text-white/90"}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: false }))
                      }}
                      className={inputClass("email")}
                      placeholder={t("contactPage.email")}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-400">{t("contactPage.requiredFieldError")}</p>
                    )}
                  </div>

                  <div className="space-y-1" ref={phonePrefixRef}>
                    <label htmlFor="phone" className="text-xs font-medium text-white/90 block">
                      {t("contactPage.phone")} <span className="text-white/60">{t("contactPage.optional")}</span>
                    </label>
                    <div className="flex gap-1">
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setPhonePrefixOpen((open) => !open)
                            setPhonePrefixSearch("")
                            if (!phonePrefixOpen) setTimeout(() => phoneSearchInputRef.current?.focus(), 50)
                          }}
                          className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2.5 md:py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 rounded transition-colors min-w-[7rem] justify-between"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-base leading-none">{PHONE_PREFIX_OPTIONS.find((o) => o.value === formData.phonePrefix)?.flag ?? "🇦🇪"}</span>
                            <span>{formData.phonePrefix}</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 shrink-0 text-white/70 transition-transform ${phonePrefixOpen ? "rotate-180" : ""}`} strokeWidth={1.8} />
                        </button>
                        {phonePrefixOpen && (
                          <div
                            className="absolute z-30 mt-1.5 left-0 w-[18rem] rounded-lg border border-white/10 bg-[#0c0c0c] shadow-xl overflow-hidden flex flex-col"
                            style={{ height: "14rem" }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <div className="shrink-0 p-2 border-b border-white/10">
                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30">
                                <Search className="w-4 h-4 text-white shrink-0" strokeWidth={1.8} />
                                <input
                                  ref={phoneSearchInputRef}
                                  type="text"
                                  autoComplete="off"
                                  value={phonePrefixSearch}
                                  onChange={(e) => setPhonePrefixSearch(e.target.value)}
                                  onKeyDown={(e) => {
                                    e.stopPropagation()
                                    if (e.key === "Enter") e.preventDefault()
                                  }}
                                  placeholder={t("contactPage.searchPlaceholder")}
                                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-white placeholder-white/50"
                                />
                              </div>
                            </div>
                            <div
                              ref={phoneListScrollRef}
                              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1"
                              style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
                              onWheel={(e) => e.stopPropagation()}
                            >
                              <ul className="py-0">
                                {phonePrefixFiltered.map((opt) => (
                                  <li key={opt.iso + opt.value}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData((prev) => ({ ...prev, phonePrefix: opt.value }))
                                        setPhonePrefixOpen(false)
                                        setPhonePrefixSearch("")
                                      }}
                                      className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm transition-colors ${
                                        formData.phonePrefix === opt.value ? "bg-blue-500/20 text-white" : "text-white/90 hover:bg-white/10"
                                      }`}
                                    >
                                      <span className="text-lg leading-none shrink-0">{opt.flag}</span>
                                      <span className="flex-1 min-w-0 truncate">{getCountryLabel(opt)}</span>
                                      <span className="text-white/60 shrink-0 tabular-nums">{opt.value}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                              {phonePrefixFiltered.length === 0 && (
                                <p className="px-3 py-4 text-sm text-white/50">{t("contactPage.noCountryFound")}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 min-w-0 bg-white/5 border border-white/10 px-3 py-2.5 md:py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 rounded transition-colors"
                        placeholder={t("contactPage.phone")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="message" className="text-xs font-medium text-white/90 block">
                      {t("contactPage.message")} <span className="text-white/60">{t("contactPage.optional")}</span>
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 md:py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 rounded transition-colors resize-y min-h-[100px]"
                      placeholder={t("contactPage.message")}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => {
                          setAcceptedTerms(e.target.checked)
                          if (fieldErrors.terms) setFieldErrors((prev) => ({ ...prev, terms: false }))
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-[#3d7dd4] focus:ring-[#3d7dd4] focus:ring-offset-0"
                      />
                      <span className="text-sm text-white/90">
                        {t("contactPage.acceptTermsPrefix")}
                        <a href="/Futura_Energy_Terms_of_Use.pdf" target="_blank" rel="noopener noreferrer" className="text-[#6ba3e8] hover:text-[#8bbcf0] underline" onClick={(e) => e.stopPropagation()}>
                          {t("footer.terms")}
                        </a>
                        {", "}
                        <a href="/Futura_Energy_Privacy_Policy.pdf" target="_blank" rel="noopener noreferrer" className="text-[#6ba3e8] hover:text-[#8bbcf0] underline" onClick={(e) => e.stopPropagation()}>
                          {t("footer.privacy")}
                        </a>
                        {" "}{t("contactPage.acceptTermsAnd")}{" "}
                        <a href="/Futura_Energy_Cookie_Policy.pdf" target="_blank" rel="noopener noreferrer" className="text-[#6ba3e8] hover:text-[#8bbcf0] underline" onClick={(e) => e.stopPropagation()}>
                          {t("footer.cookies")}
                        </a>
                        {t("contactPage.acceptTermsSuffix")}
                      </span>
                    </label>
                    {fieldErrors.terms && (
                      <p className="text-xs text-red-400">{t("contactPage.acceptTermsError")}</p>
                    )}
                  </div>

                  {/* CAPTCHA */}
                  <div className="space-y-1">
                    <TurnstileCaptcha
                      onVerify={handleCaptchaVerify}
                      onError={handleCaptchaError}
                      onExpire={handleCaptchaExpire}
                    />
                    {fieldErrors.captcha && (
                      <p className="text-xs text-red-400 text-center">{t("contactPage.captchaError")}</p>
                    )}
                  </div>

                  {submitStatus === "success" && (
                    <p className="text-sm text-emerald-400">
                      {t("contactPage.messageSent")}
                    </p>
                  )}
                  {submitStatus === "error" && (
                    <p className="text-sm text-red-400">
                      {submitErrorMessage || t("contactPage.sendError")}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group/btn relative inline-flex items-center justify-center w-full py-3.5 md:py-3 text-white text-sm font-semibold bg-gradient-to-r from-[#3d7dd4]/20 to-[#4a8fe8]/20 backdrop-blur-md border-2 border-[#3d7dd4]/60 rounded-md hover:bg-gradient-to-r hover:from-[#3d7dd4]/30 hover:to-[#4a8fe8]/30 hover:border-[#3d7dd4] hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(61,125,212,0.25)] transition-all duration-300 cursor-pointer overflow-hidden mt-2 mb-2 md:mb-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? t("contactPage.sending") : t("contactPage.submit")}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#3d7dd4]/0 via-[#3d7dd4]/15 to-[#3d7dd4]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                  </button>
                </form>
              </div>
            </motion.div>
            </div>
          </div>
        </section>

        {/* Footnote */}
        <div className="w-full pb-6 pt-4 shrink-0">
          <div className="mx-auto w-full max-w-7xl px-8 md:px-12 border-t border-white/20 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-white/70 text-xs">
                © {new Date().getFullYear()} {t("footer.copyrightSuffix")}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-white/70">
                <a href="/about" className="hover:text-white transition-colors">{t("footer.aboutUs")}</a>
                <a href="/contact" className="hover:text-white transition-colors">{t("footer.contact")}</a>
                <a href="/Futura_Energy_Privacy_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.privacy")}</a>
                <a href="/Futura_Energy_Cookie_Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.cookies")}</a>
                <a href="/Futura_Energy_Terms_of_Use.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.terms")}</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
