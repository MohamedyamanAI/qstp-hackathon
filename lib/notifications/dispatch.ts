import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { sendEmail } from "@/lib/notifications/email"
import { sendPush } from "@/lib/notifications/push"
import {
  readChannelPreferences,
  type NotificationPayload,
} from "@/lib/notifications/types"
import type { Database, Json } from "@/lib/supabase/database.types"

type Client = SupabaseClient<Database>

export type DispatchInput = {
  supabase: Client
  userId: string
  payload: NotificationPayload
}

export type BulkDispatchInput = {
  supabase: Client
  userIds: string[]
  payload: NotificationPayload
}

function payloadToContent(payload: NotificationPayload): Json {
  return {
    title: payload.title,
    message: payload.message,
    ...(payload.action_url ? { action_url: payload.action_url } : {}),
    ...(payload.data ? { data: payload.data as Json } : {}),
  } as Json
}

async function insertInApp(
  supabase: Client,
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  if (userIds.length === 0) return
  const rows = userIds.map((user_id) => ({
    user_id,
    type: payload.type,
    content: payloadToContent(payload),
  }))
  await supabase.from("notifications").insert(rows)
}

async function fanOutEmail(
  supabase: Client,
  recipients: { id: string; email: string; preferences: unknown }[],
  payload: NotificationPayload
): Promise<void> {
  void supabase
  await Promise.all(
    recipients
      .filter((r) => readChannelPreferences(r.preferences).email)
      .filter((r) => r.email)
      .map((r) => sendEmail(r.email, payload))
  )
}

async function fanOutPush(
  supabase: Client,
  recipients: { id: string; preferences: unknown }[],
  payload: NotificationPayload
): Promise<void> {
  const eligible = recipients.filter(
    (r) => readChannelPreferences(r.preferences).push
  )
  if (eligible.length === 0) return

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, user_id")
    .in(
      "user_id",
      eligible.map((r) => r.id)
    )

  if (!subs || subs.length === 0) return

  const results = await Promise.all(
    subs.map((s) =>
      sendPush(
        { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
        payload
      )
    )
  )

  const goneEndpoints = results
    .filter((r) => r.gone)
    .map((r) => r.endpoint)

  if (goneEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", goneEndpoints)
  }
}

export async function dispatchToUsers({
  supabase,
  userIds,
  payload,
}: BulkDispatchInput): Promise<void> {
  const ids = Array.from(new Set(userIds.filter(Boolean)))
  if (ids.length === 0) return

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, preferences")
    .in("id", ids)

  const recipients = profiles ?? []

  await Promise.all([
    insertInApp(supabase, ids, payload),
    fanOutEmail(supabase, recipients, payload),
    fanOutPush(supabase, recipients, payload),
  ])
}

export async function dispatchToUser(input: DispatchInput): Promise<void> {
  await dispatchToUsers({
    supabase: input.supabase,
    userIds: [input.userId],
    payload: input.payload,
  })
}
