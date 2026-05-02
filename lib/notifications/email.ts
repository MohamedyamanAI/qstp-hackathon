import "server-only"

import { Resend } from "resend"

import type { NotificationPayload } from "@/lib/notifications/types"

let cachedResend: Resend | null = null

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!cachedResend) cachedResend = new Resend(key)
  return cachedResend
}

function getFromAddress(): string | null {
  return process.env.RESEND_FROM_EMAIL ?? null
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  )
}

function renderEmailHtml(payload: NotificationPayload): string {
  const safeTitle = escapeHtml(payload.title)
  const safeMessage = escapeHtml(payload.message)
  const url = payload.action_url
    ? new URL(payload.action_url, siteUrl()).toString()
    : null
  const button = url
    ? `<p style="margin:24px 0"><a href="${escapeAttr(url)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-family:system-ui,sans-serif;font-size:14px">Open in QSTP</a></p>`
    : ""

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f6f5;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:28px">
    <h1 style="margin:0 0 8px;font-size:18px;font-weight:600">${safeTitle}</h1>
    <p style="margin:0;font-size:14px;line-height:1.55;color:#333">${safeMessage}</p>
    ${button}
    <p style="margin:24px 0 0;font-size:12px;color:#888">QSTP Incubation Platform</p>
  </div>
</body></html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function escapeAttr(s: string): string {
  return escapeHtml(s)
}

export async function sendEmail(
  to: string,
  payload: NotificationPayload
): Promise<{ ok: boolean; reason?: string }> {
  const resend = getResend()
  if (!resend) return { ok: false, reason: "RESEND_API_KEY missing" }

  const from = getFromAddress()
  if (!from) return { ok: false, reason: "RESEND_FROM_EMAIL missing" }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: payload.title,
      html: renderEmailHtml(payload),
    })
    if (error) return { ok: false, reason: error.message }
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "send failed",
    }
  }
}
