import {
  Alert02Icon,
  ArrowRight01Icon,
  AwardIcon,
  Building01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  ClockIcon,
  CommentAdd01Icon,
  Database02Icon,
  EyeIcon,
  InboxIcon,
  Linkedin01Icon,
  MegaphoneIcon,
  MessageMultiple02Icon,
  Search01Icon,
  SparklesIcon,
  ThumbsUpIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import {
  addSubmissionFeedback,
  decideSubmissionWin,
  sendFounderNote,
  updateSubmissionWinDraft,
} from "@/app/team/submissions/actions"
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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { requireRole } from "@/lib/auth/require"
import type { Database, Json } from "@/lib/supabase/database.types"

type SearchParams = Promise<{
  tab?: string
  q?: string
}>

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
  [k: string]: Json | undefined
}

type GeneratedOutputs = {
  wins?: Win[]
  [k: string]: Json | undefined
}

type ExtendedProfile = {
  logo_url?: string | null
}

type FeedbackReaction = Database["public"]["Enums"]["feedback_reaction_enum"]
type ParsedFeedback = {
  content: string
  field: string | null
  founderNote: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000
const TABS = [
  { value: "all", label: "All" },
  { value: "awaiting", label: "Awaiting feedback" },
  { value: "flagged", label: "Flagged" },
  { value: "wins", label: "Wins to approve" },
  { value: "reviewed", label: "Recently reviewed" },
] as const

export default async function TeamSubmissionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { supabase, userId } = await requireRole("team")
  const sp = await searchParams
  const activeTab = TABS.some((t) => t.value === sp.tab) ? sp.tab! : "all"
  const q = sp.q?.trim() ?? ""
  // Server component renders once per request — Date.now() is stable here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

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
      founder_email: string | null
    }
  >()

  for (const a of assignments ?? []) {
    const startup = a.startup
    if (!startup) continue
    const ext = (startup.extended_profile as ExtendedProfile | null) ?? {}
    startupsById.set(startup.id, {
      id: startup.id,
      name: startup.name,
      sector: startup.sector,
      stage: startup.stage,
      health_score: startup.health_score,
      cohort: startup.cohort,
      tier: startup.tier,
      logo_url: ext.logo_url ?? null,
      founder_name: startup.founder?.full_name ?? null,
      founder_avatar_url:
        startup.founder?.avatar_url ??
        (startup.founder?.full_name
          ? dicebearAvatar(startup.founder.full_name)
          : null),
      founder_email: startup.founder?.email ?? null,
    })
  }

  const sinceIso = new Date(now - 120 * DAY_MS).toISOString()
  const { data: rawSubmissions } =
    startupIds.length > 0
      ? await supabase
          .from("kpi_submissions")
          .select(
            "id, startup_id, status, submitted_at, submitted_by, period_start, period_end, metrics, generated_outputs, verified_fields"
          )
          .in("startup_id", startupIds)
          .eq("status", "submitted")
          .gte("submitted_at", sinceIso)
          .order("submitted_at", { ascending: false })
      : { data: [] as never[] }

  const submissionIds = (rawSubmissions ?? []).map((s) => s.id)
  const { data: feedbackRows } =
    submissionIds.length > 0
      ? await supabase
          .from("submission_feedback")
          .select("id, submission_id, user_id, content, reaction, created_at")
          .in("submission_id", submissionIds)
          .order("created_at", { ascending: false })
      : { data: [] as never[] }

  const feedbackUserIds = Array.from(
    new Set((feedbackRows ?? []).map((f) => f.user_id))
  )
  const { data: feedbackProfiles } =
    feedbackUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", feedbackUserIds)
      : { data: [] as never[] }
  const profilesById = new Map((feedbackProfiles ?? []).map((p) => [p.id, p]))

  const feedbackBySubmission = new Map<
    string,
    {
      id: string
      user_id: string
      content: string
      reaction: FeedbackReaction | null
      created_at: string
    }[]
  >()
  for (const f of feedbackRows ?? []) {
    if (!feedbackBySubmission.has(f.submission_id)) {
      feedbackBySubmission.set(f.submission_id, [])
    }
    feedbackBySubmission.get(f.submission_id)!.push(f)
  }

  const submissions = (rawSubmissions ?? []).map((submission) => {
    const startup = startupsById.get(submission.startup_id)
    const feedback = feedbackBySubmission.get(submission.id) ?? []
    const wins = ((submission.generated_outputs as GeneratedOutputs | null)
      ?.wins ?? []) as Win[]
    const pendingWins = wins.filter(
      (win) => (win.approval_status ?? "pending") === "pending"
    )
    const hasMyFeedback = feedback.some((f) => f.user_id === userId)
    const flagged =
      feedback.some((f) => f.reaction === "flag") ||
      (startup?.health_score !== null &&
        startup?.health_score !== undefined &&
        startup.health_score < 55)

    return {
      ...submission,
      startup,
      feedback,
      wins,
      pendingWins,
      hasMyFeedback,
      flagged,
    }
  })

  const searched = q
    ? submissions.filter((submission) => {
        const metrics = (submission.metrics as Metrics | null) ?? {}
        const haystack = [
          submission.startup?.name,
          submission.startup?.founder_name,
          submission.startup?.sector,
          metrics.biggest_win,
          summariseMetrics(metrics),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return haystack.includes(q.toLowerCase())
      })
    : submissions

  const filtered = searched.filter((submission) => {
    if (activeTab === "awaiting") return !submission.hasMyFeedback
    if (activeTab === "flagged") return submission.flagged
    if (activeTab === "wins") return submission.pendingWins.length > 0
    if (activeTab === "reviewed") return submission.hasMyFeedback
    return true
  })

  const awaitingCount = submissions.filter((s) => !s.hasMyFeedback).length
  const flaggedCount = submissions.filter((s) => s.flagged).length
  const pendingWinCount = submissions.reduce(
    (count, s) => count + s.pendingWins.length,
    0
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          icon={InboxIcon}
          label="Submissions"
          value={submissions.length}
          detail="Last 120 days"
        />
        <StatCard
          icon={MessageMultiple02Icon}
          label="Awaiting feedback"
          value={awaitingCount}
          detail="No comment from you"
        />
        <StatCard
          icon={AwardIcon}
          label="Wins to approve"
          value={pendingWinCount}
          detail="Publication drafts"
        />
        <StatCard
          icon={Alert02Icon}
          label="Flagged"
          value={flaggedCount}
          detail="Feedback or health risk"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <Tabs value={activeTab}>
            <TabsList variant="line" className="h-auto flex-wrap justify-start">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} asChild>
                  <Link href={tabHref(tab.value, q)}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <form className="flex items-center gap-2">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative min-w-0 md:w-72">
              <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search submissions"
                className="w-full pl-7"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No submissions found</CardTitle>
              <CardDescription>
                Clear the search or switch tabs to see more founder reports.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((submission) => {
              const startup = submission.startup
              if (!startup) return null
              const metrics = (submission.metrics as Metrics | null) ?? {}
              const pendingWins = submission.pendingWins
              const submittedAgo = timeAgo(submission.submitted_at)
              const ageMs = submission.submitted_at
                ? now - new Date(submission.submitted_at).getTime()
                : 0
              const priority: "high" | "med" | "low" =
                pendingWins.length > 0 || submission.flagged
                  ? "high"
                  : !submission.hasMyFeedback && ageMs > 3 * DAY_MS
                    ? "med"
                    : "low"

              return (
                <Card key={submission.id} className="overflow-hidden">
                  <details className="group/submission">
                    <summary className="cursor-pointer list-none px-4 py-4 marker:hidden">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        <Avatar className="size-11">
                          <AvatarImage
                            src={startup.logo_url ?? dicebearLogo(startup.name)}
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
                            <span className="text-xs text-muted-foreground">
                              {startup.founder_name ?? "Founder"}
                            </span>
                            <Badge variant="outline">{startup.sector}</Badge>
                            <PriorityBadge priority={priority} />
                            {!submission.hasMyFeedback ? (
                              <Badge
                                variant="outline"
                                className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              >
                                Needs feedback
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Reviewed</Badge>
                            )}
                            {pendingWins.length > 0 ? (
                              <Badge
                                variant="outline"
                                className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              >
                                {pendingWins.length} win
                                {pendingWins.length === 1 ? "" : "s"}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-[13px] leading-relaxed text-foreground/80">
                            {summariseMetrics(metrics)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <HugeiconsIcon icon={Calendar01Icon} />
                              {periodLabel(submission.period_start)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <HugeiconsIcon icon={ClockIcon} />
                              {submittedAgo}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <HugeiconsIcon icon={CommentAdd01Icon} />
                              {submission.feedback.length} comment
                              {submission.feedback.length === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:ml-auto">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/team/portfolio/${startup.id}`}>
                              Profile
                              <HugeiconsIcon icon={ArrowRight01Icon} />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            className="group-open/submission:hidden"
                          >
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="hidden group-open/submission:inline-flex"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </summary>

                    <Separator />
                    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="flex flex-col gap-4">
                        <section className="grid gap-3 md:grid-cols-2">
                          <MetricCard
                            label="Revenue / MRR"
                            value={moneyValue(
                              metrics.revenue_this_month ?? metrics.mrr
                            )}
                            detail={
                              metrics.mrr
                                ? `MRR ${moneyValue(metrics.mrr)}`
                                : "Reported this period"
                            }
                          />
                          <MetricCard
                            label="Runway"
                            value={
                              typeof metrics.runway_months === "number"
                                ? `${metrics.runway_months} months`
                                : "—"
                            }
                            detail={
                              typeof metrics.burn_multiple === "number"
                                ? `Burn ${metrics.burn_multiple.toFixed(1)}x`
                                : "Burn multiple unavailable"
                            }
                          />
                          <MetricCard
                            label="Customers"
                            value={
                              typeof metrics.customers_reached === "number"
                                ? formatCompact(metrics.customers_reached)
                                : "—"
                            }
                            detail="Reached or active"
                          />
                          <MetricCard
                            label="Team"
                            value={
                              typeof metrics.headcount === "number"
                                ? String(metrics.headcount)
                                : "—"
                            }
                            detail="Reported headcount"
                          />
                        </section>

                        <Card size="sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <HugeiconsIcon
                                icon={Database02Icon}
                                className="size-4 text-muted-foreground"
                              />
                              Submitted metrics
                            </CardTitle>
                            <CardDescription>
                              Key-value payload from the founder report.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {metricEntries(metrics).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                                >
                                  <div>
                                    <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                      {humanizeKey(key)}
                                    </div>
                                    <div className="mt-1 text-xs font-medium break-words">
                                      {formatMetricValue(value)}
                                    </div>
                                  </div>
                                  <form
                                    action={addSubmissionFeedback}
                                    className="flex items-start gap-2"
                                  >
                                    <input
                                      type="hidden"
                                      name="submission_id"
                                      value={submission.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="field"
                                      value={key}
                                    />
                                    <Textarea
                                      name="content"
                                      placeholder={`Comment on ${humanizeKey(key)}`}
                                      className="min-h-10 text-[11px]"
                                      required
                                    />
                                    <Button
                                      type="submit"
                                      name="reaction"
                                      value="clarify"
                                      size="sm"
                                      variant="outline"
                                    >
                                      Add
                                    </Button>
                                  </form>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card size="sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <HugeiconsIcon
                                icon={MessageMultiple02Icon}
                                className="size-4 text-muted-foreground"
                              />
                              Feedback
                            </CardTitle>
                            <CardDescription>
                              Comments become part of the team review trail.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-3">
                            {submission.feedback.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                No team feedback yet.
                              </p>
                            ) : (
                              <ul className="flex flex-col gap-3">
                                {submission.feedback.map((feedback) => {
                                  const profile = profilesById.get(
                                    feedback.user_id
                                  )
                                  const parsed = parseFeedbackContent(
                                    feedback.content
                                  )
                                  return (
                                    <li
                                      key={feedback.id}
                                      className="flex gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5"
                                    >
                                      <Avatar className="size-8">
                                        <AvatarImage
                                          src={
                                            profile?.avatar_url ??
                                            dicebearAvatar(
                                              profile?.full_name ?? "Team"
                                            )
                                          }
                                          alt={profile?.full_name ?? "Team"}
                                        />
                                        <AvatarFallback>
                                          {(profile?.full_name ?? "Team").slice(
                                            0,
                                            2
                                          )}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-xs font-medium">
                                            {feedback.user_id === userId
                                              ? "You"
                                              : (profile?.full_name ?? "Team")}
                                          </span>
                                          <ReactionBadge
                                            reaction={feedback.reaction}
                                            founderNote={parsed.founderNote}
                                          />
                                          {parsed.field ? (
                                            <Badge variant="outline">
                                              {humanizeKey(parsed.field)}
                                            </Badge>
                                          ) : null}
                                          <span className="text-[10px] text-muted-foreground">
                                            {timeAgo(feedback.created_at)}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                                          {parsed.content}
                                        </p>
                                      </div>
                                    </li>
                                  )
                                })}
                              </ul>
                            )}

                            <form
                              action={addSubmissionFeedback}
                              className="flex flex-col gap-2 rounded-md border border-dashed border-border/80 bg-muted/20 p-3"
                            >
                              <input
                                type="hidden"
                                name="submission_id"
                                value={submission.id}
                              />
                              <Textarea
                                name="content"
                                placeholder="Leave feedback, a clarification request, or a note for the review trail."
                                required
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="submit"
                                  name="reaction"
                                  value="kudos"
                                  variant="outline"
                                >
                                  <HugeiconsIcon icon={ThumbsUpIcon} />
                                  Kudos
                                </Button>
                                <Button
                                  type="submit"
                                  name="reaction"
                                  value="flag"
                                  variant="outline"
                                >
                                  <HugeiconsIcon icon={Alert02Icon} />
                                  Flag
                                </Button>
                                <Button
                                  type="submit"
                                  name="reaction"
                                  value="clarify"
                                  variant="outline"
                                >
                                  <HugeiconsIcon icon={EyeIcon} />
                                  Clarify
                                </Button>
                                <Button
                                  type="submit"
                                  name="reaction"
                                  value="none"
                                  className="ml-auto"
                                >
                                  Add note
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      </div>

                      <aside className="flex flex-col gap-4">
                        <Card size="sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <HugeiconsIcon
                                icon={Building01Icon}
                                className="size-4 text-muted-foreground"
                              />
                              Context
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarImage
                                  src={
                                    startup.founder_avatar_url ??
                                    dicebearAvatar(
                                      startup.founder_name ?? startup.name
                                    )
                                  }
                                  alt={startup.founder_name ?? startup.name}
                                />
                                <AvatarFallback>
                                  {(startup.founder_name ?? startup.name).slice(
                                    0,
                                    2
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                  {startup.founder_name ?? "Founder"}
                                </div>
                                <div className="truncate text-[11px] text-muted-foreground">
                                  {startup.founder_email ?? startup.name}
                                </div>
                              </div>
                            </div>
                            <Separator />
                            <ContextRow label="Stage" value={startup.stage} />
                            <ContextRow
                              label="Health"
                              value={
                                startup.health_score !== null
                                  ? `${startup.health_score}/100`
                                  : "—"
                              }
                            />
                            <ContextRow
                              label="Cohort"
                              value={startup.cohort ?? "—"}
                            />
                            <ContextRow label="Tier" value={startup.tier} />
                            <Separator />
                            <form
                              action={sendFounderNote}
                              className="flex flex-col gap-2"
                            >
                              <input
                                type="hidden"
                                name="submission_id"
                                value={submission.id}
                              />
                              <Textarea
                                name="note"
                                placeholder="Send a note to the founder"
                                required
                              />
                              <Button type="submit" className="w-full">
                                <HugeiconsIcon icon={CommentAdd01Icon} />
                                Send founder note
                              </Button>
                            </form>
                          </CardContent>
                        </Card>

                        <Card size="sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <HugeiconsIcon
                                icon={AwardIcon}
                                className="size-4 text-muted-foreground"
                              />
                              Wins
                            </CardTitle>
                            <CardDescription>
                              Publication drafts extracted from this report.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-3">
                            {submission.wins.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                No wins extracted from this submission.
                              </p>
                            ) : (
                              submission.wins.map((win, index) => (
                                <form
                                  key={win.id ?? `${submission.id}-${index}`}
                                  action={updateSubmissionWinDraft}
                                  className="rounded-md border border-border/60 bg-background p-3"
                                >
                                  <input
                                    type="hidden"
                                    name="submission_id"
                                    value={submission.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="win_id"
                                    value={win.id ?? ""}
                                  />
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
                                        <HugeiconsIcon
                                          icon={
                                            win.channel === "linkedin"
                                              ? Linkedin01Icon
                                              : MegaphoneIcon
                                          }
                                          className="size-4"
                                        />
                                      </span>
                                      <div>
                                        <Input
                                          name="headline"
                                          defaultValue={
                                            win.headline ?? "Founder win"
                                          }
                                          className="h-7 w-full text-xs font-medium"
                                          required
                                        />
                                        <Input
                                          name="channel"
                                          defaultValue={
                                            win.channel ?? "publication"
                                          }
                                          className="mt-1 h-6 w-40 text-[10px]"
                                        />
                                      </div>
                                    </div>
                                    <WinStatusBadge
                                      status={win.approval_status ?? "pending"}
                                    />
                                  </div>
                                  <Textarea
                                    name="draft"
                                    defaultValue={win.draft ?? ""}
                                    placeholder="Draft publication copy"
                                    className="mt-3 min-h-24 text-[11px]"
                                    required
                                  />
                                  {win.impact_estimate ? (
                                    <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <HugeiconsIcon icon={EyeIcon} />
                                      {win.impact_estimate}
                                    </div>
                                  ) : null}
                                  {(win.approval_status ?? "pending") ===
                                  "pending" ? (
                                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                                      <Button
                                        type="submit"
                                        variant="outline"
                                        size="sm"
                                      >
                                        Save draft
                                      </Button>
                                      <Button
                                        type="submit"
                                        formAction={decideSubmissionWin.bind(
                                          null,
                                          submission.id,
                                          win.id ?? "",
                                          "rejected"
                                        )}
                                        variant="ghost"
                                        size="sm"
                                      >
                                        Reject
                                      </Button>
                                      <Button
                                        type="submit"
                                        formAction={decideSubmissionWin.bind(
                                          null,
                                          submission.id,
                                          win.id ?? "",
                                          "approved"
                                        )}
                                        size="sm"
                                      >
                                        <HugeiconsIcon
                                          icon={CheckmarkCircle02Icon}
                                        />
                                        Approve
                                      </Button>
                                    </div>
                                  ) : null}
                                </form>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      </aside>
                    </div>
                  </details>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function tabHref(tab: string, q: string) {
  const params = new URLSearchParams()
  params.set("tab", tab)
  if (q) params.set("q", q)
  return `/team/submissions?${params.toString()}`
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

function periodLabel(start: string | null): string {
  if (!start) return "report"
  return (
    new Date(start).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    }) + " report"
  )
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function moneyValue(n: number | undefined): string {
  if (typeof n !== "number") return "—"
  return `$${formatCompact(n)}`
}

function summariseMetrics(m: Metrics): string {
  const parts: string[] = []
  if (typeof m.mrr === "number") parts.push(`MRR $${formatCompact(m.mrr)}`)
  if (typeof m.revenue_this_month === "number") {
    parts.push(`Revenue $${formatCompact(m.revenue_this_month)}`)
  }
  if (typeof m.customers_reached === "number") {
    parts.push(`${formatCompact(m.customers_reached)} customers`)
  }
  if (typeof m.headcount === "number") parts.push(`${m.headcount} team`)
  if (typeof m.runway_months === "number") {
    parts.push(`${m.runway_months}mo runway`)
  }
  if (m.biggest_win) parts.push(String(m.biggest_win))
  return parts.slice(0, 3).join(" · ") || "Submission filed"
}

function metricEntries(metrics: Metrics) {
  const entries = Object.entries(metrics).filter(([, value]) => {
    if (value === null || value === undefined) return false
    if (typeof value === "object") return false
    return true
  })
  return entries.length > 0 ? entries : [["status", "No structured metrics"]]
}

function humanizeKey(key: string) {
  return key.replaceAll("_", " ")
}

function formatMetricValue(value: Json | undefined) {
  if (typeof value === "number") return value.toLocaleString()
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "string") return value
  return "—"
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: typeof InboxIcon
  label: string
  value: number
  detail: string
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground">
          <HugeiconsIcon icon={icon} className="size-4" />
        </span>
        <div>
          <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
            {label}
          </div>
          <div className="cn-font-heading text-xl font-semibold tabular-nums">
            {value}
          </div>
          <div className="text-[11px] text-muted-foreground">{detail}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
      <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="cn-font-heading mt-1 text-lg font-semibold tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{detail}</div>
    </div>
  )
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium capitalize">{value}</span>
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
    <Badge variant="outline" className={map[priority].cls}>
      {map[priority].label}
    </Badge>
  )
}

function parseFeedbackContent(content: string): ParsedFeedback {
  if (content.startsWith("[founder_note]\n")) {
    return {
      content: content.replace("[founder_note]\n", ""),
      field: null,
      founderNote: true,
    }
  }

  const fieldMatch = content.match(/^\[field:([^\]]+)\]\n([\s\S]*)$/)
  if (fieldMatch) {
    return {
      content: fieldMatch[2] ?? "",
      field: fieldMatch[1] ?? null,
      founderNote: false,
    }
  }

  return { content, field: null, founderNote: false }
}

function ReactionBadge({
  reaction,
  founderNote = false,
}: {
  reaction: FeedbackReaction | null
  founderNote?: boolean
}) {
  if (founderNote) return <Badge variant="secondary">Sent to founder</Badge>
  if (reaction === "flag") return <Badge variant="destructive">Flag</Badge>
  if (reaction === "clarify") return <Badge variant="outline">Clarify</Badge>
  if (reaction === "kudos") return <Badge variant="secondary">Kudos</Badge>
  return <Badge variant="outline">Note</Badge>
}

function WinStatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected"
}) {
  if (status === "approved") {
    return <Badge variant="secondary">Approved</Badge>
  }
  if (status === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>
  }
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400"
    >
      <HugeiconsIcon icon={SparklesIcon} />
      Pending
    </Badge>
  )
}
