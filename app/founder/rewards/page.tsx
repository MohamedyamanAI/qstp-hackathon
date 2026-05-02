import {
  Award01Icon,
  Award02Icon,
  Award03Icon,
  Award04Icon,
  Award05Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Coffee01Icon,
  Coins01Icon,
  Coupon01Icon,
  DashboardSpeed01Icon,
  Database02Icon,
  Edit02Icon,
  FireIcon,
  Megaphone01Icon,
  Mortarboard02Icon,
  PlaneIcon,
  Rocket01Icon,
  ShoppingBag01Icon,
  StarAward01Icon,
  StarCircleIcon,
  Tag01Icon,
  ThumbsUpIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { RedeemButton } from "@/components/founder/rewards/redeem-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/require"
import type { Database } from "@/lib/supabase/database.types"

type Tier = Database["public"]["Enums"]["startup_tier_enum"]
type Reason = Database["public"]["Enums"]["points_reason_enum"]
type RewardCategory = Database["public"]["Enums"]["reward_category_enum"]

const TIERS: { tier: Tier; label: string; min: number; icon: IconSvgElement }[] = [
  { tier: "spark", label: "Spark", min: 0, icon: Award01Icon },
  { tier: "catalyst", label: "Catalyst", min: 250, icon: Award02Icon },
  { tier: "trailblazer", label: "Trailblazer", min: 750, icon: Award03Icon },
  { tier: "pioneer", label: "Pioneer", min: 1500, icon: Award04Icon },
  { tier: "legend", label: "Legend", min: 3000, icon: Award05Icon },
]

function tierProgress(points: number) {
  const idx = TIERS.findIndex((t, i) => {
    const next = TIERS[i + 1]
    return !next || points < next.min
  })
  const current = TIERS[idx >= 0 ? idx : 0]
  const next = TIERS[idx + 1]
  if (!next) {
    return { current, next: null, pct: 100, pointsToNext: 0 }
  }
  const span = next.min - current.min
  const earned = points - current.min
  return {
    current,
    next,
    pct: Math.min(100, Math.max(0, Math.round((earned / span) * 100))),
    pointsToNext: Math.max(0, next.min - points),
  }
}

const REASON_META: Record<
  Reason,
  { label: string; icon: IconSvgElement }
> = {
  on_time_submission: { label: "On-time submission", icon: CheckmarkCircle02Icon },
  verified_data_bonus: { label: "Verified data bonus", icon: Database02Icon },
  streak_bonus: { label: "Streak bonus", icon: FireIcon },
  community_help: { label: "Community help", icon: UserGroupIcon },
  win_published: { label: "Win amplified", icon: Megaphone01Icon },
  tier_unlock: { label: "Tier unlock", icon: Rocket01Icon },
  redemption: { label: "Redemption", icon: ShoppingBag01Icon },
  manual_adjust: { label: "Adjustment", icon: Edit02Icon },
}

const ITEM_ICONS: Record<string, IconSvgElement> = {
  mortarboard: Mortarboard02Icon,
  coins: Coins01Icon,
  coupon: Coupon01Icon,
  megaphone: Megaphone01Icon,
  usergroup: UserGroupIcon,
  starcircle: StarCircleIcon,
  staraward: StarAward01Icon,
  coffee: Coffee01Icon,
  plane: PlaneIcon,
  tag: Tag01Icon,
}

const CATEGORY_LABEL: Record<RewardCategory, string> = {
  resources: "Resources",
  visibility: "Visibility",
  network: "Network & capital",
  tangible: "Tangible perks",
}

const CATEGORY_ORDER: RewardCategory[] = [
  "resources",
  "visibility",
  "network",
  "tangible",
]

function timeAgo(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

function computeStreak(months: Set<string>) {
  let count = 0
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (months.has(key)) count++
    else break
  }
  return count
}

export default async function FounderRewardsPage() {
  const { supabase, userId } = await requireRole("founder")

  const { data: startup } = await supabase
    .from("startups")
    .select("id, name, points_balance, tier")
    .eq("founder_id", userId)
    .maybeSingle()

  const points = startup?.points_balance ?? 0
  const { current, next, pct, pointsToNext } = tierProgress(points)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [
    { data: recentLedger },
    { data: monthLedger },
    { data: streakLedger },
    { data: items },
    { data: leaderboard },
    { count: rankAhead },
  ] = await Promise.all([
    startup
      ? supabase
          .from("points_ledger")
          .select("id, delta, reason, description, created_at")
          .eq("startup_id", startup.id)
          .order("created_at", { ascending: false })
          .limit(15)
      : { data: null as never },
    startup
      ? supabase
          .from("points_ledger")
          .select("delta, reason")
          .eq("startup_id", startup.id)
          .gte("created_at", startOfMonth.toISOString())
          .gt("delta", 0)
      : { data: null as never },
    startup
      ? supabase
          .from("points_ledger")
          .select("created_at")
          .eq("startup_id", startup.id)
          .eq("reason", "on_time_submission")
          .gte("created_at", sixMonthsAgo.toISOString())
      : { data: null as never },
    supabase
      .from("reward_items")
      .select(
        "id, category, name, description, cost, icon_key, image_url, sort_order"
      )
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase
      .from("startups")
      .select("id, name, points_balance, tier")
      .order("points_balance", { ascending: false, nullsFirst: false })
      .limit(8),
    startup
      ? supabase
          .from("startups")
          .select("id", { count: "exact", head: true })
          .gt("points_balance", points)
      : { count: null as never },
  ])

  // Group this-month earnings by reason
  const monthByReason = new Map<Reason, number>()
  let monthTotal = 0
  for (const row of monthLedger ?? []) {
    monthByReason.set(row.reason, (monthByReason.get(row.reason) ?? 0) + row.delta)
    monthTotal += row.delta
  }

  // Streak: count consecutive months going back from this month with on-time submissions
  const monthSet = new Set<string>()
  for (const row of streakLedger ?? []) {
    const d = new Date(row.created_at)
    monthSet.add(`${d.getFullYear()}-${d.getMonth()}`)
  }
  const streak = computeStreak(monthSet)

  // Marketplace grouped by category
  const marketByCategory = new Map<
    RewardCategory,
    NonNullable<typeof items>
  >()
  for (const item of items ?? []) {
    const arr = marketByCategory.get(item.category) ?? []
    arr.push(item)
    marketByCategory.set(item.category, arr)
  }

  const myRank = (rankAhead ?? 0) + 1
  const totalStartups = leaderboard?.length ?? 0
  const monthEarners = Array.from(monthByReason.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid items-stretch gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden py-0">
          <div
            className="p-6 text-white"
            style={{
              background:
                "linear-gradient(135deg, #3a4a1a 0%, #5c6b2f 30%, #4a5a20 50%, #6b7b3a 70%, #3a4a1a 100%)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-lime-400 text-[#3a4a1a]">
                  <HugeiconsIcon icon={current.icon} className="size-6" />
                </div>
                <div>
                  <Badge className="capitalize border-white/20 bg-white/15 text-white">
                    {current.label} tier
                  </Badge>
                  <h2 className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-white">
                    {points.toLocaleString()}
                  </h2>
                  <p className="text-xs text-white/60">points balance</p>
                </div>
              </div>
              {streak > 0 ? (
                <div className="flex items-center gap-1 rounded-full bg-orange-500/25 px-3 py-1 text-orange-300">
                  <HugeiconsIcon icon={FireIcon} className="size-4" />
                  <span className="text-sm font-semibold">
                    {streak} month streak
                  </span>
                </div>
              ) : null}
            </div>
            {next ? (
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-white/60">
                    Progress to {next.label}
                  </span>
                  <span className="font-medium tabular-nums text-white">
                    {pointsToNext.toLocaleString()} pts to go
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            ) : (
              <p className="mt-6 text-xs text-white/60">
                You&apos;ve reached the top tier. Stay legendary.
              </p>
            )}
          </div>
          <CardContent className="py-2 pb-0">
            <div className="flex items-center justify-between">
              {TIERS.slice(0, 5).map((t) => {
                const reached = points >= t.min
                return (
                  <div
                    key={t.tier}
                    className={`flex items-center gap-1.5 text-[11px] ${
                      reached ? "" : "opacity-40"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={t.icon}
                      className={`size-4 ${reached ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="font-medium">{t.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {t.min.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This month</CardTitle>
            <CardDescription>How your points were earned.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {monthEarners.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No points earned yet this month. Submit your next report to start
                a streak.
              </p>
            ) : (
              monthEarners.map(([reason, total]) => (
                <Earner
                  key={reason}
                  icon={REASON_META[reason].icon}
                  label={REASON_META[reason].label}
                  points={total}
                />
              ))
            )}
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total this month</span>
              <span
                className={`tabular-nums ${
                  monthTotal > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {monthTotal > 0 ? `+${monthTotal}` : monthTotal}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="marketplace">
        <TabsList variant="line" className="h-auto flex-wrap justify-start">
          <TabsTrigger value="marketplace">
            <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" />{" "}
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="activity">
            <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" />{" "}
            Activity
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <HugeiconsIcon icon={StarAward01Icon} className="size-4" />{" "}
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <div className="flex flex-col gap-5">
            {CATEGORY_ORDER.filter((c) => marketByCategory.has(c)).map(
              (category) => {
                const groupItems = marketByCategory.get(category) ?? []
                return (
                  <div key={category}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium">
                        {CATEGORY_LABEL[category]}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        {groupItems.length} items
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {groupItems.map((item) => {
                        const Icon = ITEM_ICONS[item.icon_key] ?? Tag01Icon
                        return (
                          <Card key={item.id} size="sm">
                            <div className="relative">
                              {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image_url}
                                  alt=""
                                  className="h-24 w-full object-cover"
                                />
                              ) : (
                                <div className="h-24 w-full bg-muted" />
                              )}
                              <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-background/90 shadow-sm backdrop-blur">
                                <HugeiconsIcon icon={Icon} className="size-3.5" />
                              </div>
                            </div>
                            <CardContent className="flex flex-col gap-3">
                              <div>
                                <div className="text-sm font-medium leading-snug">
                                  {item.name}
                                </div>
                                {item.description ? (
                                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                                    {item.description}
                                  </p>
                                ) : null}
                                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                                  <HugeiconsIcon
                                    icon={Coins01Icon}
                                    className="size-3"
                                  />
                                  <span className="font-semibold tabular-nums text-foreground">
                                    {item.cost.toLocaleString()}
                                  </span>{" "}
                                  points
                                </div>
                              </div>
                              <RedeemButton
                                itemId={item.id}
                                itemName={item.name}
                                cost={item.cost}
                                balance={points}
                              />
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Every credit and debit on your wallet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLedger && recentLedger.length > 0 ? (
                <ul className="flex flex-col">
                  {recentLedger.map((entry, idx) => {
                    const meta = REASON_META[entry.reason]
                    return (
                      <li key={entry.id}>
                        <div className="flex items-center gap-3 py-2.5">
                          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                            <HugeiconsIcon icon={meta.icon} className="size-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {entry.description}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <HugeiconsIcon
                                icon={Calendar01Icon}
                                className="size-3"
                              />
                              {timeAgo(entry.created_at)} · {meta.label}
                            </div>
                          </div>
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              entry.delta > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            }`}
                          >
                            {entry.delta > 0 ? "+" : ""}
                            {entry.delta}
                          </span>
                        </div>
                        {idx < recentLedger.length - 1 ? <Separator /> : null}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No activity yet. Submit your first report to start earning.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Cohort leaderboard</CardTitle>
                  <CardDescription>
                    Top earners across the QSTP cohort by lifetime points.
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {startup?.name ?? "You"} · #{myRank}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {leaderboard && leaderboard.length > 0 ? (
                <ul className="flex flex-col">
                  {leaderboard.map((row, idx) => {
                    const isMe = row.id === startup?.id
                    const rank = idx + 1
                    return (
                      <li key={row.id}>
                        <div
                          className={`flex items-center gap-3 py-2 ${
                            isMe ? "rounded-md bg-primary/5 px-2" : ""
                          }`}
                        >
                          <div
                            className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                              rank === 1
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                : rank <= 3
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {rank}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {row.name}
                              {isMe ? (
                                <Badge variant="outline" className="text-[10px]">
                                  You
                                </Badge>
                              ) : null}
                            </div>
                            <div className="text-[11px] capitalize text-muted-foreground">
                              {row.tier} tier
                            </div>
                          </div>
                          <span className="tabular-nums text-sm font-semibold">
                            {(row.points_balance ?? 0).toLocaleString()}
                          </span>
                        </div>
                        {idx < leaderboard.length - 1 ? <Separator /> : null}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Leaderboard not available yet.
                </p>
              )}
              {totalStartups > 0 ? (
                <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <HugeiconsIcon icon={ThumbsUpIcon} className="size-3" />
                  Ranked across {totalStartups} cohort startups · refreshed
                  hourly
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Earner({
  icon,
  label,
  points,
}: {
  icon: IconSvgElement
  label: string
  points: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-md bg-muted">
        <HugeiconsIcon icon={icon} className="size-4" />
      </div>
      <span className="flex-1 text-xs">{label}</span>
      <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
        +{points}
      </span>
    </div>
  )
}
