import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { notFound, redirect } from "next/navigation"

import { DistributePanel } from "@/components/founder/distribute/distribute-panel"
import { ReportForm } from "@/components/founder/submit/report-form"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require"
import {
  parseAnswers,
  parseQuestions,
  parseVerifiedFields,
} from "@/lib/reports/schema"

export default async function FounderFillPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const { assignmentId } = await params
  const { supabase, userId } = await requireRole("founder")

  const { data: assignment } = await supabase
    .from("report_assignments")
    .select(
      "id, status, submission_id, startup:startups!inner(id, name, founder_id), publication:report_publications!inner(id, title, description, period_start, period_end, due_date, questions)"
    )
    .eq("id", assignmentId)
    .maybeSingle()

  if (!assignment) notFound()
  if (assignment.startup.founder_id !== userId) redirect("/founder/submit")
  if (!assignment.submission_id) redirect("/founder/submit")

  const { data: submission } = await supabase
    .from("kpi_submissions")
    .select(
      "id, metrics, verified_fields, status, generated_outputs, submitted_at"
    )
    .eq("id", assignment.submission_id)
    .maybeSingle()

  const questions = parseQuestions(assignment.publication.questions)
  const answers = parseAnswers(submission?.metrics ?? null)
  const verifiedFields = parseVerifiedFields(
    submission?.verified_fields ?? null
  )
  const alreadySubmitted =
    assignment.status === "submitted" || submission?.status === "submitted"

  const investorEmailMeta = readInvestorEmailMeta(submission?.generated_outputs)
  const filingMeta = readFilingMeta(submission?.generated_outputs)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {assignment.publication.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {assignment.startup.name} · period{" "}
            {assignment.publication.period_start} →{" "}
            {assignment.publication.period_end} · due{" "}
            {assignment.publication.due_date}
          </p>
          {assignment.publication.description ? (
            <p className="mt-2 text-sm">{assignment.publication.description}</p>
          ) : null}
        </div>
        {alreadySubmitted ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mr-1 h-3.5 w-3.5"
            />
            Submitted
          </Badge>
        ) : null}
      </div>

      {alreadySubmitted ? (
        <SubmittedView
          assignmentId={assignment.id}
          submittedAt={submission?.submitted_at ?? null}
          questions={questions}
          answers={answers}
          investorEmailMeta={investorEmailMeta}
          filingMeta={filingMeta}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Answers</CardTitle>
            <CardDescription>
              Save a draft any time. Required fields are marked with{" "}
              <span className="text-destructive">*</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportForm
              assignmentId={assignment.id}
              questions={questions}
              initialAnswers={answers}
              verifiedFields={verifiedFields}
              alreadySubmitted={false}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SubmittedView({
  assignmentId,
  submittedAt,
  questions,
  answers,
  investorEmailMeta,
  filingMeta,
}: {
  assignmentId: string
  submittedAt: string | null
  questions: ReturnType<typeof parseQuestions>
  answers: ReturnType<typeof parseAnswers>
  investorEmailMeta: { lastSentAt: string | null; lastSentTo: string[] | null }
  filingMeta: ReturnType<typeof readFilingMeta>
}) {
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-background dark:to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="h-5 w-5 text-emerald-600"
            />
            Report submitted
          </CardTitle>
          <CardDescription>
            {submittedLabel
              ? `Locked in on ${submittedLabel}.`
              : "Your KPIs are in."}{" "}
            Now turn one submission into many distributions — pick a channel
            below.
          </CardDescription>
        </CardHeader>
      </Card>

      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Distribute</h2>
            <p className="text-xs text-muted-foreground">
              One submission, many destinations.
            </p>
          </div>
        </div>
        <DistributePanel
          assignmentId={assignmentId}
          initialEmailLastSentAt={investorEmailMeta.lastSentAt}
          initialEmailLastSentTo={investorEmailMeta.lastSentTo}
          initialFilingSubmitted={filingMeta.submitted}
          initialFilingGeneratedAt={filingMeta.generatedAt}
        />
      </div>

      <details className="group rounded-lg border border-border/60 bg-card open:bg-card/50">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
          <span>Your answers</span>
          <span className="text-xs font-normal text-muted-foreground group-open:hidden">
            View
          </span>
          <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
            Hide
          </span>
        </summary>
        <div className="border-t border-border/60 px-4 py-4">
          <AnswersReadout questions={questions} answers={answers} />
        </div>
      </details>
    </div>
  )
}

function AnswersReadout({
  questions,
  answers,
}: {
  questions: ReturnType<typeof parseQuestions>
  answers: ReturnType<typeof parseAnswers>
}) {
  const grouped = new Map<string, typeof questions>()
  for (const q of questions) {
    const key = q.group ?? "General"
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(q)
  }
  return (
    <div className="flex flex-col gap-5">
      {Array.from(grouped.entries()).map(([group, items]) => (
        <div key={group} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {group}
          </h3>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {items.map((q) => {
              const v = answers[q.id]
              const display =
                v === null || v === undefined || v === ""
                  ? "—"
                  : typeof v === "boolean"
                    ? v
                      ? "Yes"
                      : "No"
                    : q.type === "currency"
                      ? `$${Number(v).toLocaleString("en-US")}`
                      : q.type === "percent"
                        ? `${v}%`
                        : q.type === "number"
                          ? Number(v).toLocaleString("en-US")
                          : String(v)
              return (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0"
                >
                  <dt className="text-sm text-muted-foreground">{q.label}</dt>
                  <dd className="text-sm font-medium tabular-nums">
                    {display}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      ))}
    </div>
  )
}

type FilingDocKey =
  | "pack"
  | "q15"
  | "ubo"
  | "moci"
  | "gta"
  | "qdb"
  | "invest_qatar"

const FILING_DOC_KEYS: readonly FilingDocKey[] = [
  "pack",
  "q15",
  "ubo",
  "moci",
  "gta",
  "qdb",
  "invest_qatar",
]

function readFilingMeta(outputs: unknown): {
  submitted: Partial<
    Record<FilingDocKey, { at: string; reference: string | null }>
  >
  generatedAt: string | null
} {
  if (!outputs || typeof outputs !== "object" || Array.isArray(outputs)) {
    return { submitted: {}, generatedAt: null }
  }
  const f = (outputs as Record<string, unknown>).government_filings
  if (!f || typeof f !== "object" || Array.isArray(f)) {
    return { submitted: {}, generatedAt: null }
  }
  const obj = f as Record<string, unknown>
  const generatedAt =
    typeof obj.generatedAt === "string" ? obj.generatedAt : null
  const submittedRaw = obj.submitted
  const out: Partial<
    Record<FilingDocKey, { at: string; reference: string | null }>
  > = {}
  if (
    submittedRaw &&
    typeof submittedRaw === "object" &&
    !Array.isArray(submittedRaw)
  ) {
    for (const key of FILING_DOC_KEYS) {
      const v = (submittedRaw as Record<string, unknown>)[key]
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const r = v as Record<string, unknown>
        const at = typeof r.submittedAt === "string" ? r.submittedAt : null
        if (at) {
          out[key] = {
            at,
            reference: typeof r.reference === "string" ? r.reference : null,
          }
        }
      }
    }
  }
  return { submitted: out, generatedAt }
}

function readInvestorEmailMeta(outputs: unknown): {
  lastSentAt: string | null
  lastSentTo: string[] | null
} {
  if (!outputs || typeof outputs !== "object" || Array.isArray(outputs)) {
    return { lastSentAt: null, lastSentTo: null }
  }
  const ie = (outputs as Record<string, unknown>).investor_email
  if (!ie || typeof ie !== "object" || Array.isArray(ie)) {
    return { lastSentAt: null, lastSentTo: null }
  }
  const obj = ie as Record<string, unknown>
  const lastSentAt = typeof obj.lastSentAt === "string" ? obj.lastSentAt : null
  const lastSentTo = Array.isArray(obj.lastSentTo)
    ? obj.lastSentTo.filter((x): x is string => typeof x === "string")
    : null
  return { lastSentAt, lastSentTo }
}
