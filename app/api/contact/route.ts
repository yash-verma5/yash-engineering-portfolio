import { NextResponse } from "next/server";
import { profile } from "@/lib/content";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in your name, email, and message." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";
  const toEmail = process.env.CONTACT_TO_EMAIL || profile.email;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email sending is not configured yet. Add RESEND_API_KEY in Vercel, then try again."
      },
      { status: 503 }
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `Portfolio inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message
      ].join("\n"),
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
          <h2 style="margin:0 0 16px">Portfolio inquiry</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p style="margin-top:24px"><strong>Message</strong></p>
          <p>${safeMessage.replace(/\n/g, "<br />")}</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "The email provider could not send the message. Please try the direct email link." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
