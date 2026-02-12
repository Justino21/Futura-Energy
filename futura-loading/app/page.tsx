"use client"
import IntroSequence from "@/components/intro-sequence"
import { useState } from "react"

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)

  return (
    <main className="w-screen h-screen overflow-hidden">
      {showIntro ? (
        <IntroSequence onComplete={() => setShowIntro(false)} />
      ) : (
        <>
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-white text-center animate-fade-in">
              <h1 className="text-6xl font-bold mb-4">Welcome to Futura Energy</h1>
              <p className="text-xl text-gray-400">Your landing page content here</p>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
