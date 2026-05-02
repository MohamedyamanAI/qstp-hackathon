import {
  TeamSettings,
  type TeamSettingsData,
} from "@/components/team/settings/team-settings"
import { requireRole } from "@/lib/auth/require"

type Preferences = TeamSettingsData["profile"]["preferences"]

export default async function TeamSettingsPage() {
  const { supabase, userId } = await requireRole("team")

  const [{ data: profile }, { data: assignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, avatar_url, language_preference, preferences")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("team_assignments")
      .select(
        "id, assigned_at, startup_id, startups!inner(id, name, sector, health_score, extended_profile)"
      )
      .eq("team_member_id", userId)
      .order("assigned_at", { ascending: false }),
  ])

  const data: TeamSettingsData = {
    profile: {
      full_name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      avatar_url: profile?.avatar_url ?? null,
      language_preference: (profile?.language_preference ?? "en") as "en" | "ar",
      preferences: (profile?.preferences as Preferences) ?? {},
    },
    assignments:
      assignments?.map((a) => {
        const ext =
          (a.startups.extended_profile as { logo_url?: string } | null) ?? {}
        return {
          id: a.id,
          startup_id: a.startup_id,
          name: a.startups.name,
          sector: a.startups.sector,
          health_score: a.startups.health_score,
          assigned_at: a.assigned_at,
          logo_url: ext.logo_url ?? null,
        }
      }) ?? [],
  }

  return (
    <div className="flex flex-col gap-6">
      <TeamSettings data={data} />
    </div>
  )
}
