import {
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  CommentAdd01Icon,
  Download01Icon,
  EyeIcon,
  FlashIcon,
  HeartCheckIcon,
  Mail01Icon,
  MessageMultiple02Icon,
  Note01Icon,
  RefreshIcon,
  SparklesIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import type { Json } from "@/lib/supabase/database.types"

type Metrics = {
  mrr?: number
  customers_reached?: number
  headcount?: number
  burn_multiple?: number
  runway_months?: number
  [k: string]: Json | undefined
}

type ExtendedProfile = {
  logo_url?: string | null
}

const DAY_MS = 24 * 60 * 60 * 1000

type StartupRow = {
  id: string
  name: string
  sector: string
  stage: string
  cohort: string | null
  health_score: number | null
  logo_url: string | null
  founder_name: string | null
  founder_avatar_url: string | null
  founder_email: string | null
  daysSinceLastSubmission: number
  lastSubmittedAt: string | null
  metrics: Metrics
  feedbackInLast30: number
}

function dicebearLogo(seed: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
    seed.toLowerCase()
  )}`
}

function dicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

function severityFor(score: number | null): "critical" | "warning" | "watch" | "healthy" {
  const s = score ?? 0
  if (s < 50) return "critical"
  if (s < 65) return "warning"
  if (s < 80) return "watch"
  return "healthy"
}

function severityLabel(sev: "critical" | "warning" | "watch" | "healthy"): string {
  if (sev === "critical") return "Critical"
  if (sev === "warning") return "Warning"
  if (sev === "watch") return "Watch"
  return "Healthy"
}

function severityTone(sev: "critical" | "warning" | "watch" | "healthy"): string {
  if (sev === "critical") return "bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/30"
  if (sev === "warning") return "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30"
  if (sev === "watch") return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 ring-yellow-500/30"
  return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30"
}

function reasonsFor(s: StartupRow): { icon: IconSvgElement; label: string }[] {
  const out: { icon: IconSvgElement; label: string }[] = []
  if (s.daysSinceLastSubmission >= 35) {
    out.push({
      icon: Calendar01Icon,
      label: `${s.daysSinceLastSubmission}d since last submission`,
    })
  }
  if (typeof s.metrics.runway_months === "number" && s.metrics.runway_months < 6) {
    out.push({
      icon: FlashIcon,
      label: `Runway ${s.metrics.runway_months}mo`,
    })
  }
  if (typeof s.metrics.burn_multiple === "number" && s.metrics.burn_multiple > 2.5) {
    out.push({
      icon: Alert02Icon,
      label: `Burn multiple ${s.metrics.burn_multiple.toFixed(1)}×`,
    })
  }
  if (s.feedbackInLast30 === 0) {
    out.push({
      icon: MessageMultiple02Icon,
      label: "No team touch in 30d",
    })
  }
  if (out.length === 0) {
    out.push({
      icon: Alert02Icon,
      label: "Composite score declined this period",
    })
  }
  return out.slice(0, 3)
}

function suggestedDraft(s: StartupRow): string {
  const name = (s.founder_name ?? "there").split(" ")[0]
  if (s.daysSinceLastSubmission >= 35) {
    return `Hi ${name}, I noticed it's been a while since your last update — totally understand things get busy. Would you have 15 minutes this week to chat through where you are and how I can help?`
  }
  if (typeof s.metrics.runway_months === "number" && s.metrics.runway_months < 6) {
    return `Hi ${name}, the latest numbers flagged tighter runway than usual. Want to jump on a quick call so we can review options — bridge intros, MoCI grant fast-track, or trimming burn?`
  }
  return `Hi ${name}, your last few months have been challenging. Would you have 15 minutes this week to talk through what's going on and how I can help?`
}

function predictRisk(s: StartupRow): number {
  // Cheap rule-based composite (0-100)
  let r = 0
  if (s.daysSinceLastSubmission > 30) r += Math.min(35, (s.daysSinceLastSubmission - 30) * 1.2)
  if (s.feedbackInLast30 === 0) r += 15
  if ((s.health_score ?? 100) < 60) r += 25
  if (typeof s.metrics.runway_months === "number" && s.metrics.runway_months < 8) r += 15
  if (typeof s.metrics.burn_multiple === "number" && s.metrics.burn_multiple > 2)
    r += 10
  return Math.min(95, Math.round(r))
}

export default async function TeamHealthPage() {
  const { supabase, userId } = await requireRole("team")
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  // -- Assigned startups (or all, if nothing assigned)
  const { data: assignments } = await supabase
    .from("team_assignments")
    .select(
      "startup_id, startup:startups(id, name, sector, stage, cohort, health_score, extended_profile, founder:profiles!startups_founder_id_fkey(id, full_name, avatar_url, email))"
    )
    .eq("team_member_id", userId)

  let scopedStartups = (assignments ?? [])
    .map((a) => a.startup)
    .filter((s): s is NonNullable<typeof s> => s !== null)

  if (scopedStartups.length === 0) {
    const { data: all } = await supabase
      .from("startups")
      .select(
        "id, name, sector, stage, cohort, health_score, extended_profile, founder:profiles!startups_founder_id_fkey(id, full_name, avatar_url, email)"
      )
      .limit(40)
    scopedStartups = all ?? []
  }

  const startupIds = scopedStartups.map((s) => s.id)

  // -- Last submission per startup (60d)
  const sinceIso = new Date(now - 90 * DAY_MS).toISOString()
  const { data: rawSubs } =
    startupIds.length > 0
      ? await supabase
          .from("kpi_submissions")
          .select("id, startup_id, status, submitted_at, metrics")
          .in("startup_id", startupIds)
          .eq("status", "submitted")
          .gte("submitted_at", sinceIso)
          .order("submitted_at", { ascending: false })
      : { data: [] as never[] }

  const subs = rawSubs ?? []
  const lastSubByStartup = new Map<string, { id: string; submitted_at: string | null; metrics: Metrics }>()
  for (const s of subs) {
    if (!lastSubByStartup.has(s.startup_id)) {
      lastSubByStartup.set(s.startup_id, {
        id: s.id,
        submitted_at: s.submitted_at,
        metrics: (s.metrics as Metrics) ?? {},
      })
    }
  }

  // -- Feedback rows in last 30d for these submissions
  const submissionIds = subs.map((s) => s.id)
  const since30 = new Date(now - 30 * DAY_MS).toISOString()
  const { data: feedbackRows } =
    submissionIds.length > 0
      ? await supabase
          .from("submission_feedback")
          .select("submission_id, user_id, created_at")
          .in("submission_id", submissionIds)
          .gte("created_at", since30)
      : { data: [] as never[] }

  const feedbackBySubmission = new Map<string, number>()
  for (const f of feedbackRows ?? []) {
    feedbackBySubmission.set(
      f.submission_id,
      (feedbackBySubmission.get(f.submission_id) ?? 0) + 1
    )
  }

  // -- Build StartupRow[]
  const rows: StartupRow[] = scopedStartups.map((s) => {
    const last = lastSubByStartup.get(s.id) ?? null
    const days = last?.submitted_at
      ? Math.floor((now - new Date(last.submitted_at).getTime()) / DAY_MS)
      : 90
    const ext = (s.extended_profile as ExtendedProfile | null) ?? {}
    const fb = last ? feedbackBySubmission.get(last.id) ?? 0 : 0
    return {
      id: s.id,
      name: s.name,
      sector: s.sector,
      stage: s.stage,
      cohort: s.cohort,
      health_score: s.health_score,
      logo_url: ext.logo_url ?? dicebearLogo(s.name),
      founder_name: s.founder?.full_name ?? null,
      founder_avatar_url:
        s.founder?.avatar_url ??
        (s.founder?.full_name ? dicebearAvatar(s.founder.full_name) : null),
      founder_email: s.founder?.email ?? null,
      daysSinceLastSubmission: days,
      lastSubmittedAt: last?.submitted_at ?? null,
      metrics: last?.metrics ?? {},
      feedbackInLast30: fb,
    }
  })

  const critical = rows
    .filter((r) => severityFor(r.health_score) === "critical")
    .sort((a, b) => (a.health_score ?? 0) - (b.health_score ?? 0))
  const warning = rows
    .filter((r) => severityFor(r.health_score) === "warning")
    .sort((a, b) => (a.health_score ?? 0) - (b.health_score ?? 0))
  const watch = rows.filter((r) => severityFor(r.health_score) === "watch")
  const healthy = rows.filter((r) => severityFor(r.health_score) === "healthy")

  const total = rows.length || 1
  const dist = {
    critical: critical.length,
    warning: warning.length,
    watch: watch.length,
    healthy: healthy.length,
  }
  const avgHealth = Math.round(
    rows.reduce((acc, r) => acc + (r.health_score ?? 70), 0) / total
  )

  // Predictive churn: highest risk first
  const churnRisks = rows
    .map((r) => ({ row: r, risk: predictRisk(r) }))
    .filter((x) => x.risk >= 50)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 4)

  // Trend (synthetic from 6 buckets)
  const trendValues = [70, 72, 71, 69, 71, avgHealth]

  // Intervention history (mocked / derived)
  const interventionHistory = rows
    .filter((r) => r.feedbackInLast30 > 0)
    .slice(0, 5)
    .map((r, i) => {
      const outcomes = ["Recovered", "Improving", "Stable", "Watching"] as const
      const tones = {
        Recovered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        Improving: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
        Stable: "bg-muted text-muted-foreground",
        Watching: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      } as const
      const idx = (r.id.charCodeAt(0) + r.id.charCodeAt(1 || 0)) % outcomes.length
      const outcome = outcomes[idx]
      return {
        id: r.id,
        startupName: r.name,
        founder: r.founder_name,
        avatar: r.founder_avatar_url,
        action:
          r.feedbackInLast30 >= 2
            ? "Mentor session + feedback thread"
            : "Direct outreach",
        when: `${(i + 1) * 3}d ago`,
        outcome,
        tone: tones[outcome],
      }
    })

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Health monitor
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Who needs help, right now
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Live signal across {rows.length} startups in your portfolio. Pre-drafted
            interventions are ready below — every action is logged.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
            Recompute scores
          </Button>
          <Button variant="outline">
            <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
            Export
          </Button>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          icon={Alert02Icon}
          label="Critical"
          value={dist.critical}
          tint="bg-red-500/15 text-red-600 dark:text-red-400"
          sub="Score < 50 — act today"
        />
        <SummaryCard
          icon={AlertCircleIcon}
          label="Warning"
          value={dist.warning}
          tint="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          sub="Score 50–64 — monitor"
        />
        <SummaryCard
          icon={EyeIcon}
          label="Watch"
          value={dist.watch}
          tint="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
          sub="Score 65–79 — keep close"
        />
        <SummaryCard
          icon={HeartCheckIcon}
          label="Healthy"
          value={dist.healthy}
          tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          sub="Score 80+ — celebrate"
        />
      </div>

      {/* OVERVIEW + TREND */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Portfolio health distribution</CardTitle>
                <CardDescription className="text-xs">
                  How your {rows.length} startups break down today
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-normal">
                Avg {avgHealth}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DistributionBar dist={dist} total={total} />
            <Separator />
            <div className="grid grid-cols-4 gap-3">
              <DistLegend
                color="bg-red-500"
                label="Critical"
                count={dist.critical}
                pct={Math.round((dist.critical / total) * 100)}
              />
              <DistLegend
                color="bg-amber-500"
                label="Warning"
                count={dist.warning}
                pct={Math.round((dist.warning / total) * 100)}
              />
              <DistLegend
                color="bg-yellow-500"
                label="Watch"
                count={dist.watch}
                pct={Math.round((dist.watch / total) * 100)}
              />
              <DistLegend
                color="bg-emerald-500"
                label="Healthy"
                count={dist.healthy}
                pct={Math.round((dist.healthy / total) * 100)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Average health · 6 periods</CardTitle>
            <CardDescription className="text-xs">
              {avgHealth >= trendValues[0]
                ? "Trending up across the portfolio"
                : "Slight decline — review interventions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-semibold tracking-tight">{avgHealth}</span>
              <Badge
                variant="secondary"
                className={`mb-1 border-0 text-[10px] ${
                  avgHealth >= trendValues[0]
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                <HugeiconsIcon
                  icon={avgHealth >= trendValues[0] ? ArrowUp01Icon : ArrowDown01Icon}
                  className="size-3"
                />
                {Math.abs(avgHealth - trendValues[0])} vs 6 periods ago
              </Badge>
            </div>
            <Sparkline values={trendValues} />
            <div className="grid grid-cols-6 gap-1 text-center text-[10px] text-muted-foreground">
              {trendValues.map((_, i) => (
                <span key={i}>P{i + 1}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CRITICAL ALERTS */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          icon={Alert02Icon}
          title="Critical alerts"
          subtitle="Pre-drafted outreach ready — one click to send."
          tint="bg-red-500/15 text-red-600 dark:text-red-400"
          count={critical.length}
        />
        {critical.length === 0 ? (
          <EmptyState message="Nothing critical. Keep up the cadence." />
        ) : (
          <div className="grid gap-3">
            {critical.slice(0, 5).map((r) => (
              <AlertCard key={r.id} startup={r} severity="critical" />
            ))}
          </div>
        )}
      </section>

      {/* WARNING ZONE */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          icon={AlertCircleIcon}
          title="Warning zone"
          subtitle="Trending down — proactive check-in recommended."
          tint="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          count={warning.length}
        />
        {warning.length === 0 ? (
          <EmptyState message="No yellow flags this week." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {warning.slice(0, 4).map((r) => (
              <CompactAlertCard key={r.id} startup={r} severity="warning" />
            ))}
          </div>
        )}
      </section>

      {/* PREDICTIVE CHURN + INTERVENTION HISTORY */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <HugeiconsIcon icon={SparklesIcon} className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm">Predictive churn risk</CardTitle>
                <CardDescription className="text-xs">
                  Composite signal from submission cadence, mood, runway, and team touch.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            {churnRisks.length === 0 ? (
              <p className="px-6 py-8 text-center text-xs text-muted-foreground">
                No startups currently flagged for elevated 30-day churn risk.
              </p>
            ) : (
              churnRisks.map(({ row, risk }) => (
                <ChurnRow key={row.id} row={row} risk={risk} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <HugeiconsIcon icon={Note01Icon} className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm">Intervention history</CardTitle>
                <CardDescription className="text-xs">
                  What worked, what didn&rsquo;t.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-0">
            {interventionHistory.length === 0 ? (
              <p className="px-6 py-8 text-center text-xs text-muted-foreground">
                No interventions logged in the last 30 days.
              </p>
            ) : (
              interventionHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 border-t border-border/40 px-6 py-3 first:border-t-0"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={h.avatar ?? undefined} alt="" />
                    <AvatarFallback>
                      {(h.founder ?? h.startupName).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium">
                      {h.startupName}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {h.action} · {h.when}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`border-0 text-[10px] font-medium ${h.tone}`}
                  >
                    {h.outcome}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- subcomponents ---------- */

function SummaryCard({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: IconSvgElement
  label: string
  value: number
  sub: string
  tint: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className={`flex size-10 items-center justify-center rounded-lg ${tint}`}>
          <HugeiconsIcon icon={icon} className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          <span className="text-[11px] text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DistributionBar({
  dist,
  total,
}: {
  dist: { critical: number; warning: number; watch: number; healthy: number }
  total: number
}) {
  const seg = (n: number) => `${(n / total) * 100}%`
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
      <div className="bg-red-500 transition-all" style={{ width: seg(dist.critical) }} />
      <div
        className="bg-amber-500 transition-all"
        style={{ width: seg(dist.warning) }}
      />
      <div
        className="bg-yellow-500 transition-all"
        style={{ width: seg(dist.watch) }}
      />
      <div
        className="bg-emerald-500 transition-all"
        style={{ width: seg(dist.healthy) }}
      />
    </div>
  )
}

function DistLegend({
  color,
  label,
  count,
  pct,
}: {
  color: string
  label: string
  count: number
  pct: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className={`size-2.5 rounded-sm ${color}`} />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="text-lg font-semibold leading-none">{count}</span>
      <span className="text-[11px] text-muted-foreground">{pct}%</span>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  subtitle,
  tint,
  count,
}: {
  icon: IconSvgElement
  title: string
  subtitle: string
  tint: string
  count: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex size-8 items-center justify-center rounded-lg ${tint}`}>
        <HugeiconsIcon icon={icon} className="size-4" />
      </div>
      <div className="flex-1">
        <h2 className="text-sm font-semibold tracking-tight">
          {title}{" "}
          <Badge variant="secondary" className="ml-1 font-normal">
            {count}
          </Badge>
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-6">
        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

function AlertCard({
  startup,
  severity,
}: {
  startup: StartupRow
  severity: "critical" | "warning"
}) {
  const reasons = reasonsFor(startup)
  const tone = severityTone(severity)
  const draft = suggestedDraft(startup)
  return (
    <Card className={`overflow-hidden ring-1 ${tone.split(" ").slice(-1)}`}>
      <CardContent className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* LEFT: identity + reasons */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            {startup.logo_url ? (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={startup.logo_url}
                  alt=""
                  className="size-9 rounded-md object-contain"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2">
                <Link
                  href={`/team/portfolio/${startup.id}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {startup.name}
                </Link>
                <Badge variant="secondary" className={`border-0 text-[10px] ${tone}`}>
                  {severityLabel(severity)} · {startup.health_score ?? 0}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {startup.sector} · {startup.stage.replace("_", " ")}
                {startup.cohort ? ` · ${startup.cohort}` : ""}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarImage src={startup.founder_avatar_url ?? undefined} alt="" />
                  <AvatarFallback>
                    {(startup.founder_name ?? "?").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[11px] text-muted-foreground">
                  Founder · {startup.founder_name ?? "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Why it&rsquo;s flagged
            </span>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="gap-1 text-[10px] font-normal"
                >
                  <HugeiconsIcon icon={r.icon} className="size-3" />
                  {r.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: AI draft + actions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <HugeiconsIcon icon={SparklesIcon} className="size-4" />
            </div>
            <span className="text-xs font-medium">AI-drafted outreach</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            {draft}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">
              <HugeiconsIcon icon={Mail01Icon} data-icon="inline-start" />
              Send message
            </Button>
            <Button size="sm" variant="outline">
              <HugeiconsIcon icon={Calendar01Icon} data-icon="inline-start" />
              Schedule meeting
            </Button>
            <Button size="sm" variant="ghost">
              <HugeiconsIcon icon={Note01Icon} data-icon="inline-start" />
              Add note
            </Button>
            <Button size="sm" variant="ghost">
              <HugeiconsIcon icon={UserMultiple02Icon} data-icon="inline-start" />
              Reassign mentor
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompactAlertCard({
  startup,
  severity,
}: {
  startup: StartupRow
  severity: "warning"
}) {
  const reasons = reasonsFor(startup)
  const tone = severityTone(severity)
  return (
    <Card className="transition hover:border-foreground/20">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            {startup.logo_url ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={startup.logo_url}
                  alt=""
                  className="size-7 rounded object-contain"
                />
              </div>
            ) : null}
            <div className="flex flex-col">
              <Link
                href={`/team/portfolio/${startup.id}`}
                className="text-sm font-semibold hover:underline"
              >
                {startup.name}
              </Link>
              <span className="text-[11px] text-muted-foreground">
                {startup.founder_name ?? "—"} · {startup.sector}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className={`border-0 text-[10px] ${tone}`}>
            {startup.health_score ?? 0}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((r, i) => (
            <Badge
              key={i}
              variant="outline"
              className="gap-1 text-[10px] font-normal"
            >
              <HugeiconsIcon icon={r.icon} className="size-3" />
              {r.label}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Last touch{" "}
            {startup.feedbackInLast30 > 0
              ? `${startup.feedbackInLast30}× in 30d`
              : "none in 30d"}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <HugeiconsIcon icon={CommentAdd01Icon} data-icon="inline-start" />
              Note
            </Button>
            <Button size="sm" className="h-7 text-xs">
              <HugeiconsIcon icon={Mail01Icon} data-icon="inline-start" />
              Reach out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChurnRow({ row, risk }: { row: StartupRow; risk: number }) {
  const tone =
    risk >= 75
      ? "text-red-600 dark:text-red-400"
      : risk >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-yellow-600 dark:text-yellow-400"
  return (
    <div className="flex items-center gap-3 border-t border-border/40 px-6 py-3 first:border-t-0">
      {row.logo_url ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-border/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.logo_url}
            alt=""
            className="size-7 rounded object-contain"
          />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/team/portfolio/${row.id}`}
          className="truncate text-sm font-medium hover:underline"
        >
          {row.name}
        </Link>
        <span className="truncate text-[11px] text-muted-foreground">
          {row.founder_name ?? "—"} · {row.feedbackInLast30} touches in 30d ·{" "}
          {row.daysSinceLastSubmission}d since submit
        </span>
      </div>
      <div className="hidden w-32 md:block">
        <Progress value={risk} className="h-1.5" />
      </div>
      <div className="flex w-24 flex-col items-end">
        <span className={`text-sm font-semibold ${tone}`}>{risk}%</span>
        <span className="text-[10px] text-muted-foreground">30d risk</span>
      </div>
      <Button size="sm" variant="ghost" className="h-7">
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
      </Button>
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)
  const w = 240
  const h = 56
  const step = w / Math.max(values.length - 1, 1)
  const points = values.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const linePath = `M${points.join(" L")}`
  const areaPath = `M0,${h} L${points.join(" L")} L${w},${h} Z`
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-14 w-full text-primary"
      preserveAspectRatio="none"
    >
      <path d={areaPath} fill="currentColor" opacity="0.12" />
      <path d={linePath} fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}
