"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require"
import type { Json } from "@/lib/supabase/database.types"

export type ActionState = { error?: string; ok?: boolean } | undefined

function s(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : ""
}
function b(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1"
}

export async function updateTeamProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("team")

  const fullName = s(formData.get("full_name"))
  const avatarUrl = s(formData.get("avatar_url"))
  const language = s(formData.get("language_preference"))
  const department = s(formData.get("department"))

  if (!fullName) return { error: "Name is required." }

  const { data: current } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", userId)
    .maybeSingle()

  const prefs =
    current?.preferences && typeof current.preferences === "object"
      ? { ...(current.preferences as Record<string, Json>) }
      : {}
  prefs.department = department

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl || null,
      language_preference: language === "ar" ? "ar" : "en",
      preferences: prefs as unknown as Json,
    })
    .eq("id", userId)

  if (error) return { error: error.message }

  revalidatePath("/team/settings")
  return { ok: true }
}

export async function updateTeamPreferences(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("team")

  const { data: current } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", userId)
    .maybeSingle()

  const prefs =
    current?.preferences && typeof current.preferences === "object"
      ? { ...(current.preferences as Record<string, Json>) }
      : {}

  prefs.theme = s(formData.get("theme")) || "system"
  prefs.notifications = {
    email: b(formData.get("notif_email")),
    push: b(formData.get("notif_push")),
    whatsapp: b(formData.get("notif_whatsapp")),
  }
  prefs.alert_severity =
    s(formData.get("alert_severity")) || "all"
  prefs.working_hours_only = b(formData.get("working_hours_only"))

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: prefs as unknown as Json })
    .eq("id", userId)

  if (error) return { error: error.message }
  revalidatePath("/team/settings")
  return { ok: true }
}
