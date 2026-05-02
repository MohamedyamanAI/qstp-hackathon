import { NextRequest, NextResponse } from "next/server"

import { requireRole } from "@/lib/auth/require"
import { googleAuthUrl, googleEnv } from "@/lib/integrations/google"
import { createOAuthState } from "@/lib/integrations/oauth-state"

export async function GET(request: NextRequest) {
  const { supabase, userId } = await requireRole("founder")
  const { clientId, stateSecret } = googleEnv()

  if (!clientId || !stateSecret) {
    return NextResponse.redirect(
      new URL("/founder/settings?integration_error=google_config", request.url)
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
  const redirectUri = new URL("/api/integrations/google/callback", origin)
  const state = await createOAuthState({
    provider: "google_workspace",
    startupId: startup.id,
    userId,
    secret: stateSecret,
  })

  const url = googleAuthUrl({
    clientId,
    redirectUri: redirectUri.toString(),
    state,
  })

  return NextResponse.redirect(url)
}
