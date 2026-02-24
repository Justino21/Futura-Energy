import type React from "react"
import type { Metadata, Viewport } from "next"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/src/contexts/language-context"
import IntroWrapper from "@/components/intro-wrapper"
import LegalConsentPopup from "@/components/legal-consent-popup"
import { GoogleAnalyticsPageView } from "@/components/google-analytics"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const SITE_URL = "https://www.futuranrg.com"
const PREVIEW_IMAGE_URL = `${SITE_URL}/Futura_Link_Preview.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Futura Energy | Global Energy Trading",
  description:
    "International energy trading group. Crude oil and refined product trading across Europe, Africa, Middle East and Latin America.",
  generator: "v0.app",
  openGraph: {
    title: "Futura Energy | Global Energy Trading",
    description:
      "International energy trading group. Crude oil and refined product trading across Europe, Africa, Middle East and Latin America.",
    url: SITE_URL,
    siteName: "Futura Energy",
    images: [{ url: PREVIEW_IMAGE_URL, width: 1200, height: 630, alt: "Futura Energy" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Futura Energy | Global Energy Trading",
    description:
      "International energy trading group. Crude oil and refined product trading across Europe, Africa, Middle East and Latin America.",
    images: [PREVIEW_IMAGE_URL],
  },
  // Favicon & apple-touch-icon come from app/icon.png & app/apple-icon.png (always deployed with build)
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // Helps Safari use full screen and minimize browser UI on scroll
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon & apple-touch-icon are served by Next from app/icon.png & app/apple-icon.png */}
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PF3C5HZ5');`,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Google tag (gtag.js) - GA4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GXCSFJLNXR"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-GXCSFJLNXR');`,
          }}
        />
        {/* End Google Analytics */}
        <meta property="og:image" content={PREVIEW_IMAGE_URL} />
        <meta name="twitter:image" content={PREVIEW_IMAGE_URL} />
        {/* Hero frames: high-priority preload for instant load on mobile (home scroll) */}
        <link rel="preload" as="image" href="/frames/frame_001.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/frame_002.jpg" />
        <link rel="preload" as="image" href="/frames/frame_003.jpg" />
        <link rel="preload" as="image" href="/frames/frame_004.jpg" />
        <link rel="preload" as="image" href="/frames/frame_005.jpg" />
        {/* Fallback: preload video when using video-based extraction */}
        <link rel="preload" as="video" href="/Futura_Home_Final.mp4" />
        {/* Trading page hero: preload so video can play instantly on mobile when visiting /trading */}
        <link rel="preload" as="video" href="/Futura_Trade_Hero2.0.mp4" />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PF3C5HZ5"
            height={0}
            width={0}
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <LanguageProvider>
          <GoogleAnalyticsPageView />
          {children}
          <LegalConsentPopup />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
