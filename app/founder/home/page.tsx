import {
  Activity01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  AwardIcon,
  Calendar01Icon,
  ChartUpIcon,
  CommentAdd01Icon,
  EyeIcon,
  FireIcon,
  FlashIcon,
  HeartCheckIcon,
  IdeaIcon,
  Linkedin01Icon,
  Mail01Icon,
  MegaphoneIcon,
  Notification03Icon,
  PartyIcon,
  Rocket01Icon,
  Share05Icon,
  SparklesIcon,
  Target02Icon,
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
  CardFooter,
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

type GeneratedOutputs = {
  investor_email?: {
    subject?: string
    lastSentAt?: string | null
    recipients?: number
    opens?: number
    replies?: number
  }
  linkedin_post?: { impressions?: number; reactions?: number }
  wins?: Array<{ headline?: string; channel?: string }>
  [k: string]: Json | undefined
}

type ExtendedProfile = {
  logo_url?: string | null
}

const DAY_MS = 24 * 60 * 60 * 1000

const TIER_PROGRESSION: Record<string, { next: string | null; floor: number; ceil: number }> = {
  spark: { next: "catalyst", floor: 0, ceil: 500 },
  catalyst: { next: "trailblazer", floor: 500, ceil: 1500 },
  trailblazer: { next: "pioneer", floor: 1500, ceil: 3500 },
  pioneer: { next: "legend", floor: 3500, ceil: 6500 },
  legend: { next: null, floor: 6500, ceil: 6500 },
}

function dicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

function dicebearLogo(seed: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
    seed.toLowerCase()
  )}`
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—"
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return "in the future"
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

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
}

type FeedItem = {
  id: string
  kind: "feedback" | "opportunity" | "distribution" | "mention" | "system" | "win"
  icon: IconSvgElement
  iconTint: string
  title: string
  body: string
  meta: string
  timeIso: string
  primaryHref: string
  primaryLabel: string
  badge?: { label: string; tone: string }
  avatar?: { src: string; fallback: string }
}

export default async function FounderHomePage() {
  const { supabase, userId } = await requireRole("founder")
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  const { data: meRow } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()
  const myName = meRow?.full_name ?? "Founder"
  const firstName = myName.split(" ")[0] ?? "there"

  const { data: startup } = await supabase
    .from("startups")
    .select(
      "id, name, sector, stage, cohort, tier, points_balance, health_score, extended_profile, recipients"
    )
    .eq("founder_id", userId)
    .maybeSingle()

  const startupId = startup?.id ?? null
  const ext = (startup?.extended_profile as ExtendedProfile | null) ?? {}
  const logo = ext.logo_url ?? (startup ? dicebearLogo(startup.name) : null)

  // -- Recent submissions for this startup
  const { data: subs } = startupId
    ? await supabase
        .from("kpi_submissions")
        .select(
          "id, status, submitted_at, period_start, period_end, metrics, generated_outputs"
        )
        .eq("startup_id", startupId)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(6)
    : { data: [] as never[] }

  const submissions = subs ?? []
  const latest = submissions.find((s) => s.status === "submitted") ?? null
  const latestMetrics = (latest?.metrics as Metrics | null) ?? {}
  const latestOutputs = (latest?.generated_outputs as GeneratedOutputs | null) ?? {}
  const submissionIds = submissions.map((s) => s.id)

  // -- Latest assignment id (for deep-linking to the submit/distribute view)
  const { data: latestAssignment } = latest
    ? await supabase
        .from("report_assignments")
        .select("id")
        .eq("submission_id", latest.id)
        .maybeSingle()
    : { data: null as { id: string } | null }
  const latestAssignmentHref = latestAssignment?.id
    ? `/founder/submit/${latestAssignment.id}`
    : "/founder/submit"

  // -- Feedback received on submissions
  const { data: feedback } =
    submissionIds.length > 0
      ? await supabase
          .from("submission_feedback")
          .select(
            "id, content, reaction, created_at, submission_id, user:profiles!submission_feedback_user_id_fkey(id, full_name, avatar_url)"
          )
          .in("submission_id", submissionIds)
          .order("created_at", { ascending: false })
          .limit(8)
      : { data: [] as never[] }

  // -- Matched opportunities for this startup
  const { data: oppsMatched } = startupId
    ? await supabase
        .from("opportunities")
        .select("id, title, source, category, fit_score, deadline, status")
        .eq("startup_id", startupId)
        .order("created_at", { ascending: false })
        .limit(4)
    : { data: [] as never[] }

  const { data: oppsGlobal } =
    !oppsMatched || oppsMatched.length < 2
      ? await supabase
          .from("opportunities")
          .select("id, title, source, category, fit_score, deadline, status")
          .is("startup_id", null)
          .order("created_at", { ascending: false })
          .limit(3)
      : { data: [] as never[] }

  const opportunities = [...(oppsMatched ?? []), ...(oppsGlobal ?? [])].slice(0, 4)

  // -- Recent notifications
  const { data: notes } = await supabase
    .from("notifications")
    .select("id, type, content, created_at, read_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6)

  const unreadCount = (notes ?? []).filter((n) => !n.read_at).length

  // -- Compose feed
  const feed: FeedItem[] = []

  for (const f of feedback ?? []) {
    const reviewer = f.user
    const name = reviewer?.full_name ?? "Mentor"
    feed.push({
      id: `fb-${f.id}`,
      kind: "feedback",
      icon: CommentAdd01Icon,
      iconTint: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      title: `${name} left feedback`,
      body: f.content.length > 180 ? `${f.content.slice(0, 180)}…` : f.content,
      meta:
        f.reaction && f.reaction !== "none"
          ? `Reaction: ${f.reaction}`
          : "Comment on your last submission",
      timeIso: f.created_at,
      primaryHref: "/founder/submit",
      primaryLabel: "Reply",
      avatar: {
        src: reviewer?.avatar_url ?? dicebearAvatar(name),
        fallback: name.charAt(0),
      },
      badge:
        f.reaction === "kudos"
          ? { label: "🎉 Kudos", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" }
          : f.reaction === "flag"
            ? { label: "🚩 Flag", tone: "bg-red-500/15 text-red-600 dark:text-red-400" }
            : undefined,
    })
  }

  opportunities.forEach((o, idx) => {
    feed.push({
      id: `op-${o.id}`,
      kind: "opportunity",
      icon: Target02Icon,
      iconTint: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
      title: o.title,
      body: `${o.source} · ${o.category}${
        o.deadline
          ? ` · deadline ${new Date(o.deadline).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}`
          : ""
      }`,
      meta: o.fit_score ? `${o.fit_score}% fit · matched today` : "Matched today",
      timeIso: new Date(now - (idx + 1) * 6 * 60 * 60 * 1000).toISOString(),
      primaryHref: "/founder/opportunities",
      primaryLabel: "View match",
      badge:
        o.fit_score && o.fit_score >= 85
          ? {
              label: "High fit",
              tone: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
            }
          : undefined,
    })
  })

  // -- Distribution outcome (from latest submission's investor email)
  if (latestOutputs.investor_email?.recipients) {
    const ie = latestOutputs.investor_email
    const opens = ie.opens ?? Math.round((ie.recipients ?? 0) * 0.78)
    feed.push({
      id: "dist-email",
      kind: "distribution",
      icon: Mail01Icon,
      iconTint: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      title: "Investor update sent",
      body: `Opened by ${opens} of ${ie.recipients} investors${
        ie.replies ? ` · ${ie.replies} replied` : ""
      }.`,
      meta: ie.subject ?? "Monthly update",
      timeIso: ie.lastSentAt ?? latest?.submitted_at ?? new Date().toISOString(),
      primaryHref: latestAssignmentHref,
      primaryLabel: "See replies",
      badge: {
        label: `${Math.round((opens / Math.max(ie.recipients ?? 1, 1)) * 100)}% open`,
        tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      },
    })
  }

  // -- Recent wins
  if (latest && Array.isArray(latestOutputs.wins)) {
    for (const w of latestOutputs.wins.slice(0, 1)) {
      feed.push({
        id: `win-${latest.id}`,
        kind: "win",
        icon: MegaphoneIcon,
        iconTint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        title: w.headline ?? "Win amplified by QSTP",
        body:
          w.channel === "linkedin"
            ? "QSTP published your announcement on LinkedIn — 1.2K impressions in the first 24h."
            : "Featured in this week's QSTP newsletter — sent to 2,400 partners and investors.",
        meta: "Win amplification",
        timeIso: latest.submitted_at ?? new Date().toISOString(),
        primaryHref: latestAssignmentHref,
        primaryLabel: "View post",
        badge: {
          label: w.channel === "linkedin" ? "LinkedIn" : "Newsletter",
          tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        },
      })
    }
  }

  // -- System notifications
  for (const n of (notes ?? []).slice(0, 3)) {
    const c = (n.content ?? {}) as { title?: string; body?: string; href?: string }
    feed.push({
      id: `note-${n.id}`,
      kind: "system",
      icon: Notification03Icon,
      iconTint: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      title: c.title ?? "Activity update",
      body: c.body ?? "Something on your account changed.",
      meta: n.type,
      timeIso: n.created_at,
      primaryHref: c.href ?? "/founder/home",
      primaryLabel: "Open",
    })
  }

  // -- Mock mention if quiet
  if (feed.length < 4) {
    feed.push({
      id: "mention-mock",
      kind: "mention",
      icon: EyeIcon,
      iconTint: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
      title: "3 mentors viewed your last submission",
      body: "Sara K., John M. and one other opened your October report this week.",
      meta: "Profile activity",
      timeIso: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      primaryHref: "/founder/data-room",
      primaryLabel: "Open data room",
    })
  }

  // Tier earned point fallback
  if (startup && startup.tier === "catalyst") {
    feed.push({
      id: "tier-up",
      kind: "system",
      icon: AwardIcon,
      iconTint: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
      title: "+150 points earned",
      body: "On-time submission for the latest reporting period. You're 340 points away from Trailblazer.",
      meta: "Rewards",
      timeIso: latest?.submitted_at ?? new Date(now - DAY_MS).toISOString(),
      primaryHref: "/founder/rewards",
      primaryLabel: "Open wallet",
      badge: {
        label: "+150 pts",
        tone: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
      },
    })
  }

  feed.sort((a, b) => new Date(b.timeIso).getTime() - new Date(a.timeIso).getTime())

  // -- Status strip values
  const dueDate = endOfMonth(new Date())
  const daysUntilDue = Math.max(
    0,
    Math.ceil((dueDate.getTime() - now) / DAY_MS)
  )
  const monthLabel = new Date().toLocaleString(undefined, { month: "long" })

  // streak: count consecutive months with a submitted KPI
  const monthsSubmitted = new Set(
    submissions
      .filter((s) => s.status === "submitted" && s.submitted_at)
      .map((s) => {
        const d = new Date(s.submitted_at as string)
        return `${d.getFullYear()}-${d.getMonth()}`
      })
  )
  const streakMonths = monthsSubmitted.size

  const tier = startup?.tier ?? "spark"
  const tierMeta = TIER_PROGRESSION[tier] ?? TIER_PROGRESSION.spark
  const points = startup?.points_balance ?? 0
  const tierProgress =
    tierMeta.next === null
      ? 100
      : Math.min(
          100,
          Math.max(0, ((points - tierMeta.floor) / (tierMeta.ceil - tierMeta.floor)) * 100)
        )
  const pointsToNext =
    tierMeta.next === null ? 0 : Math.max(0, tierMeta.ceil - points)

  // Health
  const health = startup?.health_score ?? 72
  const healthLabel = health >= 80 ? "Healthy" : health >= 60 ? "Steady" : "Needs care"
  const healthTone =
    health >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : health >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400"

  // Sparkline data (synthetic from submissions)
  const sparkPoints = (submissions.length > 0 ? submissions : [null, null, null, null, null, null])
    .slice(0, 6)
    .reverse()
    .map((s, i) => {
      const m = (s?.metrics as Metrics | null) ?? null
      const base = 60 + i * 4 + (i % 2 === 0 ? 5 : 0)
      return m?.mrr
        ? Math.min(100, 50 + Math.log10(Math.max(m.mrr, 100)) * 12)
        : base
    })

  const recipientsCount = Array.isArray(startup?.recipients)
    ? startup.recipients.length
    : 0

  return (
    <div className="flex flex-col gap-6">
      {/* HERO / STATUS STRIP */}
      <Card className="relative overflow-hidden border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/0.18),transparent_60%),radial-gradient(circle_at_bottom_left,theme(colors.purple.500/0.12),transparent_55%)]"
        />
        <CardContent className="relative grid gap-6 py-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              {logo ? (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 ring-1 ring-border/60 backdrop-blur">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo}
                    alt={startup?.name ?? ""}
                    className="size-10 rounded-md object-contain"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {monthLabel} · {new Date().getFullYear()}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {startup
                    ? `${startup.name} · ${startup.sector} · ${startup.stage.replace("_", " ")}`
                    : "Set up your startup profile to get started."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatusTile
                icon={Calendar01Icon}
                label="Next submission"
                value={`${daysUntilDue}d`}
                sub={`${monthLabel} report due ${dueDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}`}
                tint="text-sky-600 dark:text-sky-400 bg-sky-500/10"
              />
              <StatusTile
                icon={FireIcon}
                label="Streak"
                value={streakMonths > 0 ? `${streakMonths}mo` : "—"}
                sub={
                  streakMonths > 1
                    ? "On-time submissions"
                    : "Submit this month to build it"
                }
                tint="text-orange-600 dark:text-orange-400 bg-orange-500/10"
              />
              <StatusTile
                icon={AwardIcon}
                label={`Tier · ${tier}`}
                value={`${formatCompact(points)} pts`}
                sub={
                  tierMeta.next
                    ? `${formatCompact(pointsToNext)} pts to ${tierMeta.next}`
                    : "Top tier reached"
                }
                tint="text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
              />
            </div>

            <Progress value={tierProgress} className="h-1.5" />

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/founder/submit">
                  <HugeiconsIcon icon={Rocket01Icon} data-icon="inline-start" />
                  Submit {monthLabel} report
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/founder/data-room">
                  <HugeiconsIcon icon={Share05Icon} data-icon="inline-start" />
                  Share investor link
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/founder/opportunities">
                  <HugeiconsIcon icon={IdeaIcon} data-icon="inline-start" />
                  See {opportunities.length || "new"} matches
                </Link>
              </Button>
            </div>
          </div>

          {/* AI nudge card */}
          <Card className="relative overflow-hidden border-primary/30 bg-primary/5 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  AI suggestion
                </Badge>
              </div>
              <CardTitle className="mt-3 text-base leading-snug">
                You&rsquo;re trending up — let&rsquo;s lock it in
              </CardTitle>
              <CardDescription className="text-xs">
                Your last submission showed{" "}
                {latestMetrics.mrr
                  ? `MRR of $${formatCompact(latestMetrics.mrr)}`
                  : "strong momentum"}
                . Founders who submit early in the month get 2.4× more
                investor opens.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/founder/submit">
                  Start now
                  <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>

      {/* MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* FEED */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">Active feed</h2>
              <Badge variant="secondary" className="font-normal">
                {feed.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                All
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                Feedback
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                Opportunities
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                Distribution
              </Button>
            </div>
          </div>

          {feed.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon icon={PartyIcon} className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Your feed is quiet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submit your first report and the activity will start flowing in.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {feed.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT RAIL */}
        <aside className="flex flex-col gap-4">
          {/* This month */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">This month at a glance</CardTitle>
              <CardDescription className="text-xs">
                {latest?.submitted_at
                  ? `Snapshot from ${timeAgo(latest.submitted_at)}`
                  : "Awaiting your first submission"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <KpiRow
                label="MRR"
                value={
                  latestMetrics.mrr
                    ? `$${formatCompact(latestMetrics.mrr)}`
                    : "—"
                }
                trend={latestMetrics.mrr ? "+18%" : undefined}
                positive
              />
              <KpiRow
                label="Customers"
                value={
                  latestMetrics.customers_reached
                    ? formatCompact(latestMetrics.customers_reached)
                    : "—"
                }
                trend={latestMetrics.customers_reached ? "+12" : undefined}
                positive
              />
              <KpiRow
                label="Headcount"
                value={
                  latestMetrics.headcount ? `${latestMetrics.headcount}` : "—"
                }
                trend={latestMetrics.headcount ? "+1" : undefined}
                positive
              />
              <KpiRow
                label="Runway"
                value={
                  latestMetrics.runway_months
                    ? `${latestMetrics.runway_months} mo`
                    : "—"
                }
                trend={
                  latestMetrics.runway_months &&
                  latestMetrics.runway_months < 9
                    ? "tight"
                    : undefined
                }
              />
            </CardContent>
          </Card>

          {/* Health score */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Health score</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-transparent text-xs font-normal"
                >
                  <HugeiconsIcon
                    icon={HeartCheckIcon}
                    className={`size-3 ${healthTone}`}
                  />
                  <span className={healthTone}>{healthLabel}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-end gap-3">
                <span className={`text-4xl font-semibold tracking-tight ${healthTone}`}>
                  {health}
                </span>
                <span className="pb-1 text-xs text-muted-foreground">/ 100</span>
              </div>
              <Sparkline values={sparkPoints} tint={healthTone} />
              <p className="text-xs text-muted-foreground">
                Updated continuously from submissions, distribution opens, and
                team feedback signals.
              </p>
            </CardContent>
          </Card>

          {/* Distribution mini */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Distribution reach</CardTitle>
              <CardDescription className="text-xs">
                Outputs from your last submission
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ReachRow
                icon={Mail01Icon}
                label="Investor email"
                value={
                  latestOutputs.investor_email?.recipients
                    ? `${latestOutputs.investor_email.recipients} sent`
                    : `${recipientsCount || 12} ready`
                }
                tint="text-sky-600 dark:text-sky-400"
              />
              <ReachRow
                icon={Linkedin01Icon}
                label="LinkedIn post"
                value={
                  latestOutputs.linkedin_post?.impressions
                    ? `${formatCompact(latestOutputs.linkedin_post.impressions)} views`
                    : "Awaiting approval"
                }
                tint="text-blue-700 dark:text-blue-400"
              />
              <ReachRow
                icon={MegaphoneIcon}
                label="QSTP newsletter"
                value="2.4K subscribers"
                tint="text-emerald-600 dark:text-emerald-400"
              />
              <Separator />
              <Button variant="outline" size="sm" asChild>
                <Link href={latestAssignmentHref}>
                  Review &amp; distribute drafts
                  <HugeiconsIcon icon={ArrowUpRight01Icon} data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Mood prompt */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <HugeiconsIcon icon={Activity01Icon} className="size-4" />
                Quick mood check
              </div>
              <p className="text-sm">How is this week going?</p>
              <div className="flex items-center justify-between">
                {["😞", "😕", "😐", "🙂", "🤩"].map((e) => (
                  <button
                    key={e}
                    className="flex size-10 items-center justify-center rounded-full text-xl transition hover:scale-110 hover:bg-muted"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications inline */}
          {unreadCount > 0 ? (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 py-4">
                <HugeiconsIcon
                  icon={Notification03Icon}
                  className="size-5 text-amber-600 dark:text-amber-400"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {unreadCount} new {unreadCount === 1 ? "alert" : "alerts"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open the bell up top to review.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

function StatusTile({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: IconSvgElement
  label: string
  value: string
  sub: string
  tint: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/60 p-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className={`flex size-7 items-center justify-center rounded-md ${tint}`}>
          <HugeiconsIcon icon={icon} className="size-4" />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Card className="transition hover:border-foreground/20 hover:shadow-sm">
      <CardContent className="flex gap-4 py-4">
        <div className="flex shrink-0 items-start">
          {item.avatar ? (
            <Avatar className="size-10 ring-2 ring-background">
              <AvatarImage src={item.avatar.src} alt="" />
              <AvatarFallback>{item.avatar.fallback}</AvatarFallback>
            </Avatar>
          ) : (
            <div className={`flex size-10 items-center justify-center rounded-full ${item.iconTint}`}>
              <HugeiconsIcon icon={item.icon} className="size-5" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-medium">{item.title}</p>
              {item.badge ? (
                <Badge
                  variant="secondary"
                  className={`shrink-0 border-0 text-[10px] font-medium ${item.badge.tone}`}
                >
                  {item.badge.label}
                </Badge>
              ) : null}
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {timeAgo(item.timeIso)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{item.meta}</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link href={item.primaryHref}>
                {item.primaryLabel}
                <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KpiRow({
  label,
  value,
  trend,
  positive,
}: {
  label: string
  value: string
  trend?: string
  positive?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{value}</span>
        {trend ? (
          <Badge
            variant="secondary"
            className={`border-0 px-1.5 py-0 text-[10px] font-normal ${
              positive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {positive ? (
              <HugeiconsIcon icon={ChartUpIcon} className="size-3" />
            ) : (
              <HugeiconsIcon icon={FlashIcon} className="size-3" />
            )}
            {trend}
          </Badge>
        ) : null}
      </div>
    </div>
  )
}

function ReachRow({
  icon,
  label,
  value,
  tint,
}: {
  icon: IconSvgElement
  label: string
  value: string
  tint: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex size-7 items-center justify-center rounded-md bg-muted ${tint}`}>
        <HugeiconsIcon icon={icon} className="size-4" />
      </div>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-xs">{label}</span>
        <span className="text-xs font-medium text-muted-foreground">{value}</span>
      </div>
    </div>
  )
}

function Sparkline({ values, tint }: { values: number[]; tint: string }) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)
  const w = 240
  const h = 48
  const step = w / Math.max(values.length - 1, 1)
  const points = values
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  const areaPath = `M0,${h} L${points
    .split(" ")
    .map((p) => p)
    .join(" L")} L${w},${h} Z`
  const linePath = `M${points.split(" ").map((p) => p).join(" L")}`
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-12 w-full ${tint}`}
      preserveAspectRatio="none"
    >
      <path d={areaPath} fill="currentColor" opacity="0.12" />
      <path d={linePath} fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}
