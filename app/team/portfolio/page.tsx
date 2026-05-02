import { PortfolioFilters } from "@/components/team/portfolio/portfolio-filters"
import {
  StartupCard,
  type StartupCardData,
} from "@/components/team/portfolio/startup-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require"

type SearchParams = Promise<{
  q?: string
  sector?: string
  stage?: string
  health?: string
  sort?: string
}>

const STAGE_VALUES = new Set([
  "idea",
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "growth",
])

export default async function TeamPortfolioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { supabase } = await requireRole("team")
  const sp = await searchParams

  let query = supabase
    .from("startups")
    .select(
      "id, name, sector, stage, team_size, health_score, cohort, tier, extended_profile, founder:profiles!startups_founder_id_fkey(full_name, avatar_url)"
    )

  if (sp.q && sp.q.trim()) {
    query = query.ilike("name", `%${sp.q.trim()}%`)
  }
  if (sp.sector && sp.sector !== "all") {
    query = query.eq("sector", sp.sector)
  }
  if (sp.stage && sp.stage !== "all" && STAGE_VALUES.has(sp.stage)) {
    query = query.eq(
      "stage",
      sp.stage as "idea" | "pre_seed" | "seed" | "series_a" | "series_b" | "growth"
    )
  }
  if (sp.health === "healthy") query = query.gte("health_score", 75)
  else if (sp.health === "warning")
    query = query.gte("health_score", 50).lt("health_score", 75)
  else if (sp.health === "critical") query = query.lt("health_score", 50)

  const sort = sp.sort ?? "active"
  if (sort === "alpha") query = query.order("name", { ascending: true })
  else if (sort === "at_risk")
    query = query.order("health_score", {
      ascending: true,
      nullsFirst: false,
    })
  else query = query.order("updated_at", { ascending: false })

  const { data: startups } = await query

  const ids = (startups ?? []).map((s) => s.id)
  const lastByStartup: Record<string, string> = {}
  if (ids.length > 0) {
    const { data: subs } = await supabase
      .from("kpi_submissions")
      .select("startup_id, submitted_at, status")
      .in("startup_id", ids)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })

    for (const s of subs ?? []) {
      if (!s.submitted_at) continue
      if (!lastByStartup[s.startup_id]) {
        lastByStartup[s.startup_id] = s.submitted_at
      }
    }
  }

  let cards: StartupCardData[] = (startups ?? []).map((s) => {
    const ext = (s.extended_profile as { logo_url?: string } | null) ?? {}
    return {
      id: s.id,
      name: s.name,
      sector: s.sector,
      stage: s.stage,
      team_size: s.team_size,
      health_score: s.health_score,
      cohort: s.cohort,
      tier: s.tier,
      logo_url: ext.logo_url ?? null,
      last_submission_at: lastByStartup[s.id] ?? null,
      founder_name: s.founder?.full_name ?? null,
      founder_avatar_url: s.founder?.avatar_url ?? null,
    }
  })

  if (sort === "recent") {
    cards = cards.sort((a, b) => {
      const av = a.last_submission_at ? new Date(a.last_submission_at).getTime() : 0
      const bv = b.last_submission_at ? new Date(b.last_submission_at).getTime() : 0
      return bv - av
    })
  }

  // Distinct sector list for the filter dropdown
  const sectorOptions = Array.from(
    new Set((startups ?? []).map((s) => s.sector).filter(Boolean))
  ).sort()

  const totalHealth = cards.filter((c) => c.health_score !== null)
  const avgHealth =
    totalHealth.length > 0
      ? Math.round(
          totalHealth.reduce((sum, c) => sum + (c.health_score ?? 0), 0) /
            totalHealth.length
        )
      : null
  const atRisk = cards.filter(
    (c) => c.health_score !== null && c.health_score < 50
  ).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div className="hidden gap-3 md:flex">
          <Stat label="Total" value={String(cards.length)} />
          <Stat
            label="Avg health"
            value={avgHealth !== null ? String(avgHealth) : "—"}
          />
          <Stat
            label="At-risk"
            value={String(atRisk)}
            tone={atRisk > 0 ? "destructive" : undefined}
          />
        </div>
      </div>

      <PortfolioFilters sectorOptions={sectorOptions} />

      {cards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No matches</CardTitle>
            <CardDescription>
              Adjust your filters or clear the search to see more startups.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((c) => (
            <StartupCard key={c.id} data={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "destructive"
}) {
  return (
    <div className="rounded-md border border-border/60 bg-card px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-base font-semibold tabular-nums ${
          tone === "destructive" ? "text-destructive" : ""
        }`}
      >
        {value}
      </div>
    </div>
  )
}
