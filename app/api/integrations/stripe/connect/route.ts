import { NextRequest, NextResponse } from "next/server"

import { requireRole } from "@/lib/auth/require"
import { createStripeOAuthState } from "@/lib/integrations/oauth-state"
import { stripeEnv } from "@/lib/integrations/stripe"

export async function GET(request: NextRequest) {
  const { supabase, userId } = await requireRole("founder")
  const { clientId, stateSecret } = stripeEnv()

  if (!clientId || !stateSecret) {
    return NextResponse.redirect(
      new URL("/founder/settings?integration_error=stripe_config", request.url)
    )
  }

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", userId)
    .maybeSingle()

  if (!startup) {
    return NextResponse.redirect(
      new URL("/founder/settings?integration_error=no_startup", request.url)
    )
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const redirectUri = new URL("/api/integrations/stripe/callback", origin)
  const state = await createStripeOAuthState({
    startupId: startup.id,
    userId,
    secret: stateSecret,
  })

  const url = new URL("https://connect.stripe.com/oauth/authorize")
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("scope", "read_write")
  url.searchParams.set("redirect_uri", redirectUri.toString())
  url.searchParams.set("state", state)

  return NextResponse.redirect(url)
}
