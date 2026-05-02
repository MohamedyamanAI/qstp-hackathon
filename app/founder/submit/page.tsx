import {
  AlertCircleIcon,
  Calendar01Icon,
  CheckmarkSquare01Icon,
  Clock01Icon,
  File01Icon,
  FileEditIcon,
  PartyIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { openAssignment } from "@/app/founder/submit/actions"
import { SubmitStatsTabs } from "@/components/founder/submit/submit-stats-tabs"
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
import { requireRole } from "@/lib/auth/require"

const STATUS_META: Record<
  string,
  { label: string; icon: typeof File01Icon; tone: string; progress: number }
> = {
  pending: {
    label: "Not started",
    icon: File01Icon,
    tone: "bg-emerald-500/5 text-emerald-600/40 dark:text-emerald-400/40",
    progress: 0,
  },
  draft: {
    label: "Draft",
    icon: FileEditIcon,
    tone: "bg-emerald-500/10 text-emerald-600/60 dark:text-emerald-400/60",
    progress: 25,
  },
  in_progress: {
    label: "In progress",
    icon: Clock01Icon,
    tone: "bg-emerald-500/15 text-emerald-600/80 dark:text-emerald-400/80",
    progress: 50,
  },
  submitted: {
    label: "Submitted",
    icon: CheckmarkSquare01Icon,
    tone: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    progress: 100,
  },
}

function daysUntil(dateStr: string): number {
  const due = new Date(`${dateStr}T00:00:00`)
  const now = new Date()
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function urgencyColor(days: number) {
  if (days <= 0) return "bg-red-500/15 text-red-600 dark:text-red-400"
  if (days <= 7) return "bg-amber-500/15 text-amber-600 dark:text-amber-400"
  return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
}

function CircularProgress({ value }: { value: number }) {
  const size = 20
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="stroke-emerald-500 transition-all"
      />
    </svg>
  )
}

export default async function FounderSubmitPage() {
  const { supabase, userId } = await requireRole("founder")

  const { data: assignments } = await supabase
    .from("report_assignments")
    .select(
      "id, status, submission_id, startup:startups!inner(id, name, founder_id), publication:report_publications!inner(id, title, period_start, period_end, due_date)"
    )
    .eq("startup.founder_id", userId)
    .order("created_at", { ascending: false })

  const rows = assignments ?? []
  const open = rows.filter((r) => r.status !== "submitted")
  const done = rows.filter((r) => r.status === "submitted")
  const overdueCount = open.filter(
    (r) => daysUntil(r.publication.due_date) < 0
  ).length

  // Count how many founders have submitted per publication
  const publicationIds = open.map((r) => r.publication.id)
  const submittedCounts: Record<string, number> = {}
  if (publicationIds.length > 0) {
    const { data: counts } = await supabase
      .from("report_assignments")
      .select("publication_id")
      .in("publication_id", publicationIds)
      .eq("status", "submitted")
    for (const pubId of publicationIds) {
      submittedCounts[pubId] =
        counts?.filter((c) => c.publication_id === pubId).length ?? 0
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <SubmitStatsTabs
        openCount={open.length}
        overdueCount={overdueCount}
        submittedCount={done.length}
      />

      {/* Open reports */}
      {open.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="relative">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15">
                <HugeiconsIcon
                  icon={PartyIcon}
                  className="size-8 text-emerald-500"
                />
              </div>
              <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-amber-500/15">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  className="size-3.5 text-amber-500"
                />
              </div>
              <div className="absolute -bottom-1 -left-2 flex size-5 items-center justify-center rounded-full bg-purple-500/15">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  className="size-3 text-purple-500"
                />
              </div>
            </div>
            <div>
              <p className="text-base font-semibold">All caught up!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nothing assigned right now — enjoy the breather.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {open.map((r) => {
            const days = daysUntil(r.publication.due_date)
            const overdue = days < 0
            const status = STATUS_META[r.status] ?? STATUS_META.pending

            return (
              <Card
                key={r.id}
                className="relative overflow-hidden pt-0 transition hover:ring-foreground/30"
              >
                {/* Primary color overlay — same as observability card */}
                <div className="absolute inset-0 z-30 h-32 bg-primary opacity-50 mix-blend-color" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=800&auto=format&fit=crop"
                  alt=""
                  className="relative z-20 h-32 w-full object-cover brightness-60 grayscale"
                />

                <CardHeader className="relative z-40">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm">
                      {r.publication.title}
                    </CardTitle>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`gap-1 border-transparent ${status.tone}`}
                      >
                        <HugeiconsIcon icon={status.icon} className="size-3" />
                        {status.label}
                      </Badge>
                      <CircularProgress value={status.progress} />
                    </div>
                  </div>
                  <CardDescription className="text-[11px]">
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon
                        icon={Calendar01Icon}
                        className="size-3"
                      />
                      {r.publication.period_start} →{" "}
                      {r.publication.period_end}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardFooter className="relative z-40">
                  <form action={openAssignment}>
                    <input
                      type="hidden"
                      name="assignment_id"
                      value={r.id}
                    />
                    <Button type="submit" size="sm">
                      {r.status === "pending" ? "Open" : "Continue"}
                    </Button>
                  </form>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`gap-1 border-transparent text-[10px] font-medium ${urgencyColor(days)}`}
                    >
                      {overdue ? (
                        <HugeiconsIcon
                          icon={AlertCircleIcon}
                          className="size-3"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          className="size-3"
                        />
                      )}
                      {overdue
                        ? `${-days}d overdue`
                        : days === 0
                          ? "Due today"
                          : `${days}d left`}
                    </Badge>
                    {submittedCounts[r.publication.id] > 0 ? (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <HugeiconsIcon
                          icon={UserGroupIcon}
                          className="size-3"
                        />
                        {submittedCounts[r.publication.id]} finished
                      </Badge>
                    ) : null}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Submitted reports */}
      {done.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon
                icon={CheckmarkSquare01Icon}
                className="size-4 text-emerald-500"
              />
              Submitted
            </CardTitle>
            <CardDescription>
              The team can now review and leave feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {done.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <HugeiconsIcon
                        icon={CheckmarkSquare01Icon}
                        className="size-4"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{r.publication.title}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          className="size-3"
                        />
                        {r.publication.period_start} →{" "}
                        {r.publication.period_end}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="gap-1 border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  >
                    <HugeiconsIcon
                      icon={CheckmarkSquare01Icon}
                      className="size-3"
                    />
                    Submitted
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
