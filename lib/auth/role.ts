import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"

export type UserRole = Database["public"]["Enums"]["user_role_enum"]

export const FOUNDER_HOME = "/founder/home"
export const TEAM_HOME = "/team/today"

export function roleHomeFor(role: UserRole | null | undefined): string {
  return role === "team" ? TEAM_HOME : FOUNDER_HOME
}

export async function fetchUserRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()
  return data?.role ?? null
}
