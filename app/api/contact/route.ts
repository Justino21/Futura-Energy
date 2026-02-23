import { NextRequest, NextResponse } from "next/server"

const RECIPIENT_EMAIL = "info@futuranrg.com"
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY not configured - skipping CAPTCHA verification")
    return true
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })
    const data = await response.json()
    return data.success === true
  } catch (err) {
    console.error("CAPTCHA verification error:", err)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { department, name, surname, email, phone, message, captchaToken } = body as {
      department?: string
      name?: string
      surname?: string
      email?: string
      phone?: string
      message?: string
      captchaToken?: string
    }

    if (!captchaToken) {
      return NextResponse.json(
        { error: "CAPTCHA verification required" },
        { status: 400 }
      )
    }

    const captchaValid = await verifyCaptcha(captchaToken)
    if (!captchaValid) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email is not configured (missing RESEND_API_KEY). Add it in .env.local or Vercel env vars." },
        { status: 500 }
      )
    }
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const fullName = [name, surname].filter(Boolean).join(" ")
    const subject = `Contact form: ${department ?? "General"} – ${fullName}`
    const html = `
      <p><strong>From:</strong> ${fullName} &lt;${email ?? ""}&gt;</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      <p><strong>Department:</strong> ${department ?? "—"}</p>
      ${message?.trim() ? `<hr /><p><strong>Message:</strong></p><p>${String(message).replace(/\n/g, "<br />")}</p>` : ""}
    `

    // From must use a verified domain (see resend.com/domains). Example: "Futura Contact <contact@futuranrg.com>"
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Futura Contact <contact@futuranrg.com>",
      to: RECIPIENT_EMAIL,
      replyTo: email ?? undefined,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("Contact API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send message" },
      { status: 500 }
    )
  }
}
