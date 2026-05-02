import { NextRequest, NextResponse } from "next/server"

import { requireRole } from "@/lib/auth/require"
import { verifyStripeOAuthState } from "@/lib/integrations/oauth-state"
import {
  exchangeStripeOAuthCode,
  stripeEnv,
  syncStripeForStartup,
  upsertStripeConnection,
} from "@/lib/integrations/stripe"

export async function GET(request: NextRequest) {
  const { supabase, userId } = await requireRole("founder")
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      new URL(`/founder/settings?integration_error=${error}`, request.url)
    )
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/founder/settings?integration_error=stripe_callback",
        request.url
      )
    )
  }

  const { stateSecret } = stripeEnv()
  const payload = await verifyStripeOAuthState({ state, secret: stateSecret })
  if (!payload || payload.userId !== userId) {
    return NextResponse.redirect(
      new URL("/founder/settings?integration_error=stripe_state", request.url)
    )
  }

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("id", payload.startupId)
    .eq("founder_id", userId)
    .maybeSingle()

  if (!startup) {
    return NextResponse.redirect(
      new URL("/founder/settings?integration_error=no_startup", request.url)
    )
  }

  try {
    const token = await exchangeStripeOAuthCode(code)
    await upsertStripeConnection({ startupId: startup.id, token })
    const now = new Date()
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    )
      .toISOString()
      .slice(0, 10)
    const periodEnd = now.toISOString().slice(0, 10)
    await syncStripeForStartup({
      startupId: startup.id,
      periodStart,
      periodEnd,
    })
  } catch (err) {
    const message =
      err instanceof Error ? encodeURIComponent(err.message) : "stripe_failed"
    return NextResponse.redirect(
      new URL(`/founder/settings?integration_error=${message}`, request.url)
    )
  }

  return NextResponse.redirect(
    new URL("/founder/settings?integration=stripe_connected", request.url)
  )
}
