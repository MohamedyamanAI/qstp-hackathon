import {
  FounderSettings,
  type FounderSettingsData,
} from "@/components/founder/settings/founder-settings"
import { requireRole } from "@/lib/auth/require"

type ExtendedProfile = NonNullable<
  FounderSettingsData["startup"]
>["extended_profile"]
type PrivacySettings = NonNullable<
  FounderSettingsData["startup"]
>["privacy_settings"]
type Preferences = FounderSettingsData["profile"]["preferences"]

export default async function FounderSettingsPage() {
  const { supabase, userId } = await requireRole("founder")

  const [{ data: profile }, { data: startup }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, avatar_url, language_preference, preferences")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("startups")
      .select(
        "id, name, sector, stage, cohort, team_size, extended_profile, connected_integrations, privacy_settings"
      )
      .eq("founder_id", userId)
      .maybeSingle(),
  ])

  const data: FounderSettingsData = {
    profile: {
      full_name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      avatar_url: profile?.avatar_url ?? null,
      language_preference: (profile?.language_preference ?? "en") as "en" | "ar",
      preferences: (profile?.preferences as Preferences) ?? {},
    },
    startup: startup
      ? {
          id: startup.id,
          name: startup.name,
          sector: startup.sector,
          stage: startup.stage,
          cohort: startup.cohort,
          team_size: startup.team_size,
          extended_profile:
            (startup.extended_profile as ExtendedProfile) ?? {},
          connected_integrations:
            (startup.connected_integrations as Record<string, boolean>) ?? {},
          privacy_settings:
            (startup.privacy_settings as PrivacySettings) ?? {},
        }
      : null,
  }

  return (
    <div className="flex flex-col gap-6">
      <FounderSettings data={data} />
    </div>
  )
}
