import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { ids?: string[]; all?: boolean }
  try {
    body = (await req.json()) as { ids?: string[]; all?: boolean }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const now = new Date().toISOString()
  const query = supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("user_id", userId)
    .is("read_at", null)

  if (body.all) {
    const { error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const ids = (body.ids ?? []).filter(
      (id) => typeof id === "string" && id.length > 0
    )
    if (ids.length === 0) {
      return NextResponse.json({ ok: true })
    }
    const { error } = await query.in("id", ids)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
