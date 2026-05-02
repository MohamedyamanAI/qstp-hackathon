import { notFound, redirect } from "next/navigation"

import { InvestorEmailCard } from "@/components/founder/distribute/investor-email-modal"
import { ReportForm } from "@/components/founder/submit/report-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require"
import { parseAnswers, parseQuestions } from "@/lib/reports/schema"

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
    .select("id, metrics, status, generated_outputs")
    .eq("id", assignment.submission_id)
    .maybeSingle()

  const questions = parseQuestions(assignment.publication.questions)
  const answers = parseAnswers(submission?.metrics ?? null)
  const alreadySubmitted =
    assignment.status === "submitted" || submission?.status === "submitted"

  const investorEmailMeta = readInvestorEmailMeta(submission?.generated_outputs)

  return (
    <div className="flex flex-col gap-6">
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
            alreadySubmitted={alreadySubmitted}
          />
        </CardContent>
      </Card>

      {alreadySubmitted ? (
        <InvestorEmailCard
          assignmentId={assignment.id}
          lastSentAt={investorEmailMeta.lastSentAt}
          lastSentTo={investorEmailMeta.lastSentTo}
        />
      ) : null}
    </div>
  )
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
