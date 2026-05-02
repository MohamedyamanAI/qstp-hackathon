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
  Database02Icon,
  FireIcon,
  Megaphone01Icon,
  Mortarboard02Icon,
  PlaneIcon,
  StarAward01Icon,
  StarCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const TIERS: { tier: Tier; label: string; min: number; icon: typeof Award01Icon }[] = [
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
    return {
      current,
      next: null,
      pct: 100,
      pointsToNext: 0,
    }
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

const ACTIVITY = [
  {
    label: "On-time submission · October report",
    points: +150,
    when: "2 days ago",
    icon: CheckmarkCircle02Icon,
  },
  {
    label: "Verified data bonus · GitHub connected",
    points: +50,
    when: "2 days ago",
    icon: Database02Icon,
  },
  {
    label: "Helped Acme Co. with intro",
    points: +25,
    when: "1 week ago",
    icon: UserGroupIcon,
  },
  {
    label: "Redeemed · Priority mentor slot",
    points: -200,
    when: "2 weeks ago",
    icon: Mortarboard02Icon,
  },
  {
    label: "Streak bonus · 3 months on time",
    points: +75,
    when: "1 month ago",
    icon: FireIcon,
  },
]

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=300&q=70`

const MARKETPLACE = {
  Resources: [
    {
      name: "Mentor slot · 1 hour",
      cost: 200,
      icon: Mortarboard02Icon,
      image: IMG("1542744173-8e7e53415bb0"),
    },
    {
      name: "Lab equipment access",
      cost: 350,
      icon: Coins01Icon,
      image: IMG("1532187863486-abf9dbad1b69"),
    },
    {
      name: "$5K AWS credits",
      cost: 500,
      icon: Coupon01Icon,
      image: IMG("1558494949-ef010cbdcc31"),
    },
    {
      name: "5 hours legal review",
      cost: 600,
      icon: Coupon01Icon,
      image: IMG("1589829545856-d10d557cf95f"),
    },
  ],
  Visibility: [
    {
      name: "Newsletter feature",
      cost: 400,
      icon: Megaphone01Icon,
      image: IMG("1499336315816-097655dcfbda"),
    },
    {
      name: "LinkedIn shoutout",
      cost: 250,
      icon: Megaphone01Icon,
      image: IMG("1611944212129-29977ae1398c"),
    },
    {
      name: "Lobby TV slot · 1 week",
      cost: 300,
      icon: Megaphone01Icon,
      image: IMG("1551817958-d9d86fb29431"),
    },
    {
      name: "Speaker invite",
      cost: 700,
      icon: Megaphone01Icon,
      image: IMG("1475721027785-f74eccf877e2"),
    },
  ],
  Network: [
    {
      name: "Investor intro",
      cost: 800,
      icon: UserGroupIcon,
      image: IMG("1556761175-5973dc0f32e7"),
    },
    {
      name: "Exec 1:1",
      cost: 600,
      icon: UserGroupIcon,
      image: IMG("1521737711867-e3b97375f902"),
    },
    {
      name: "Demo Day priority",
      cost: 1200,
      icon: StarCircleIcon,
      image: IMG("1540575467063-178a50c2df87"),
    },
    {
      name: "Startup of the Month",
      cost: 2000,
      icon: StarAward01Icon,
      image: IMG("1567427017947-545c5f8d16ad"),
    },
  ],
  Tangible: [
    {
      name: "QSTP café credits",
      cost: 100,
      icon: Coffee01Icon,
      image: IMG("1495474472287-4d71bcdd2085"),
    },
    {
      name: "Conference ticket",
      cost: 900,
      icon: Coupon01Icon,
      image: IMG("1505373877841-8d25f7d46678"),
    },
    {
      name: "Travel stipend",
      cost: 1500,
      icon: PlaneIcon,
      image: IMG("1436491865332-7a61a109cc05"),
    },
  ],
}

const LEADERBOARD = [
  { rank: 1, name: "Acme Co.", points: 2840, change: +2 },
  { rank: 2, name: "Lumen", points: 2615, change: +1 },
  { rank: 3, name: "Pelican", points: 2470, change: -1 },
  { rank: 4, name: "Northwind", points: 2210, change: 0 },
  { rank: 5, name: "Solis", points: 2080, change: +3 },
]

export default async function FounderRewardsPage() {
  const { supabase, userId } = await requireRole("founder")

  const { data: startup } = await supabase
    .from("startups")
    .select("id, name, points_balance, tier")
    .eq("founder_id", userId)
    .maybeSingle()

  const points = startup?.points_balance ?? 0
  const { current, next, pct, pointsToNext } = tierProgress(points)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rewards</h1>
        <p className="text-sm text-muted-foreground">
          Points, tier progress, and the marketplace where they unlock real
          things.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={current.icon} className="size-6" />
                </div>
                <div>
                  <Badge variant="secondary" className="capitalize">
                    {current.label} tier
                  </Badge>
                  <h2 className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                    {points.toLocaleString()}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    points balance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 text-orange-600 dark:text-orange-400">
                <HugeiconsIcon icon={FireIcon} className="size-4" />
                <span className="text-sm font-semibold">3 month streak</span>
              </div>
            </div>
          </div>
          <CardContent>
            {next ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-muted-foreground">
                    Progress to {next.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {pointsToNext.toLocaleString()} pts to go
                  </span>
                </div>
                <Progress value={pct} />
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>{current.label}</span>
                  <span>{next.label}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                You&apos;ve reached the top tier. Stay legendary.
              </p>
            )}
          </CardContent>
          <Separator />
          <CardContent className="grid grid-cols-3 gap-3">
            {TIERS.slice(0, 5).map((t) => {
              const reached = points >= t.min
              return (
                <div
                  key={t.tier}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 text-center text-[11px] ${
                    reached
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 opacity-60"
                  }`}
                >
                  <HugeiconsIcon
                    icon={t.icon}
                    className={`size-5 ${reached ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span className="font-medium">{t.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {t.min.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This month</CardTitle>
            <CardDescription>How your points were earned.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Earner
              icon={CheckmarkCircle02Icon}
              label="On-time submissions"
              points={150}
            />
            <Earner
              icon={Database02Icon}
              label="Verified data bonuses"
              points={50}
            />
            <Earner
              icon={UserGroupIcon}
              label="Community contributions"
              points={25}
            />
            <Earner icon={FireIcon} label="Streak bonus" points={75} />
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total this month</span>
              <span className="tabular-nums">+300</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="marketplace">
        <TabsList variant="line" className="h-auto flex-wrap justify-start">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <div className="flex flex-col gap-5">
            {Object.entries(MARKETPLACE).map(([group, items]) => (
              <div key={group}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">{group}</h3>
                  <span className="text-[11px] text-muted-foreground">
                    {items.length} items
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => {
                    const canAfford = points >= item.cost
                    return (
                      <Card key={item.name} size="sm">
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt=""
                            className="h-24 w-full object-cover"
                          />
                          <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-background/90 shadow-sm backdrop-blur">
                            <HugeiconsIcon
                              icon={item.icon}
                              className="size-3.5"
                            />
                          </div>
                        </div>
                        <CardContent className="flex flex-col gap-3">
                          <div>
                            <div className="text-sm font-medium leading-snug">
                              {item.name}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
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
                          <Button
                            size="sm"
                            disabled={!canAfford}
                            variant={canAfford ? "default" : "outline"}
                            className="h-7 w-full text-xs"
                          >
                            {canAfford
                              ? "Redeem"
                              : `${(item.cost - points).toLocaleString()} pts short`}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
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
              <ul className="flex flex-col">
                {ACTIVITY.map((entry, idx) => (
                  <li key={idx}>
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                        <HugeiconsIcon icon={entry.icon} className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{entry.label}</div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <HugeiconsIcon
                            icon={Calendar01Icon}
                            className="size-3"
                          />
                          {entry.when}
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          entry.points > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                        }`}
                      >
                        {entry.points > 0 ? "+" : ""}
                        {entry.points}
                      </span>
                    </div>
                    {idx < ACTIVITY.length - 1 ? <Separator /> : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Monthly Movers</CardTitle>
                  <CardDescription>
                    Top earners across the QSTP cohort this month.
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {startup?.name ?? "You"} · #—
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {LEADERBOARD.map((row, idx) => (
                  <li key={row.rank}>
                    <div className="flex items-center gap-3 py-2">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                          row.rank === 1
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : row.rank <= 3
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {row.rank}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{row.name}</div>
                      </div>
                      <span className="tabular-nums text-sm font-semibold">
                        {row.points.toLocaleString()}
                      </span>
                      <span
                        className={`min-w-10 text-right text-[11px] tabular-nums ${
                          row.change > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : row.change < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {row.change > 0 ? `↑${row.change}` : row.change < 0 ? `↓${-row.change}` : "—"}
                      </span>
                    </div>
                    {idx < LEADERBOARD.length - 1 ? <Separator /> : null}
                  </li>
                ))}
              </ul>
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
  icon: typeof FireIcon
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
