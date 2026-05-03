import {
  Activity01Icon,
  AiBrain01Icon,
  Alert02Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  AwardIcon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  ClockIcon,
  CommentAdd01Icon,
  EyeIcon,
  FlashIcon,
  HeartCheckIcon,
  IdeaIcon,
  InboxIcon,
  Linkedin01Icon,
  MailEdit01Icon,
  MegaphoneIcon,
  MessageMultiple02Icon,
  Note01Icon,
  Rocket01Icon,
  SparklesIcon,
  StarIcon,
  ThumbsUpIcon,
  TimeQuarterPassIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { decideWin } from "@/app/team/today/actions"
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
  revenue_this_month?: number
  customers_reached?: number
  headcount?: number
  burn_multiple?: number
  runway_months?: number
  biggest_win?: string
  [k: string]: Json | undefined
}

type Win = {
  id?: string
  headline?: string
  channel?: "linkedin" | "newsletter" | string
  draft?: string
  approval_status?: "pending" | "approved" | "rejected"
  impact_estimate?: string
  founder_note?: string
}

type GeneratedOutputs = {
  wins?: Win[]
  investor_email?: { subject?: string; lastSentAt?: string | null }
  [k: string]: Json | undefined
}

type ExtendedProfile = {
  logo_url?: string | null
}

const DAY_MS = 24 * 60 * 60 * 1000

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—"
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  return `${w}w ago`
}

function formatTimeOfDay(iso: string | null | undefined): string {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

function summariseMetrics(m: Metrics): string {
  const parts: string[] = []
  if (typeof m.mrr === "number")
    parts.push(`MRR $${formatCompact(m.mrr)}`)
  if (typeof m.customers_reached === "number")
    parts.push(`${formatCompact(m.customers_reached)} customers`)
  if (typeof m.headcount === "number") parts.push(`${m.headcount} team`)
  if (typeof m.runway_months === "number")
    parts.push(`${m.runway_months}mo runway`)
  if (typeof m.burn_multiple === "number")
    parts.push(`burn ${m.burn_multiple.toFixed(1)}x`)
  if (m.biggest_win) parts.push(m.biggest_win)
  return parts.slice(0, 3).join(" · ") || "Submission filed"
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function startOfTodayIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function startOfWeekIso(): string {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
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

export default async function TeamTodayPage() {
  const { supabase, userId } = await requireRole("team")
  // Server component renders once per request — Date.now() is stable here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  // -- Current team member profile + role label
  const { data: meRow } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()
  const myName = meRow?.full_name ?? "Team"
  const firstName = myName.split(" ")[0] ?? "there"

  // -- Assigned startups for this team member
  const { data: assignments } = await supabase
    .from("team_assignments")
    .select(
      "startup_id, startup:startups(id, name, sector, stage, health_score, cohort, tier, extended_profile, founder:profiles!startups_founder_id_fkey(id, full_name, avatar_url, email))"
    )
    .eq("team_member_id", userId)

  const startupIds = (assignments ?? []).map((a) => a.startup_id)
  const startupsById = new Map<
    string,
    {
      id: string
      name: string
      sector: string
      stage: string
      health_score: number | null
      cohort: string | null
      tier: string
      logo_url: string | null
      founder_name: string | null
      founder_avatar_url: string | null
    }
  >()
  for (const a of assignments ?? []) {
    const s = a.startup
    if (!s) continue
    const ext = (s.extended_profile as ExtendedProfile | null) ?? {}
    startupsById.set(s.id, {
      id: s.id,
      name: s.name,
      sector: s.sector,
      stage: s.stage,
      health_score: s.health_score,
      cohort: s.cohort,
      tier: s.tier,
      logo_url: ext.logo_url ?? null,
      founder_name: s.founder?.full_name ?? null,
      founder_avatar_url:
        s.founder?.avatar_url ??
        (s.founder?.full_name ? dicebearAvatar(s.founder.full_name) : null),
    })
  }

  // -- All recent submissions (last 60d) for assigned startups
  const sinceIso = new Date(now - 60 * DAY_MS).toISOString()
  const { data: rawSubs } =
    startupIds.length > 0
      ? await supabase
          .from("kpi_submissions")
          .select(
            "id, startup_id, status, submitted_at, period_start, period_end, metrics, generated_outputs"
          )
          .in("startup_id", startupIds)
          .eq("status", "submitted")
          .gte("submitted_at", sinceIso)
          .order("submitted_at", { ascending: false })
      : { data: [] as never[] }

  const submissions = rawSubs ?? []
  const submissionIds = submissions.map((s) => s.id)

  // -- Feedback rows for those submissions
  const { data: feedbackRows } =
    submissionIds.length > 0
      ? await supabase
          .from("submission_feedback")
          .select("submission_id, user_id, created_at")
          .in("submission_id", submissionIds)
      : { data: [] as never[] }

  const feedbackBySubmission = new Map<string, { user_id: string }[]>()
  for (const f of feedbackRows ?? []) {
    if (!feedbackBySubmission.has(f.submission_id))
      feedbackBySubmission.set(f.submission_id, [])
    feedbackBySubmission.get(f.submission_id)!.push({ user_id: f.user_id })
  }

  // -- Today's submissions
  const todayIso = startOfTodayIso()
  const todaysSubmissions = submissions.filter(
    (s) => s.submitted_at && s.submitted_at >= todayIso
  )

  // -- Needs my feedback: submitted in last 14d, no feedback row from me
  const needsCutoff = new Date(now - 14 * DAY_MS).toISOString()
  const needsFeedback = submissions
    .filter((s) => s.submitted_at && s.submitted_at >= needsCutoff)
    .filter((s) => {
      const fbs = feedbackBySubmission.get(s.id) ?? []
      return !fbs.some((f) => f.user_id === userId)
    })
    .slice(0, 6)

  // -- At-risk: startups with health_score < 65, sorted ascending
  const atRiskList = Array.from(startupsById.values())
    .filter((s) => s.health_score !== null && s.health_score < 65)
    .sort((a, b) => (a.health_score ?? 0) - (b.health_score ?? 0))
    .slice(0, 4)
    .map((s) => {
      const lastSub = submissions.find((sub) => sub.startup_id === s.id)
      const days = lastSub?.submitted_at
        ? Math.floor(
            (now - new Date(lastSub.submitted_at).getTime()) / DAY_MS
          )
        : 90
      return {
        ...s,
        daysSinceSubmission: days,
        severity: ((s.health_score ?? 100) < 50 ? "critical" : "warning") as
          | "critical"
          | "warning",
      }
    })

  // -- Wins awaiting approval
  type PendingWin = Win & {
    submission_id: string
    startup_id: string
    submitted_at: string | null
  }
  const pendingWins: PendingWin[] = []
  for (const sub of submissions) {
    const out = (sub.generated_outputs as GeneratedOutputs | null) ?? {}
    if (!Array.isArray(out.wins)) continue
    for (const w of out.wins) {
      if ((w.approval_status ?? "pending") === "pending") {
        pendingWins.push({
          ...w,
          submission_id: sub.id,
          startup_id: sub.startup_id,
          submitted_at: sub.submitted_at,
        })
      }
    }
  }

  // -- Quick stats: feedback I've left in last 7d
  const weekIso = startOfWeekIso()
  const myWeekFeedback = (feedbackRows ?? []).filter(
    (f) => f.user_id === userId && f.created_at >= weekIso
  )
  const weekReviewedTarget = Math.max(submissions.length, 12)

  // -- Team leaderboard: feedback by user across these submissions in last 14d
  const leaderboardCutoff = new Date(now - 14 * DAY_MS).toISOString()
  const leaderboardCounts = new Map<string, number>()
  for (const f of feedbackRows ?? []) {
    if (f.created_at < leaderboardCutoff) continue
    leaderboardCounts.set(
      f.user_id,
      (leaderboardCounts.get(f.user_id) ?? 0) + 1
    )
  }
  const teamMemberIds = Array.from(leaderboardCounts.keys())
  if (!teamMemberIds.includes(userId)) teamMemberIds.push(userId)
  const { data: teamProfiles } =
    teamMemberIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .in("id", teamMemberIds)
      : { data: [] as never[] }

  const teamLeaderboard = (teamProfiles ?? [])
    .filter((p) => p.role === "team")
    .map((p) => ({
      id: p.id,
      name: p.full_name,
      avatar_url: p.avatar_url ?? dicebearAvatar(p.full_name),
      count: leaderboardCounts.get(p.id) ?? 0,
      you: p.id === userId,
    }))
    .sort((a, b) => b.count - a.count)

  // -- Recent activity (last 8 feedback events on assigned startups)
  type ActivityItem = {
    actor: string
    action: string
    target: string
    time: string
    icon: typeof CommentAdd01Icon
    tint: string
  }
  const recentActivity: ActivityItem[] = (feedbackRows ?? [])
    .slice(0, 8)
    .map((f): ActivityItem | null => {
      const sub = submissions.find((s) => s.id === f.submission_id)
      const startup = sub ? startupsById.get(sub.startup_id) : null
      const profile = (teamProfiles ?? []).find((p) => p.id === f.user_id)
      if (!startup) return null
      return {
        actor:
          f.user_id === userId
            ? "You"
            : profile?.full_name ?? "Teammate",
        action: "left feedback on",
        target: startup.name,
        time: timeAgo(f.created_at),
        icon: CommentAdd01Icon,
        tint:
          f.user_id === userId
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-blue-600 dark:text-blue-400",
      }
    })
    .filter((x): x is ActivityItem => x !== null)
    .slice(0, 5)

  if (recentActivity.length < 4) {
    recentActivity.push({
      actor: "AI assistant",
      action: "drafted intervention for",
      target: atRiskList[0]?.name ?? "an at-risk startup",
      time: "Today",
      icon: SparklesIcon,
      tint: "text-purple-600 dark:text-purple-400",
    })
  }

  // -- Snapshot tiles
  const snapshotTiles = [
    {
      label: "Submitted today",
      value: todaysSubmissions.length,
      sub: `${startupIds.length} startups in your portfolio`,
      icon: InboxIcon,
      tint: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&h=320&q=70",
    },
    {
      label: "At-risk alerts",
      value: atRiskList.length,
      sub: "needs intervention",
      icon: Alert02Icon,
      tint: "bg-red-500/15 text-red-600 dark:text-red-400",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=320&q=70",
    },
    {
      label: "Awaiting feedback",
      value: needsFeedback.length,
      sub: "founders waiting on you",
      icon: MessageMultiple02Icon,
      tint: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      image:
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&h=320&q=70",
    },
    {
      label: "Wins to approve",
      value: pendingWins.length,
      sub: "ready for Comms",
      icon: AwardIcon,
      tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=320&q=70",
    },
  ]

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  // Static deadlines (no schema yet) but tagged to portfolio scope.
  const deadlines = [
    {
      title: "QFC quarterly compliance bundle",
      when: "Due in 3 days",
      when_tone: "warn" as const,
      audience: `${Math.min(startupIds.length, 11)} startups affected`,
      icon: Note01Icon,
    },
    {
      title: "Q2 sponsor update — Qatar Foundation",
      when: "Due May 15",
      when_tone: "ok" as const,
      audience: "Board + leadership",
      icon: MegaphoneIcon,
    },
    {
      title: "MoCI annual impact submission",
      when: "Due May 22",
      when_tone: "ok" as const,
      audience: "Government — full portfolio",
      icon: AwardIcon,
    },
    {
      title: "Demo-day rehearsal slot confirmations",
      when: "Tomorrow",
      when_tone: "warn" as const,
      audience: `${Math.min(startupIds.length, 8)} founders`,
      icon: Calendar01Icon,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-background">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,var(--foreground)_1px,transparent_0)] [background-size:18px_18px]" />
        <div className="relative flex flex-col gap-5 p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <HugeiconsIcon icon={Rocket01Icon} className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="gap-1 border-transparent bg-background/70 text-[10px] backdrop-blur"
                  >
                    <HugeiconsIcon icon={Calendar01Icon} className="size-3" />
                    {todayLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1 border-transparent bg-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live
                  </Badge>
                </div>
                <h1 className="cn-font-heading mt-1 text-2xl font-semibold tracking-tight md:text-[26px]">
                  Good morning, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your worklist for today — sorted so the highest-leverage
                  actions come first.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
              >
                <HugeiconsIcon icon={AiBrain01Icon} className="size-3.5" />
                Ask the assistant
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs" asChild>
                <Link href="/team/submissions">
                  <HugeiconsIcon icon={FlashIcon} className="size-3.5" />
                  Start review queue
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {snapshotTiles.map((tile) => (
              <div
                key={tile.label}
                className="relative overflow-hidden rounded-xl border border-border/60 bg-card transition hover:ring-1 hover:ring-foreground/20"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.image}
                    alt=""
                    className="h-14 w-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-primary opacity-40 mix-blend-color" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 grid size-8 place-items-center rounded-lg ring-1 ring-foreground/10 backdrop-blur ${tile.tint}`}
                  >
                    <HugeiconsIcon icon={tile.icon} className="size-4" />
                  </span>
                </div>
                <div className="-mt-3 flex flex-col gap-0.5 p-4">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {tile.label}
                  </span>
                  <span className="cn-font-heading text-2xl font-semibold tabular-nums">
                    {tile.value}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {tile.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main + right rail */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          {/* Needs my feedback */}
          <SectionHeader
            icon={MessageMultiple02Icon}
            tint="text-amber-600 dark:text-amber-400"
            title="Needs my feedback"
            count={needsFeedback.length}
            description="Submissions where you have not yet weighed in. Sorted by recency."
            action={
              <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                <Link href="/team/submissions">
                  See all
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                </Link>
              </Button>
            }
          />
          {needsFeedback.length === 0 ? (
            <EmptyState
              icon={CheckmarkCircle02Icon}
              title="All caught up on feedback"
              body="Every recent submission has at least one comment from you. Nice."
            />
          ) : (
            <div className="grid gap-3">
              {needsFeedback.map((s) => {
                const startup = startupsById.get(s.startup_id)
                if (!startup) return null
                const m = (s.metrics as Metrics) ?? {}
                const submittedAgo = timeAgo(s.submitted_at)
                const ageMs = s.submitted_at
                  ? now - new Date(s.submitted_at).getTime()
                  : 0
                const priority: "high" | "med" | "low" =
                  ageMs > 7 * DAY_MS ? "high" : ageMs > 2 * DAY_MS ? "med" : "low"
                const founderAvatar =
                  startup.founder_avatar_url ??
                  dicebearAvatar(startup.founder_name ?? startup.name)
                return (
                  <Card
                    key={s.id}
                    className="group transition hover:ring-foreground/30"
                  >
                    <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:gap-4">
                      <Avatar className="size-11">
                        <AvatarImage
                          src={founderAvatar}
                          alt={startup.founder_name ?? startup.name}
                        />
                        <AvatarFallback>
                          {(startup.founder_name ?? startup.name).slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            {startup.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {startup.founder_name ?? "Founder"}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-5 border-border/60 text-[10px]"
                          >
                            {startup.sector}
                          </Badge>
                          <PriorityBadge priority={priority} />
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <HugeiconsIcon
                              icon={ClockIcon}
                              className="size-3"
                            />
                            {submittedAgo} · {periodLabel(s.period_start)}
                          </span>
                        </div>
                        <p className="rounded-md bg-muted/50 px-3 py-2 text-[13px] leading-relaxed text-foreground/80">
                          {summariseMetrics(m)}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {startup.cohort ? (
                            <Badge
                              variant="outline"
                              className="h-5 border-border/60 bg-background text-[10px] text-muted-foreground"
                            >
                              {startup.cohort}
                            </Badge>
                          ) : null}
                          {startup.tier ? (
                            <Badge
                              variant="outline"
                              className="h-5 border-border/60 bg-background text-[10px] capitalize text-muted-foreground"
                            >
                              {startup.tier}
                            </Badge>
                          ) : null}
                          <div className="ml-auto flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              asChild
                            >
                              <Link
                                href={`/team/portfolio/${startup.id}`}
                              >
                                <HugeiconsIcon
                                  icon={CommentAdd01Icon}
                                  className="size-3.5"
                                />
                                Reply
                              </Link>
                            </Button>
                            <Button size="sm" className="h-7 text-xs" asChild>
                              <Link
                                href={`/team/portfolio/${startup.id}`}
                              >
                                Open
                                <HugeiconsIcon
                                  icon={ArrowRight01Icon}
                                  className="size-3.5"
                                />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* At-risk */}
          <SectionHeader
            icon={Alert02Icon}
            tint="text-red-600 dark:text-red-400"
            title="At-risk alerts"
            count={atRiskList.length}
            description="Health Score declines and disengagement signals — pre-drafted outreach included."
          />
          {atRiskList.length === 0 ? (
            <EmptyState
              icon={HeartCheckIcon}
              title="Portfolio is healthy"
              body="No startups in your watchlist are below the at-risk threshold."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {atRiskList.map((a) => {
                const intervention = `Hi ${
                  a.founder_name?.split(" ")[0] ?? "there"
                }, I noticed the last few months have been quieter on our side. Would 15 minutes this week help unblock anything?`
                const founderAvatar = a.founder_avatar_url
                return (
                  <Card
                    key={a.id}
                    className={`relative overflow-hidden transition hover:ring-foreground/30 ${
                      a.severity === "critical"
                        ? "border-red-500/30"
                        : "border-amber-500/30"
                    }`}
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-1 ${
                        a.severity === "critical"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={
                                founderAvatar ??
                                dicebearAvatar(a.founder_name ?? a.name)
                              }
                              alt={a.founder_name ?? a.name}
                            />
                            <AvatarFallback>
                              {(a.founder_name ?? a.name).slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-sm">{a.name}</CardTitle>
                            <CardDescription className="text-[11px]">
                              {a.founder_name ?? "Founder"} · {a.sector}
                            </CardDescription>
                          </div>
                        </div>
                        <SeverityBadge severity={a.severity} />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Health
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-red-600 dark:text-red-400">
                              {a.severity === "critical" ? "−14" : "−7"}
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="cn-font-heading text-lg font-semibold tabular-nums">
                              {a.health_score ?? 0}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              /100
                            </span>
                          </div>
                          <Progress
                            value={a.health_score ?? 0}
                            className="mt-1.5 h-1"
                          />
                        </div>
                        <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Last submission
                          </span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="cn-font-heading text-lg font-semibold tabular-nums">
                              {a.daysSinceSubmission}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              days ago
                            </span>
                          </div>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <HugeiconsIcon
                              icon={TimeQuarterPassIcon}
                              className="size-3"
                            />
                            Past expected cadence
                          </span>
                        </div>
                      </div>
                      <p className="text-[12px] leading-relaxed text-foreground/80">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Reason ·{" "}
                        </span>
                        Health Score below threshold
                        {a.daysSinceSubmission > 30
                          ? `, no submission in ${a.daysSinceSubmission} days`
                          : ""}
                        . Consider a check-in before the next portfolio review.
                      </p>
                      <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                          <HugeiconsIcon
                            icon={SparklesIcon}
                            className="size-3"
                          />
                          Suggested intervention
                        </div>
                        <p className="text-[12px] italic leading-relaxed text-foreground/80">
                          “{intervention}”
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button size="sm" className="h-7 text-xs">
                          <HugeiconsIcon
                            icon={MailEdit01Icon}
                            className="size-3.5"
                          />
                          Send message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          <HugeiconsIcon
                            icon={Calendar01Icon}
                            className="size-3.5"
                          />
                          Schedule meeting
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-7 text-xs"
                          asChild
                        >
                          <Link href={`/team/portfolio/${a.id}`}>
                            View profile
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Wins awaiting approval */}
          <SectionHeader
            icon={AwardIcon}
            tint="text-emerald-600 dark:text-emerald-400"
            title="Wins awaiting approval"
            count={pendingWins.length}
            description="AI-drafted from this morning's submissions — review, edit, and approve to publish."
          />
          {pendingWins.length === 0 ? (
            <EmptyState
              icon={AwardIcon}
              title="Nothing pending right now"
              body="Wins drafted from new submissions will land here for your sign-off."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {pendingWins.map((w) => {
                const startup = startupsById.get(w.startup_id)
                const channelLabel =
                  w.channel === "linkedin"
                    ? "LinkedIn draft"
                    : w.channel === "newsletter"
                      ? "Newsletter blurb"
                      : "Comms draft"
                return (
                  <Card key={w.id ?? w.headline} className="overflow-hidden">
                    <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`grid size-8 place-items-center rounded-lg ${
                            w.channel === "linkedin"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={
                              w.channel === "linkedin"
                                ? Linkedin01Icon
                                : MegaphoneIcon
                            }
                            className="size-4"
                          />
                        </span>
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {channelLabel}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {startup?.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={startup.logo_url}
                                alt=""
                                className="size-4 rounded"
                              />
                            ) : null}
                            <span className="text-sm font-semibold leading-tight">
                              {startup?.name ?? "Startup"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-transparent bg-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400"
                      >
                        <HugeiconsIcon icon={SparklesIcon} className="size-3" />
                        AI-drafted
                      </Badge>
                    </div>
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Headline
                        </div>
                        <p className="mt-0.5 text-sm font-medium leading-snug">
                          {w.headline ?? "(no headline)"}
                        </p>
                      </div>
                      <p className="rounded-md bg-muted/40 px-3 py-2.5 text-[12px] leading-relaxed text-foreground/80">
                        {w.draft ?? ""}
                      </p>
                      {w.founder_note ? (
                        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] italic text-amber-700 dark:text-amber-300">
                          Founder note: “{w.founder_note}”
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <HugeiconsIcon icon={EyeIcon} className="size-3" />
                          {w.impact_estimate ?? "Awaiting publish estimate"}
                        </span>
                        <div className="ml-auto flex items-center gap-1.5">
                          <form
                            action={decideWin.bind(
                              null,
                              w.submission_id,
                              w.id ?? "",
                              "rejected"
                            )}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-muted-foreground"
                              type="submit"
                            >
                              Reject
                            </Button>
                          </form>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            asChild
                          >
                            <Link
                              href={`/team/portfolio/${w.startup_id}`}
                            >
                              Edit
                            </Link>
                          </Button>
                          <form
                            action={decideWin.bind(
                              null,
                              w.submission_id,
                              w.id ?? "",
                              "approved"
                            )}
                          >
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              type="submit"
                            >
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                className="size-3.5"
                              />
                              Approve & publish
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Today's submissions */}
          <SectionHeader
            icon={InboxIcon}
            tint="text-blue-600 dark:text-blue-400"
            title="Today's submissions"
            count={todaysSubmissions.length}
            description="Filed in the last 24 hours — key changes summarised for fast triage."
            action={
              <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                <Link href="/team/submissions">
                  Open queue
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                </Link>
              </Button>
            }
          />
          {todaysSubmissions.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title="No submissions yet today"
              body="As founders file their reports, they'll appear here in real time."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border/60">
                  {todaysSubmissions.map((s) => {
                    const startup = startupsById.get(s.startup_id)
                    if (!startup) return null
                    const m = (s.metrics as Metrics) ?? {}
                    return (
                      <li
                        key={s.id}
                        className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/40"
                      >
                        <Avatar className="size-9">
                          <AvatarImage
                            src={
                              startup.logo_url ??
                              dicebearLogo(startup.name)
                            }
                            alt={startup.name}
                          />
                          <AvatarFallback>
                            {startup.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">
                              {startup.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="h-5 border-border/60 text-[10px] text-muted-foreground"
                            >
                              {startup.sector}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="h-5 border-transparent bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                            >
                              Verified
                            </Badge>
                            {Array.isArray(
                              (s.generated_outputs as GeneratedOutputs)?.wins
                            ) &&
                            (
                              (s.generated_outputs as GeneratedOutputs)
                                .wins ?? []
                            ).length > 0 ? (
                              <Badge
                                variant="outline"
                                className="h-5 border-transparent bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
                              >
                                Win flagged
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                            {summariseMetrics(m)}
                          </p>
                        </div>
                        <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
                          <HugeiconsIcon icon={ClockIcon} className="size-3" />
                          {formatTimeOfDay(s.submitted_at)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 text-xs opacity-0 transition group-hover:opacity-100"
                          asChild
                        >
                          <Link href={`/team/portfolio/${startup.id}`}>
                            View full
                            <HugeiconsIcon
                              icon={ArrowRight01Icon}
                              className="size-3"
                            />
                          </Link>
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Upcoming deadlines */}
          <SectionHeader
            icon={Calendar01Icon}
            tint="text-purple-600 dark:text-purple-400"
            title="Upcoming deadlines"
            count={deadlines.length}
            description="Across the portfolio — flagged on the Founder Health Score timeline."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {deadlines.map((d) => (
              <div
                key={d.title}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition hover:ring-1 hover:ring-foreground/20"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <HugeiconsIcon icon={d.icon} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">
                    {d.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {d.audience}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] ${
                    d.when_tone === "warn"
                      ? "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "border-transparent bg-muted text-muted-foreground"
                  }`}
                >
                  {d.when}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <aside className="flex flex-col gap-4">
          {/* Quick stats */}
          <Card className="overflow-hidden">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&h=200&q=70"
                alt=""
                className="h-20 w-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/40 mix-blend-color" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute bottom-2 left-4 flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-card/90 text-primary ring-1 ring-foreground/10 backdrop-blur">
                  <HugeiconsIcon icon={Activity01Icon} className="size-4" />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    My quick stats
                  </div>
                  <div className="text-sm font-semibold">This week</div>
                </div>
              </div>
            </div>
            <CardContent className="flex flex-col gap-3 pt-3">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Submissions reviewed
                  </span>
                  <span className="text-xs font-medium tabular-nums">
                    {myWeekFeedback.length}/{weekReviewedTarget}
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    (myWeekFeedback.length / weekReviewedTarget) * 100
                  )}
                  className="mt-1.5 h-1.5"
                />
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
                  +{myWeekFeedback.length} this week
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-2">
                <MiniStat
                  icon={CommentAdd01Icon}
                  label="Feedback"
                  value={myWeekFeedback.length}
                  tint="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                />
                <MiniStat
                  icon={ThumbsUpIcon}
                  label="Wins"
                  value={pendingWins.length}
                  tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                />
                <MiniStat
                  icon={HeartCheckIcon}
                  label="Saves"
                  value={atRiskList.length}
                  tint="bg-pink-500/15 text-pink-600 dark:text-pink-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Team leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <HugeiconsIcon
                  icon={UserMultiple02Icon}
                  className="size-4 text-primary"
                />
                Team this week
              </CardTitle>
              <CardDescription className="text-[11px]">
                Submissions reviewed across incubation team.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {teamLeaderboard.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  No activity this week.
                </p>
              ) : (
                teamLeaderboard.map((t, i) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${
                      t.you ? "bg-primary/10 ring-1 ring-primary/20" : ""
                    }`}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <Avatar className="size-7">
                      <AvatarImage src={t.avatar_url} alt={t.name} />
                      <AvatarFallback className="text-[10px]">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium">
                        {t.name}
                        {t.you ? (
                          <span className="ml-1 text-[10px] text-primary">
                            (you)
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-[10px] text-muted-foreground">
                        Incubation team
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {i === 0 && t.count > 0 ? (
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="size-3 text-amber-500"
                        />
                      ) : null}
                      <span className="text-[12px] font-semibold tabular-nums">
                        {t.count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <HugeiconsIcon
                  icon={Activity01Icon}
                  className="size-4 text-primary"
                />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {recentActivity.map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted ${a.tint}`}
                    >
                      <HugeiconsIcon icon={a.icon} className="size-3.5" />
                    </span>
                    <div className="flex-1">
                      <div className="text-[12px] leading-snug">
                        <span className="font-medium">{a.actor}</span>{" "}
                        <span className="text-muted-foreground">
                          {a.action}
                        </span>{" "}
                        <span className="font-medium">{a.target}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {a.time}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* AI suggestions */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/8 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <HugeiconsIcon icon={IdeaIcon} className="size-4 text-primary" />
                Try asking
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <SuggestedPrompt label="Which startups are at risk this month?" />
              <SuggestedPrompt label="Generate a board summary for Q2" />
              {atRiskList[0] ? (
                <SuggestedPrompt
                  label={`Draft outreach to ${atRiskList[0].name}`}
                />
              ) : (
                <SuggestedPrompt label="Draft outreach to a quiet founder" />
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function periodLabel(start: string | null): string {
  if (!start) return "report"
  return new Date(start).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  }) + " report"
}

function SectionHeader({
  icon,
  tint,
  title,
  count,
  description,
  action,
}: {
  icon: typeof MessageMultiple02Icon
  tint: string
  title: string
  count: number
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 ${tint}`}>
          <HugeiconsIcon icon={icon} className="size-5" />
        </span>
        <div>
          <h2 className="cn-font-heading flex items-center gap-2 text-base font-semibold tracking-tight">
            {title}
            <Badge
              variant="outline"
              className="h-5 border-border/60 px-1.5 text-[10px] tabular-nums"
            >
              {count}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

function PriorityBadge({ priority }: { priority: "high" | "med" | "low" }) {
  const map = {
    high: {
      cls: "border-transparent bg-red-500/15 text-red-600 dark:text-red-400",
      label: "High priority",
    },
    med: {
      cls: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
      label: "Medium",
    },
    low: {
      cls: "border-border/60 bg-background text-muted-foreground",
      label: "Low",
    },
  } as const
  return (
    <Badge variant="outline" className={`h-5 text-[10px] ${map[priority].cls}`}>
      {map[priority].label}
    </Badge>
  )
}

function SeverityBadge({
  severity,
}: {
  severity: "critical" | "warning"
}) {
  if (severity === "critical") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-red-500/15 text-[10px] text-red-600 dark:text-red-400"
      >
        <span className="size-1.5 rounded-full bg-red-500" />
        Critical
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-amber-500/15 text-[10px] text-amber-600 dark:text-amber-400"
    >
      <span className="size-1.5 rounded-full bg-amber-500" />
      Watch
    </Badge>
  )
}

function MiniStat({
  icon,
  label,
  value,
  tint,
}: {
  icon: typeof CommentAdd01Icon
  label: string
  value: number
  tint: string
}) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-md border border-border/60 bg-muted/30 p-2">
      <span className={`grid size-6 place-items-center rounded-md ${tint}`}>
        <HugeiconsIcon icon={icon} className="size-3" />
      </span>
      <span className="cn-font-heading text-base font-semibold tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

function SuggestedPrompt({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-left text-[12px] transition hover:border-primary/40 hover:bg-primary/5"
    >
      <HugeiconsIcon
        icon={SparklesIcon}
        className="size-3.5 text-muted-foreground transition group-hover:text-primary"
      />
      <span className="flex-1 leading-snug text-foreground/80">{label}</span>
      <HugeiconsIcon
        icon={ArrowUpRight01Icon}
        className="size-3.5 text-muted-foreground transition group-hover:text-primary"
      />
    </button>
  )
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: typeof MessageMultiple02Icon
  title: string
  body: string
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center gap-3 py-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <HugeiconsIcon icon={icon} className="size-5" />
        </span>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <p className="text-[12px] text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  )
}
