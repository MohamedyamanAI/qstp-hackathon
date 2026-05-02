import type { SupabaseClient } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Database, Json } from "@/lib/supabase/database.types"

type AdminClient = SupabaseClient<Database>
type JsonObject = Record<string, Json | undefined>

type StripeOAuthTokenResponse = {
  access_token?: string
  refresh_token?: string
  stripe_user_id?: string
  livemode?: boolean
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

type StripeCharge = {
  id: string
  amount_captured: number
  amount_refunded: number
  currency: string
  paid: boolean
  refunded: boolean
  customer: string | null
  created: number
}

type StripeSubscription = {
  id: string
  status: string
  currency: string
  items?: {
    data?: {
      price?: {
        unit_amount?: number | null
        recurring?: { interval?: string | null; interval_count?: number | null }
      } | null
      quantity?: number | null
    }[]
  }
}

type StripeList<T> = {
  data?: T[]
  has_more?: boolean
}

export function stripeEnv() {
  return {
    clientId: process.env.STRIPE_CLIENT_ID ?? "",
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    stateSecret:
      process.env.STRIPE_OAUTH_STATE_SECRET ??
      process.env.STRIPE_SECRET_KEY ??
      "",
  }
}

export async function exchangeStripeOAuthCode(code: string) {
  const { secretKey } = stripeEnv()
  if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY.")

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
  })
  const res = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${secretKey}:`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
  const json = (await res.json()) as StripeOAuthTokenResponse
  if (!res.ok || json.error) {
    throw new Error(
      json.error_description ?? json.error ?? "Stripe OAuth failed."
    )
  }
  if (!json.access_token || !json.stripe_user_id) {
    throw new Error("Stripe OAuth response was missing account credentials.")
  }
  return json
}

export async function upsertStripeConnection({
  startupId,
  token,
}: {
  startupId: string
  token: StripeOAuthTokenResponse
}) {
  const admin = createAdminClient()
  const scopes = token.scope?.split(/\s+/).filter(Boolean) ?? []

  const { error } = await admin.from("startup_integration_connections").upsert(
    {
      startup_id: startupId,
      provider: "stripe",
      status: "connected",
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? null,
      external_account_id: token.stripe_user_id,
      livemode: token.livemode === true,
      scopes,
      last_sync_error: null,
      metadata: {
        token_type: token.token_type ?? "bearer",
      },
    },
    { onConflict: "startup_id,provider" }
  )
  if (error) throw new Error(error.message)

  await updateStartupIntegrationFlag(admin, startupId, "stripe", true)
}

export async function syncStripeForStartup({
  startupId,
  periodStart,
  periodEnd,
}: {
  startupId: string
  periodStart: string
  periodEnd: string
}) {
  const admin = createAdminClient()
  const { data: connection, error: connectionError } = await admin
    .from("startup_integration_connections")
    .select("id, access_token, status")
    .eq("startup_id", startupId)
    .eq("provider", "stripe")
    .maybeSingle()

  if (connectionError) throw new Error(connectionError.message)
  if (
    !connection ||
    connection.status !== "connected" ||
    !connection.access_token
  ) {
    return { ok: false as const, error: "Stripe is not connected." }
  }

  try {
    const snapshot = await fetchStripeSnapshot({
      accessToken: connection.access_token,
      periodStart,
      periodEnd,
    })

    const { data: startup, error: startupError } = await admin
      .from("startups")
      .select("extended_profile")
      .eq("id", startupId)
      .maybeSingle()
    if (startupError) throw new Error(startupError.message)

    const extended = asObject(startup?.extended_profile)
    const integrationSnapshots = asObject(extended.integration_snapshots)
    integrationSnapshots.stripe = snapshot as unknown as Json
    extended.integration_snapshots = integrationSnapshots

    const { error: updateStartupError } = await admin
      .from("startups")
      .update({ extended_profile: extended as unknown as Json })
      .eq("id", startupId)
    if (updateStartupError) throw new Error(updateStartupError.message)

    const { error: updateConnectionError } = await admin
      .from("startup_integration_connections")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq("id", connection.id)
    if (updateConnectionError) throw new Error(updateConnectionError.message)

    return { ok: true as const, snapshot }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe sync failed."
    await admin
      .from("startup_integration_connections")
      .update({
        status: "error",
        last_sync_error: message,
      })
      .eq("id", connection.id)
    throw error
  }
}

async function fetchStripeSnapshot({
  accessToken,
  periodStart,
  periodEnd,
}: {
  accessToken: string
  periodStart: string
  periodEnd: string
}) {
  const start = Math.floor(
    new Date(`${periodStart}T00:00:00Z`).getTime() / 1000
  )
  const end = Math.floor(new Date(`${periodEnd}T23:59:59Z`).getTime() / 1000)
  const charges = await listStripe<StripeCharge>({
    path: "/v1/charges",
    accessToken,
    params: {
      limit: "100",
      "created[gte]": String(start),
      "created[lte]": String(end),
    },
  })
  const subscriptions = await listStripe<StripeSubscription>({
    path: "/v1/subscriptions",
    accessToken,
    params: {
      limit: "100",
      status: "active",
    },
  })

  const paidCharges = charges.filter((charge) => charge.paid)
  const currency =
    mostCommon(paidCharges.map((charge) => charge.currency)) ?? "usd"
  const relevantCharges = paidCharges.filter(
    (charge) => charge.currency === currency
  )
  const revenueCents = relevantCharges.reduce(
    (sum, charge) =>
      sum + Math.max(0, charge.amount_captured - charge.amount_refunded),
    0
  )
  const customerIds = new Set(
    relevantCharges
      .map((charge) => charge.customer)
      .filter((customer): customer is string => Boolean(customer))
  )
  const mrrCents = subscriptions
    .filter((subscription) => subscription.currency === currency)
    .reduce(
      (sum, subscription) => sum + subscriptionMonthlyAmount(subscription),
      0
    )

  return {
    revenue_this_month: centsToMajor(revenueCents),
    monthly_revenue: centsToMajor(revenueCents),
    mrr: centsToMajor(mrrCents),
    customers_reached: customerIds.size || relevantCharges.length,
    paying_customers: customerIds.size || relevantCharges.length,
    revenue_per_active_user:
      relevantCharges.length > 0
        ? centsToMajor(Math.round(revenueCents / relevantCharges.length))
        : 0,
    currency,
    period_start: periodStart,
    period_end: periodEnd,
    charge_count: relevantCharges.length,
    synced_at: new Date().toISOString(),
  }
}

async function listStripe<T>({
  path,
  accessToken,
  params,
}: {
  path: string
  accessToken: string
  params: Record<string, string>
}): Promise<T[]> {
  const out: T[] = []
  let startingAfter: string | undefined

  for (let page = 0; page < 10; page++) {
    const search = new URLSearchParams(params)
    if (startingAfter) search.set("starting_after", startingAfter)
    const res = await fetch(`https://api.stripe.com${path}?${search}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const json = (await res.json()) as StripeList<T> & {
      error?: { message?: string }
    }
    if (!res.ok) {
      throw new Error(json.error?.message ?? `Stripe request failed: ${path}`)
    }

    const data = json.data ?? []
    out.push(...data)
    if (!json.has_more || data.length === 0) break
    const last = data[data.length - 1] as { id?: string }
    if (!last.id) break
    startingAfter = last.id
  }

  return out
}

function subscriptionMonthlyAmount(subscription: StripeSubscription): number {
  const items = subscription.items?.data ?? []
  return items.reduce((sum, item) => {
    const amount = item.price?.unit_amount ?? 0
    const quantity = item.quantity ?? 1
    const interval = item.price?.recurring?.interval ?? "month"
    const intervalCount = item.price?.recurring?.interval_count ?? 1
    const raw = amount * quantity

    if (interval === "year") return sum + raw / (12 * intervalCount)
    if (interval === "week") return sum + (raw * 52) / (12 * intervalCount)
    if (interval === "day") return sum + (raw * 365) / (12 * intervalCount)
    return sum + raw / intervalCount
  }, 0)
}

async function updateStartupIntegrationFlag(
  admin: AdminClient,
  startupId: string,
  provider: string,
  connected: boolean
) {
  const { data: startup, error } = await admin
    .from("startups")
    .select("connected_integrations")
    .eq("id", startupId)
    .maybeSingle()
  if (error) throw new Error(error.message)

  const integrations = asObject(startup?.connected_integrations)
  integrations[provider] = connected

  const { error: updateError } = await admin
    .from("startups")
    .update({ connected_integrations: integrations as unknown as Json })
    .eq("id", startupId)
  if (updateError) throw new Error(updateError.message)
}

function asObject(value: Json | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject
  }
  return {}
}

function centsToMajor(cents: number): number {
  return Math.round((cents / 100) * 100) / 100
}

function mostCommon(values: string[]): string | null {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return (
    Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  )
}
