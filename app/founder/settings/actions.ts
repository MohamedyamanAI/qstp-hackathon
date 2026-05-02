"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require"
import { syncGoogleForStartup } from "@/lib/integrations/google"
import { syncStripeForStartup } from "@/lib/integrations/stripe"
import type { Json } from "@/lib/supabase/database.types"

export type ActionState = { error?: string; ok?: boolean } | undefined

function s(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : ""
}

function b(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1"
}

function n(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null
  const num = Number(v)
  return Number.isFinite(num) ? num : null
}

async function loadStartup(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  founderId: string
) {
  const { data } = await supabase
    .from("startups")
    .select(
      "id, name, sector, stage, cohort, team_size, extended_profile, connected_integrations, privacy_settings, recipients"
    )
    .eq("founder_id", founderId)
    .maybeSingle()
  return data
}

function asObject(value: unknown): Record<string, Json> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json>
  }
  return {}
}

function asArray(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : []
}

// ---- Profile ----------------------------------------------------------------

export async function updateProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")

  const fullName = s(formData.get("full_name"))
  const avatarUrl = s(formData.get("avatar_url"))
  const language = s(formData.get("language_preference"))

  if (!fullName) return { error: "Name is required." }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl || null,
      language_preference: language === "ar" ? "ar" : "en",
    })
    .eq("id", userId)

  if (error) return { error: error.message }

  // Startup-level details
  const startup = await loadStartup(supabase, userId)
  if (startup) {
    const ext = asObject(startup.extended_profile)
    ext.legal_name_en = s(formData.get("legal_name_en"))
    ext.legal_name_ar = s(formData.get("legal_name_ar"))
    ext.cr_number = s(formData.get("cr_number"))
    ext.incorporation_date = s(formData.get("incorporation_date"))
    ext.registered_address = s(formData.get("registered_address"))

    const startupName = s(formData.get("startup_name"))
    const sector = s(formData.get("sector"))
    const teamSize = n(formData.get("team_size"))

    const { error: sErr } = await supabase
      .from("startups")
      .update({
        name: startupName || startup.name,
        sector: sector || startup.sector,
        team_size: teamSize ?? startup.team_size,
        extended_profile: ext as unknown as Json,
      })
      .eq("id", startup.id)

    if (sErr) return { error: sErr.message }
  }

  revalidatePath("/founder/settings")
  return { ok: true }
}

// ---- Integrations ----------------------------------------------------------

const INTEGRATION_KEYS = [
  "stripe",
  "google_workspace",
  "github",
  "hubspot",
  "linkedin",
  "google_analytics",
] as const

export async function updateIntegrations(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const startup = await loadStartup(supabase, userId)
  if (!startup) return { error: "No startup found." }

  const next: Record<string, boolean> = {}
  for (const key of INTEGRATION_KEYS) {
    next[key] = b(formData.get(`int_${key}`))
  }
  // Drive prefill rides on the workspace toggle (single OAuth connection).
  next.google_drive = next.google_workspace

  const { error } = await supabase
    .from("startups")
    .update({ connected_integrations: next as unknown as Json })
    .eq("id", startup.id)

  if (error) return { error: error.message }
  revalidatePath("/founder/settings")
  return { ok: true }
}

export async function syncGoogleIntegration(): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const startup = await loadStartup(supabase, userId)
  if (!startup) return { error: "No startup found." }

  const now = new Date()
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  )
    .toISOString()
    .slice(0, 10)
  const periodEnd = now.toISOString().slice(0, 10)

  try {
    const result = await syncGoogleForStartup({
      startupId: startup.id,
      periodStart,
      periodEnd,
    })
    if (!result.ok) return { error: result.error }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Google sync failed.",
    }
  }

  revalidatePath("/founder/settings")
  return { ok: true }
}

export async function syncStripeIntegration(): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const startup = await loadStartup(supabase, userId)
  if (!startup) return { error: "No startup found." }

  const now = new Date()
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  )
    .toISOString()
    .slice(0, 10)
  const periodEnd = now.toISOString().slice(0, 10)

  try {
    const result = await syncStripeForStartup({
      startupId: startup.id,
      periodStart,
      periodEnd,
    })
    if (!result.ok) return { error: result.error }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Stripe sync failed.",
    }
  }

  revalidatePath("/founder/settings")
  return { ok: true }
}

// ---- Cap Table -------------------------------------------------------------

export async function addShareholder(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const startup = await loadStartup(supabase, userId)
  if (!startup) return { error: "No startup found." }

  const name = s(formData.get("name"))
  const pct = n(formData.get("ownership_percentage"))
  const nationality = s(formData.get("nationality"))

  if (!name) return { error: "Name is required." }
  if (pct === null || pct < 0 || pct > 100) {
    return { error: "Ownership % must be between 0 and 100." }
  }

  const ext = asObject(startup.extended_profile)
  const cap = asArray(ext.cap_table)
  cap.push({
    name,
    ownership_percentage: pct,
    nationality: nationality || null,
  } as Json)
  ext.cap_table = cap

  const { error } = await supabase
    .from("startups")
    .update({ extended_profile: ext as unknown as Json })
    .eq("id", startup.id)

  if (error) return { error: error.message }
  revalidatePath("/founder/settings")
  return { ok: true }
}

export async function removeShareholder(formData: FormData): Promise<void> {
  const { supabase, userId } = await requireRole("founder")
  const startup = await loadStartup(supabase, userId)
  if (!startup) return

  const idx = Number(formData.get("idx"))
  if (!Number.isFinite(idx)) return

  const ext = asObject(startup.extended_profile)
  const cap = asArray(ext.cap_table)
  cap.splice(idx, 1)
  ext.cap_table = cap

  await supabase
    .from("startups")
    .update({ extended_profile: ext as unknown as Json })
    .eq("id", startup.id)

  revalidatePath("/founder/settings")
}

// ---- Compliance ------------------------------------------------------------

export async function updateCompliance(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const startup = await loadStartup(supabase, userId)
  if (!startup) return { error: "No startup found." }

  const ext = asObject(startup.extended_profile)
  ext.tax_regime = s(formData.get("tax_regime"))
  ext.auditor_name = s(formData.get("auditor_name"))
  ext.auditor_contact = s(formData.get("auditor_contact"))
  ext.active_grants = s(formData.get("active_grants"))
  ext.financial_year_end = s(formData.get("financial_year_end"))

  const { error } = await supabase
    .from("startups")
    .update({ extended_profile: ext as unknown as Json })
    .eq("id", startup.id)

  if (error) return { error: error.message }
  revalidatePath("/founder/settings")
  return { ok: true }
}

// ---- Notifications + theme + privacy --------------------------------------

export async function updatePreferences(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")

  const prefs = {
    theme: s(formData.get("theme")) || "system",
    notifications: {
      email: b(formData.get("notif_email")),
      push: b(formData.get("notif_push")),
      whatsapp: b(formData.get("notif_whatsapp")),
    },
    digest_frequency: s(formData.get("digest_frequency")) || "weekly",
    quiet_hours: b(formData.get("quiet_hours")),
  }

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: prefs as unknown as Json })
    .eq("id", userId)

  if (error) return { error: error.message }
  revalidatePath("/founder/settings")
  return { ok: true }
}

export async function updatePrivacy(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const startup = await loadStartup(supabase, userId)
  if (!startup) return { error: "No startup found." }

  const next = {
    cohort_benchmarking: b(formData.get("cohort_benchmarking")),
    public_wins: b(formData.get("public_wins")),
    portfolio_visibility:
      s(formData.get("portfolio_visibility")) || "team_only",
    mood_visibility: s(formData.get("mood_visibility")) || "private",
  }

  const { error } = await supabase
    .from("startups")
    .update({ privacy_settings: next as unknown as Json })
    .eq("id", startup.id)

  if (error) return { error: error.message }
  revalidatePath("/founder/settings")
  return { ok: true }
}
