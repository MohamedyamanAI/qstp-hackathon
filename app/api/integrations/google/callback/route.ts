import { NextRequest, NextResponse } from "next/server"

import { requireRole } from "@/lib/auth/require"
import {
  exchangeGoogleOAuthCode,
  fetchGoogleProfile,
  googleEnv,
  syncGoogleForStartup,
  upsertGoogleConnection,
} from "@/lib/integrations/google"
import { verifyOAuthState } from "@/lib/integrations/oauth-state"

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
        "/founder/settings?integration_error=google_callback",
        request.url
      )
    )
  }

  const { stateSecret } = googleEnv()
  const payload = await verifyOAuthState({
    provider: "google_workspace",
    state,
    secret: stateSecret,
  })
  if (!payload || payload.userId !== userId) {
    return NextResponse.redirect(
      new URL("/founder/settings?integration_error=google_state", request.url)
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

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const redirectUri = new URL(
    "/api/integrations/google/callback",
    origin
  ).toString()

  try {
    const token = await exchangeGoogleOAuthCode({ code, redirectUri })
    const profile = token.access_token
      ? await fetchGoogleProfile(token.access_token)
      : {}
    await upsertGoogleConnection({ startupId: startup.id, token, profile })

    const now = new Date()
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    )
      .toISOString()
      .slice(0, 10)
    const periodEnd = now.toISOString().slice(0, 10)
    await syncGoogleForStartup({
      startupId: startup.id,
      periodStart,
      periodEnd,
    })
  } catch (err) {
    const message =
      err instanceof Error ? encodeURIComponent(err.message) : "google_failed"
    return NextResponse.redirect(
      new URL(`/founder/settings?integration_error=${message}`, request.url)
    )
  }

  return NextResponse.redirect(
    new URL("/founder/settings?integration=google_connected", request.url)
  )
}
