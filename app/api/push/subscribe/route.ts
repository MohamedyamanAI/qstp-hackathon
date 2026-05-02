import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

type SubscribeBody = {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: SubscribeBody
  try {
    body = (await req.json()) as SubscribeBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const endpoint = body.endpoint?.trim()
  const p256dh = body.keys?.p256dh?.trim()
  const auth = body.keys?.auth?.trim()
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Missing endpoint or keys" },
      { status: 400 }
    )
  }

  const userAgent = req.headers.get("user-agent") ?? null

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
