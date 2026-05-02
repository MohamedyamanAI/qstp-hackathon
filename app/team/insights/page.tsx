import {
  Activity01Icon,
  AnalyticsUpIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Award02Icon,
  BookmarkAdd02Icon,
  Building01Icon,
  Calendar01Icon,
  ChartLineData01Icon,
  Coins01Icon,
  Download01Icon,
  FemaleSymbolIcon,
  FilterIcon,
  FireIcon,
  FlashIcon,
  GlobalIcon,
  HeartCheckIcon,
  IdeaIcon,
  Layers01Icon,
  MaleSymbolIcon,
  MapPinIcon,
  Money01Icon,
  PieChart01Icon,
  Rocket01Icon,
  SparklesIcon,
  Target02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  CohortVintageChart,
  HealthDistributionChart,
  PortfolioTrendChart,
  SectorPerformanceChart,
} from "@/components/team/insights/insights-charts"
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
import { requireRole } from "@/lib/auth/require"

const KPIS = [
  {
    label: "Portfolio revenue",
    value: "$3.81M",
    sub: "this month",
    delta: "+15.6%",
    deltaTone: "up" as const,
    icon: Money01Icon,
    tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    image:
      "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=800&h=320&q=70",
  },
  {
    label: "Jobs created",
    value: "1,284",
    sub: "across 79 startups",
    delta: "+62 MoM",
    deltaTone: "up" as const,
    icon: UserGroupIcon,
    tint: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&h=320&q=70",
  },
  {
    label: "Capital raised",
    value: "$48.2M",
    sub: "trailing 12 months",
    delta: "+$6.4M Q",
    deltaTone: "up" as const,
    icon: Coins01Icon,
    tint: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    image:
      "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&h=320&q=70",
  },
  {
    label: "Avg health score",
    value: "78",
    sub: "out of 100",
    delta: "+3 pts",
    deltaTone: "up" as const,
    icon: HeartCheckIcon,
    tint: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=320&q=70",
  },
] as const

const ACTIVE_VS_RISK = {
  total: 79,
  active: 62,
  watch: 11,
  risk: 6,
}

// 12 weeks × 7 days submission heatmap. 0–4 intensity buckets.
const HEATMAP_WEEKS = 12
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HEATMAP_DATA: number[][] = Array.from({ length: HEATMAP_WEEKS }).map(
  (_, w) =>
    Array.from({ length: 7 }).map((_, d) => {
      // Heavier on Mon-Thu, sparse on weekends, with a deadline bump every 4th week.
      const base = d < 4 ? 2 : d < 5 ? 1.4 : 0.4
      const deadlineBump = w % 4 === 3 ? 1.6 : 0
      const noise = Math.sin(w * 1.3 + d * 0.7) * 0.9
      const v = Math.max(0, Math.round(base + deadlineBump + noise))
      return Math.min(4, v)
    })
)

const HEATMAP_TINT = [
  "bg-muted/60",
  "bg-emerald-500/20",
  "bg-emerald-500/40",
  "bg-emerald-500/65",
  "bg-emerald-500/90",
] as const

const PATTERN_INSIGHTS = [
  {
    title: "Pre-seed founders who hit $50K MRR",
    icon: Target02Icon,
    tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    body: "took these 3 actions in months 12–18 — high-confidence signal across 14 historical cohorts.",
    bullets: [
      "Connected at least 2 verified data sources",
      "Submitted on-time for 4+ consecutive months",
      "Closed 1 enterprise pilot within 90 days of demo day",
    ],
    confidence: 86,
  },
  {
    title: "Disengagement risk — early signals",
    icon: FlashIcon,
    tint: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    body: "Founders who churned shared a reproducible 30-day fingerprint before going dark.",
    bullets: [
      "Mood emoji declined for 2 consecutive submissions",
      "Skipped 1 scheduled office-hours session",
      "No new wins flagged in the prior 45 days",
    ],
    confidence: 78,
  },
  {
    title: "Capital efficiency outliers",
    icon: Rocket01Icon,
    tint: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    body: "Top-quartile founders raised half the capital but reached 1.4× the revenue. Common threads:",
    bullets: [
      "Hired senior commercial talent before scaling eng",
      "Maintained burn multiple < 1.5 across 6 months",
      "Reported revenue from ≥ 3 distinct customer segments",
    ],
    confidence: 81,
  },
] as const

const REGION_DIST = [
  { region: "Doha", count: 41, pct: 52 },
  { region: "Al Rayyan", count: 14, pct: 18 },
  { region: "Lusail", count: 11, pct: 14 },
  { region: "Al Wakrah", count: 7, pct: 9 },
  { region: "Remote / Diaspora", count: 6, pct: 7 },
]

const NATIONALITY_DIST = [
  { label: "Qatari", pct: 38 },
  { label: "GCC", pct: 22 },
  { label: "MENA", pct: 19 },
  { label: "South Asia", pct: 12 },
  { label: "Europe / Other", pct: 9 },
]

const SAVED_VIEWS = [
  {
    title: "FinTech cohort 2024 deep-dive",
    by: "Aisha Al-Mansouri",
    when: "Updated 3d ago",
    icon: ChartLineData01Icon,
  },
  {
    title: "At-risk before board meeting",
    by: "Khalid Al-Thani",
    when: "Updated 6d ago",
    icon: HeartCheckIcon,
  },
  {
    title: "Female-founded — capital efficiency",
    by: "Maryam Hassan",
    when: "Updated 2w ago",
    icon: Award02Icon,
  },
]

export default async function TeamInsightsPage() {
  await requireRole("team")

  return (
    <div className="flex flex-col gap-6">
      {/* Header strip */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <HugeiconsIcon icon={AnalyticsUpIcon} className="size-5" />
            </span>
            <div>
              <h1 className="cn-font-heading text-xl font-semibold tracking-tight">
                Cross-portfolio insights
              </h1>
              <p className="text-xs text-muted-foreground">
                Strategic view across all {ACTIVE_VS_RISK.total} active
                startups, refreshed continuously.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 border-border/70 bg-background"
          >
            <HugeiconsIcon icon={Calendar01Icon} className="size-3" />
            Last 12 months
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-3" />
            Updated 2h ago
          </Badge>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
            Filters
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-8 text-xs">
            <HugeiconsIcon icon={BookmarkAdd02Icon} className="size-3.5" />
            Save view
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {KPIS.map((k) => (
          <Card
            key={k.label}
            className="relative overflow-hidden !pt-0 transition hover:ring-foreground/30"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={k.image}
                alt=""
                className="h-16 w-full object-cover brightness-90"
              />
              <div className="absolute inset-0 bg-primary opacity-40 mix-blend-color" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
              <div
                className={`absolute left-3 top-3 grid size-8 place-items-center rounded-lg ring-1 ring-foreground/10 backdrop-blur ${k.tint}`}
              >
                <HugeiconsIcon icon={k.icon} className="size-4" />
              </div>
            </div>
            <CardContent className="-mt-3 flex flex-col gap-1">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {k.label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="cn-font-heading text-2xl font-semibold tabular-nums">
                  {k.value}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {k.sub}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                    k.deltaTone === "up"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/15 text-red-600 dark:text-red-400"
                  }`}
                >
                  <HugeiconsIcon
                    icon={k.deltaTone === "up" ? ArrowUp01Icon : ArrowDown01Icon}
                    className="size-3"
                  />
                  {k.delta}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  vs prior period
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Active vs at-risk split card */}
        <Card className="md:col-span-2 xl:col-span-5">
          <CardContent className="flex flex-wrap items-center gap-6 py-2">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <HugeiconsIcon icon={Activity01Icon} className="size-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Active vs at-risk
                </span>
                <span className="text-sm font-medium">
                  {ACTIVE_VS_RISK.active} healthy · {ACTIVE_VS_RISK.watch} watch
                  · {ACTIVE_VS_RISK.risk} at-risk
                </span>
              </div>
            </div>
            <div className="flex h-2 flex-1 min-w-[260px] overflow-hidden rounded-full bg-muted">
              <span
                className="bg-emerald-500"
                style={{
                  width: `${(ACTIVE_VS_RISK.active / ACTIVE_VS_RISK.total) * 100}%`,
                }}
              />
              <span
                className="bg-amber-500"
                style={{
                  width: `${(ACTIVE_VS_RISK.watch / ACTIVE_VS_RISK.total) * 100}%`,
                }}
              />
              <span
                className="bg-red-500"
                style={{
                  width: `${(ACTIVE_VS_RISK.risk / ACTIVE_VS_RISK.total) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> Healthy
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500" /> Watch
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-red-500" /> At-risk
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio trend + Cohort curves */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={ChartLineData01Icon}
                    className="size-4 text-primary"
                  />
                  Portfolio revenue trend
                </CardTitle>
                <CardDescription>
                  Aggregate MRR across all active startups, vs. internal
                  forecast.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="gap-1 border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
                +109% YoY
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <PortfolioTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Layers01Icon}
                    className="size-4 text-primary"
                  />
                  Cohort vintage curves
                </CardTitle>
                <CardDescription>
                  Median revenue trajectory by intake year, from month of entry.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <CohortVintageChart />
            <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px]">
              <div className="flex items-center gap-3">
                <LegendDot color="var(--chart-1)" label="2025" />
                <LegendDot color="var(--chart-2)" label="2024" />
                <LegendDot color="var(--chart-3)" label="2023" />
              </div>
              <span className="text-muted-foreground">
                2025 cohort tracking 38% above 2024 at month 9
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sectors + Health distribution */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Building01Icon}
                    className="size-4 text-primary"
                  />
                  Sector performance
                </CardTitle>
                <CardDescription>
                  Aggregate monthly revenue by sector, with YoY growth.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Sort:</span>
                <Badge variant="secondary" className="h-5 text-[10px]">
                  Revenue
                </Badge>
                <Badge variant="outline" className="h-5 text-[10px]">
                  Growth
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SectorPerformanceChart />
            <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 sm:grid-cols-4">
              <SectorStat label="Top growth" value="AI / SaaS" delta="+211%" />
              <SectorStat
                label="Top revenue"
                value="FinTech"
                delta="$980K MRR"
              />
              <SectorStat
                label="Most-active"
                value="HealthTech"
                delta="92% on-time"
              />
              <SectorStat
                label="Watchlist"
                value="Mobility"
                delta="2 at-risk"
                tone="warn"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon
                icon={PieChart01Icon}
                className="size-4 text-primary"
              />
              Health distribution
            </CardTitle>
            <CardDescription>
              Across the {ACTIVE_VS_RISK.total} startups currently in program.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <HealthDistributionChart />
            <ul className="flex flex-col gap-1.5 text-[11px]">
              <HealthLegendRow
                color="var(--chart-1)"
                label="Healthy"
                value="38"
                tone="ok"
              />
              <HealthLegendRow
                color="var(--chart-3)"
                label="Stable"
                value="24"
                tone="ok"
              />
              <HealthLegendRow
                color="var(--chart-4)"
                label="Watch"
                value="11"
                tone="warn"
              />
              <HealthLegendRow
                color="var(--destructive)"
                label="At-risk"
                value="6"
                tone="bad"
              />
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Engagement heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FireIcon}
                  className="size-4 text-amber-500"
                />
                Engagement heatmap
              </CardTitle>
              <CardDescription>
                Submissions filed per day across the portfolio — last 12 weeks.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Less</span>
              {HEATMAP_TINT.map((c, i) => (
                <span
                  key={i}
                  className={`size-3 rounded-sm ring-1 ring-foreground/5 ${c}`}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex flex-col justify-between py-1 text-[10px] text-muted-foreground">
              {HEATMAP_DAYS.map((d) => (
                <span key={d} className="leading-none">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid flex-1 grid-cols-12 gap-1.5">
              {HEATMAP_DATA.map((week, w) => (
                <div key={w} className="grid grid-rows-7 gap-1.5">
                  {week.map((v, d) => (
                    <span
                      key={d}
                      title={`${HEATMAP_DAYS[d]} W${w + 1} · ${v} submissions`}
                      className={`aspect-square rounded-sm ring-1 ring-foreground/5 ${HEATMAP_TINT[v]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-3">
            <HeatStat
              icon={FlashIcon}
              label="Peak day"
              value="Tue · 24 subs"
              hint="Day before monthly deadline"
            />
            <HeatStat
              icon={Calendar01Icon}
              label="Most-active week"
              value="W12"
              hint="42 submissions filed"
            />
            <HeatStat
              icon={IdeaIcon}
              label="Pattern"
              value="Mon–Thu dominates"
              hint="Weekend volume < 7%"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pattern detection */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="cn-font-heading flex items-center gap-2 text-base font-semibold tracking-tight">
              <HugeiconsIcon
                icon={SparklesIcon}
                className="size-4 text-primary"
              />
              Pattern detection
            </h2>
            <p className="text-xs text-muted-foreground">
              Surfaced from historical portfolio data — confidence reflects
              sample size and signal strength.
            </p>
          </div>
          <Badge
            variant="outline"
            className="gap-1 border-border/70 text-[10px]"
          >
            3 new this week
          </Badge>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {PATTERN_INSIGHTS.map((p) => (
            <Card
              key={p.title}
              className="transition hover:ring-foreground/30"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${p.tint}`}
                  >
                    <HugeiconsIcon icon={p.icon} className="size-4" />
                  </span>
                  <div className="flex-1">
                    <CardTitle className="text-[13px] leading-tight">
                      {p.title}
                    </CardTitle>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="flex flex-col gap-2 text-[11px]">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 border-t border-border/60 pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </span>
                  <Progress value={p.confidence} className="h-1.5 flex-1" />
                  <span className="text-[11px] font-medium tabular-nums">
                    {p.confidence}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Diversity & geography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={GlobalIcon} className="size-4 text-primary" />
            Diversity &amp; geography
          </CardTitle>
          <CardDescription>
            Founder demographics and distribution across the country — used in
            quarterly diversity reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Gender */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Founder gender
              </span>
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <HugeiconsIcon icon={MaleSymbolIcon} className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tabular-nums">
                      57%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Male
                    </span>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="flex flex-1 items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-pink-500/15 text-pink-600 dark:text-pink-400">
                    <HugeiconsIcon icon={FemaleSymbolIcon} className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tabular-nums">
                      43%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Female
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                <span className="bg-blue-500" style={{ width: "57%" }} />
                <span className="bg-pink-500" style={{ width: "43%" }} />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Female-founded share is up{" "}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +8 pts
                </span>{" "}
                YoY — among the highest in MENA accelerators.
              </p>
            </div>

            {/* Nationality */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Founder nationality mix
              </span>
              <ul className="flex flex-col gap-2.5">
                {NATIONALITY_DIST.map((n) => (
                  <li key={n.label} className="flex items-center gap-3">
                    <span className="w-32 text-[11px] text-foreground/80">
                      {n.label}
                    </span>
                    <Progress value={n.pct} className="h-1.5 flex-1" />
                    <span className="w-9 text-right text-[11px] font-medium tabular-nums">
                      {n.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Region */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Region distribution
              </span>
              <ul className="flex flex-col gap-2">
                {REGION_DIST.map((r) => (
                  <li
                    key={r.region}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-[12px]">
                      <HugeiconsIcon
                        icon={MapPinIcon}
                        className="size-3.5 text-muted-foreground"
                      />
                      {r.region}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {r.count}
                      </span>
                      <Badge
                        variant="outline"
                        className="h-4 border-transparent bg-primary/10 text-[10px] text-primary"
                      >
                        {r.pct}%
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved views */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={BookmarkAdd02Icon}
                  className="size-4 text-muted-foreground"
                />
                Saved views
              </CardTitle>
              <CardDescription>
                Bookmark filter combinations and share them with the team.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <HugeiconsIcon icon={BookmarkAdd02Icon} className="size-3.5" />
              New view
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-3">
            {SAVED_VIEWS.map((v) => (
              <li
                key={v.title}
                className="group flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <HugeiconsIcon icon={v.icon} className="size-4" />
                </span>
                <div className="flex-1 overflow-hidden">
                  <div className="line-clamp-1 text-xs font-medium">
                    {v.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {v.by} · {v.when}
                  </div>
                </div>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  className="size-3.5 text-muted-foreground transition group-hover:text-primary"
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="text-foreground/80">{label}</span>
    </span>
  )
}

function HealthLegendRow({
  color,
  label,
  value,
  tone,
}: {
  color: string
  label: string
  value: string
  tone: "ok" | "warn" | "bad"
}) {
  const toneClass =
    tone === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400"
  return (
    <li className="flex items-center gap-2">
      <span
        className="size-2 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="flex-1 text-foreground/80">{label}</span>
      <span className={`tabular-nums font-medium ${toneClass}`}>{value}</span>
    </li>
  )
}

function SectorStat({
  label,
  value,
  delta,
  tone = "ok",
}: {
  label: string
  value: string
  delta: string
  tone?: "ok" | "warn"
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-[13px] font-semibold">{value}</span>
      <span
        className={`text-[10px] tabular-nums ${
          tone === "warn"
            ? "text-amber-600 dark:text-amber-400"
            : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {delta}
      </span>
    </div>
  )
}

function HeatStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: typeof FlashIcon
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4" />
      </span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[13px] font-semibold">{value}</span>
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      </div>
    </div>
  )
}
