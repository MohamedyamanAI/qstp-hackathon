import { type EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { type NextRequest } from "next/server"

import { fetchUserRole, roleHomeFor } from "@/lib/auth/role"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next")

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      if (next && next !== "/protected" && next !== "/dashboard") {
        redirect(next)
      }
      const { data } = await supabase.auth.getClaims()
      const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null
      const role = userId ? await fetchUserRole(supabase, userId) : null
      redirect(roleHomeFor(role))
    }
  }

  redirect("/auth/error")
}
