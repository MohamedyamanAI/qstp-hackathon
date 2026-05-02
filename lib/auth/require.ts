import { redirect } from "next/navigation"

import { fetchUserRole, roleHomeFor, type UserRole } from "@/lib/auth/role"
import { createClient } from "@/lib/supabase/server"

export async function requireRole(role: UserRole) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const userId = typeof claims?.sub === "string" ? claims.sub : null
  if (!userId) redirect("/auth/login")

  const actual = await fetchUserRole(supabase, userId)
  if (actual !== role) {
    redirect(roleHomeFor(actual))
  }

  return { supabase, userId }
}
