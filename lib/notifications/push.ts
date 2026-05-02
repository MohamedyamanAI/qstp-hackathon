import "server-only"

import webpush from "web-push"

import type { NotificationPayload } from "@/lib/notifications/types"

type StoredSubscription = {
  endpoint: string
  p256dh: string
  auth: string
}

let configured = false
let configuredOk = false

function configure(): boolean {
  if (configured) return configuredOk

  configured = true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT

  if (!publicKey || !privateKey || !subject) {
    configuredOk = false
    return false
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  configuredOk = true
  return true
}

export function isPushConfigured(): boolean {
  return configure()
}

function buildPayload(payload: NotificationPayload): string {
  return JSON.stringify({
    type: payload.type,
    title: payload.title,
    message: payload.message,
    action_url: payload.action_url ?? null,
    data: payload.data ?? null,
  })
}

export type PushSendResult = {
  endpoint: string
  ok: boolean
  gone?: boolean
  reason?: string
}

export async function sendPush(
  subscription: StoredSubscription,
  payload: NotificationPayload
): Promise<PushSendResult> {
  if (!configure()) {
    return {
      endpoint: subscription.endpoint,
      ok: false,
      reason: "VAPID not configured",
    }
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      buildPayload(payload)
    )
    return { endpoint: subscription.endpoint, ok: true }
  } catch (err) {
    const status =
      err && typeof err === "object" && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined
    const gone = status === 404 || status === 410
    return {
      endpoint: subscription.endpoint,
      ok: false,
      gone,
      reason: err instanceof Error ? err.message : "push failed",
    }
  }
}
