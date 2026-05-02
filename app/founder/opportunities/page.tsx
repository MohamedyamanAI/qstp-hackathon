import {
  IdeaIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { OpportunitiesTabs } from "@/components/founder/opportunities/opportunities-tabs"
import {
  OpportunityCard,
  type OpportunityCardData,
} from "@/components/founder/opportunities/opportunity-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require"
import type { Database } from "@/lib/supabase/database.types"

type Category = Database["public"]["Enums"]["opportunity_category_enum"]

type SearchParams = Promise<{ category?: string }>

const CATEGORY_VALUES: Set<Category> = new Set([
  "grant",
  "competition",
  "investor",
  "customer",
  "talent",
  "resource",
])

export default async function FounderOpportunitiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { supabase, userId } = await requireRole("founder")
  const sp = await searchParams
  const active = sp.category ?? "all"

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", userId)
    .maybeSingle()

  // Fetch global opps + ones matched to this startup
  let query = supabase
    .from("opportunities")
    .select("id, title, description, source, category, status, fit_score, deadline")
    .order("fit_score", { ascending: false, nullsFirst: false })

  if (startup) {
    query = query.or(`startup_id.is.null,startup_id.eq.${startup.id}`)
  } else {
    query = query.is("startup_id", null)
  }

  if (active !== "all") {
    if (CATEGORY_VALUES.has(active as Category)) {
      query = query.eq("category", active as Category)
    }
  }

  const { data: opps } = await query

  const cards: OpportunityCardData[] = (opps ?? []).map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    source: o.source,
    category: o.category,
    status: o.status,
    fit_score: o.fit_score,
    deadline: o.deadline,
  }))

  const visible = cards.filter((c) => c.status !== "dismissed")
  const headline = visible[0]
  const grid = visible.slice(1)

  const saved = cards.filter((c) => c.status === "saved")
  const applied = cards.filter((c) => c.status === "applied")

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Unfair Advantage Finder
        </h1>
        <p className="text-sm text-muted-foreground">
          Grants, investors, customers, talent, and resources matched to your
          stage and sector.
        </p>
      </div>

      <OpportunitiesTabs active={active} />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {headline ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">Top match</Badge>
                <span className="text-xs text-muted-foreground">
                  Best fit for you right now
                </span>
              </div>
              <OpportunityCard data={headline} variant="headline" />
            </div>
          ) : null}

          {grid.length === 0 && !headline ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={IdeaIcon}
                    className="size-4 text-muted-foreground"
                  />
                  No opportunities yet
                </CardTitle>
                <CardDescription>
                  Once your incubation team publishes matches for your sector,
                  they&apos;ll show up here.
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ) : grid.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {grid.map((c) => (
                <OpportunityCard key={c.id} data={c} />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Saved</CardTitle>
              <CardDescription>For later review.</CardDescription>
            </CardHeader>
            <CardContent>
              {saved.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nothing saved.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {saved.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5"
                    >
                      <span className="line-clamp-1 text-xs font-medium">
                        {c.title}
                      </span>
                      {c.fit_score !== null ? (
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {c.fit_score}%
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Applied</CardTitle>
              <CardDescription>In progress or submitted.</CardDescription>
            </CardHeader>
            <CardContent>
              {applied.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  None in flight.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {applied.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5"
                    >
                      <span className="line-clamp-1 text-xs font-medium">
                        {c.title}
                      </span>
                      <Badge variant="outline" className="h-4 text-[10px]">
                        Applied
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>What you&apos;ve earned</CardTitle>
              <CardDescription>
                Captured wins from this surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Stat label="Grants" value="—" />
              <Stat label="Intros" value="—" />
              <Stat label="Deals" value="—" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
