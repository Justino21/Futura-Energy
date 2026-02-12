import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/src/contexts/language-context"
import IntroWrapper from "@/components/intro-wrapper"
import LegalConsentPopup from "@/components/legal-consent-popup"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.futuranrg.com"),
  title: "Futura Energy | Global Energy Trading",
  description:
    "International energy trading group. Crude oil and refined product trading across Europe, Africa, Middle East and Latin America.",
  generator: "v0.app",
  openGraph: {
    title: "Futura Energy | Global Energy Trading",
    description:
      "International energy trading group. Crude oil and refined product trading across Europe, Africa, Middle East and Latin America.",
    url: "https://www.futuranrg.com",
    siteName: "Futura Energy",
    images: [{ url: "/futura-logo.png", width: 512, height: 512, alt: "Futura Energy" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Futura Energy | Global Energy Trading",
    description:
      "International energy trading group. Crude oil and refined product trading across Europe, Africa, Middle East and Latin America.",
    images: ["/futura-logo.png"],
  },
  icons: {
    icon: [
      { url: "/futura-logo.png", type: "image/png" },
      { url: "/futura-logo.png", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/futura-logo.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
    ],
    apple: "/futura-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload first frame for instant home scroll (when using pre-exported frames) */}
        <link rel="preload" as="image" href="/frames/frame_001.jpg" />
        {/* Fallback: preload video when using video-based extraction */}
        <link rel="preload" as="video" href="/Futura_Home_Final.mp4" />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <LanguageProvider>
          {/* Loading animation disabled for now - kept for future use */}
          {/* <IntroWrapper /> */}
          {children}
          <LegalConsentPopup />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
