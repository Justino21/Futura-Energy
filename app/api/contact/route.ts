import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const RECIPIENT_EMAIL = "info@futuranrg.com"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email is not configured (missing RESEND_API_KEY). Add it in .env.local or Vercel env vars." },
        { status: 500 }
      )
    }
    const resend = new Resend(apiKey)
    const body = await request.json()
    const { department, name, surname, email, phone, message } = body as {
      department?: string
      name?: string
      surname?: string
      email?: string
      phone?: string
      message?: string
    }

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
