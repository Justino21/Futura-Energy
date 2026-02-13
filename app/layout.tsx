import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
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
    images: [{ url: "/Futura-Icon2.png", width: 512, height: 512, alt: "Futura Energy" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Futura Energy | Global Energy Trading",
    description:
      "International energy trading group. Crude oil and refined product trading across Europe, Africa, Middle East and Latin America.",
    images: ["/Futura-Icon2.png"],
  },
  icons: {
    icon: [
      { url: "/Futura-Icon2.png", type: "image/png", sizes: "32x32" },
      { url: "/Futura-Icon2.png", type: "image/png", sizes: "64x64", media: "(prefers-color-scheme: light)" },
      { url: "/Futura-Icon2.png", type: "image/png", sizes: "64x64", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/Futura-Icon2.png",
  },
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
        {/* Preload first frame for instant home scroll (when using pre-exported frames) */}
        <link rel="preload" as="image" href="/frames/frame_001.jpg" />
        {/* Fallback: preload video when using video-based extraction */}
        <link rel="preload" as="video" href="/Futura_Home_Final.mp4" />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        {/* Google Analytics (gtag.js) - beforeInteractive so Google detects the tag */}
        <Script
          id="gtag-loader"
          strategy="beforeInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-GXCSFJLNXR"
        />
        <Script id="gtag-config" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GXCSFJLNXR');
          `}
        </Script>
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
