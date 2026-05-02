import { notFound } from "next/navigation"

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
  type ReportQuestion,
} from "@/lib/reports/schema"

function formatAnswer(q: ReportQuestion, raw: unknown): string {
  if (raw === null || raw === undefined || raw === "") return "—"
  switch (q.type) {
    case "currency":
      return typeof raw === "number"
        ? `${q.unit ?? ""} ${raw.toLocaleString()}`.trim()
        : String(raw)
    case "percent":
      return typeof raw === "number" ? `${raw}%` : String(raw)
    case "number":
      return typeof raw === "number" ? raw.toLocaleString() : String(raw)
    case "boolean":
      return raw ? "Yes" : "No"
    default:
      return String(raw)
  }
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  draft: "Draft",
  in_progress: "In progress",
  submitted: "Submitted",
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ publicationId: string }>
}) {
  const { publicationId } = await params
  const { supabase } = await requireRole("team")

  const { data: publication } = await supabase
    .from("report_publications")
    .select(
      "id, title, description, period_start, period_end, due_date, published_at, questions"
    )
    .eq("id", publicationId)
    .maybeSingle()

  if (!publication) notFound()

  const { data: assignments } = await supabase
    .from("report_assignments")
    .select(
      "id, status, submission_id, startup:startups!inner(id, name, founder:profiles!startups_founder_id_fkey(full_name, email)), submission:kpi_submissions(metrics, submitted_at)"
    )
    .eq("publication_id", publicationId)

  const rows = assignments ?? []
  const questions = parseQuestions(publication.questions)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {publication.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Period {publication.period_start} → {publication.period_end} · due{" "}
          {publication.due_date}
        </p>
        {publication.description ? (
          <p className="mt-2 text-sm">{publication.description}</p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {rows.filter((r) => r.status === "submitted").length} of{" "}
            {rows.length} submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No assignments on this publication.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((r) => {
                const answers = parseAnswers(r.submission?.metrics ?? null)
                return (
                  <li
                    key={r.id}
                    className="rounded-md border border-border/60 bg-card p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{r.startup.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.startup.founder?.full_name}
                          {r.startup.founder?.email
                            ? ` · ${r.startup.founder.email}`
                            : null}
                        </div>
                      </div>
                      <Badge
                        variant={
                          r.status === "submitted" ? "default" : "secondary"
                        }
                      >
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                    </div>
                    {r.status === "submitted" && questions.length > 0 ? (
                      <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                        {questions.map((q) => (
                          <div
                            key={q.id}
                            className="flex items-baseline justify-between gap-3 border-b border-border/30 pb-1 last:border-b-0"
                          >
                            <dt className="text-muted-foreground">
                              {q.label}
                            </dt>
                            <dd className="font-medium">
                              {formatAnswer(q, answers[q.id])}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
