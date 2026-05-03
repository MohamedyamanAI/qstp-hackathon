import {
  BookmarkAdd02Icon,
  Briefcase01Icon,
  Building01Icon,
  Calendar01Icon,
  CheckmarkSquare01Icon,
  Coins01Icon,
  ConnectIcon,
  FireIcon,
  IdeaIcon,
  Layers01Icon,
  Money01Icon,
  Rocket01Icon,
  ShoppingBag01Icon,
  StarIcon,
  UserGroupIcon,
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

const CATEGORY_INFO: Record<
  Category,
  { label: string; icon: typeof IdeaIcon; tint: string }
> = {
  grant: {
    label: "Grants",
    icon: Coins01Icon,
    tint: "text-emerald-600 dark:text-emerald-400",
  },
  competition: {
    label: "Competitions",
    icon: Rocket01Icon,
    tint: "text-purple-600 dark:text-purple-400",
  },
  investor: {
    label: "Investors",
    icon: Money01Icon,
    tint: "text-blue-600 dark:text-blue-400",
  },
  customer: {
    label: "Customers",
    icon: Building01Icon,
    tint: "text-orange-600 dark:text-orange-400",
  },
  talent: {
    label: "Talent",
    icon: UserGroupIcon,
    tint: "text-pink-600 dark:text-pink-400",
  },
  resource: {
    label: "Resources",
    icon: Briefcase01Icon,
    tint: "text-cyan-600 dark:text-cyan-400",
  },
}

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

  // Closest 3 deadlines from anything still in play
  const upcoming = computeUpcoming(visible)

  // Per-category counts across visible matches
  const categoryCounts = visible.reduce<Record<Category, number>>(
    (acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1
      return acc
    },
    {
      grant: 0,
      competition: 0,
      investor: 0,
      customer: 0,
      talent: 0,
      resource: 0,
    }
  )
  const categoryRows = (Object.entries(categoryCounts) as [Category, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])

  // At-a-glance momentum stats
  const newCount = visible.filter((c) => c.status === "new").length
  const dismissedCount = cards.filter((c) => c.status === "dismissed").length
  const scored = visible.filter(
    (c): c is OpportunityCardData & { fit_score: number } =>
      c.fit_score !== null
  )
  const avgFit =
    scored.length === 0
      ? null
      : Math.round(scored.reduce((s, c) => s + c.fit_score, 0) / scored.length)

  return (
    <div className="flex flex-col gap-5">
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
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={BookmarkAdd02Icon}
                  className="size-4 text-muted-foreground"
                />
                Saved
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkSquare01Icon}
                  className="size-4 text-muted-foreground"
                />
                Applied
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={StarIcon}
                  className="size-4 text-muted-foreground"
                />
                What you&apos;ve earned
              </CardTitle>
              <CardDescription>
                Captured wins from this surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Stat label="Grants" value="—" icon={Coins01Icon} />
              <Stat label="Intros" value="—" icon={ConnectIcon} />
              <Stat label="Deals" value="—" icon={ShoppingBag01Icon} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="size-4 text-muted-foreground"
                />
                Upcoming
              </CardTitle>
              <CardDescription>Closest deadlines.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No dated matches.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {upcoming.map((u) => {
                    const urgent = u.days <= 7
                    return (
                      <li
                        key={u.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5"
                      >
                        <span className="line-clamp-1 text-xs font-medium">
                          {u.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            "h-4 shrink-0 px-1.5 text-[10px] tabular-nums " +
                            (urgent
                              ? "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "")
                          }
                        >
                          {u.days === 0 ? "today" : `${u.days}d`}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Layers01Icon}
                  className="size-4 text-muted-foreground"
                />
                By category
              </CardTitle>
              <CardDescription>Where your matches sit.</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No matches yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {categoryRows.map(([cat, count]) => {
                    const info = CATEGORY_INFO[cat]
                    return (
                      <li
                        key={cat}
                        className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5"
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <HugeiconsIcon
                            icon={info.icon}
                            className={`size-3.5 ${info.tint}`}
                          />
                          {info.label}
                        </span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {count}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FireIcon}
                  className="size-4 text-amber-500"
                />
                At a glance
              </CardTitle>
              <CardDescription>Momentum on this surface.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Stat
                label="New"
                value={newCount === 0 ? "—" : String(newCount)}
                icon={IdeaIcon}
              />
              <Stat
                label="Avg fit"
                value={avgFit === null ? "—" : `${avgFit}%`}
                icon={StarIcon}
              />
              <Stat
                label="Passed"
                value={dismissedCount === 0 ? "—" : String(dismissedCount)}
                icon={CheckmarkSquare01Icon}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function computeUpcoming(visible: OpportunityCardData[]) {
  const now = Date.now()
  return visible
    .filter((c) => c.deadline)
    .map((c) => ({
      id: c.id,
      title: c.title,
      days: Math.ceil((new Date(c.deadline!).getTime() - now) / 86400000),
    }))
    .filter((c) => c.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3)
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: typeof IdeaIcon
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" />
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
