import Link from "next/link"

import { PublishSheet } from "@/components/team/reports/publish-sheet"
import { TemplateEditor } from "@/components/team/reports/template-editor"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require"
import { parseQuestions } from "@/lib/reports/schema"

export default async function TeamReportsPage() {
  const { supabase } = await requireRole("team")

  const [templateRes, publicationsRes, startupsRes] = await Promise.all([
    supabase
      .from("report_templates")
      .select("id, title, description, questions, is_default")
      .eq("is_default", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("report_publications")
      .select(
        "id, title, period_start, period_end, due_date, published_at, report_assignments(id, status)"
      )
      .order("published_at", { ascending: false })
      .limit(20),
    supabase
      .from("startups")
      .select(
        "id, name, sector, stage, tier, cohort, founder:profiles!startups_founder_id_fkey(email)"
      )
      .order("name", { ascending: true }),
  ])

  const template = templateRes.data
  const publications = publicationsRes.data ?? []
  const startups = (startupsRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    sector: s.sector,
    stage: s.stage,
    tier: s.tier,
    cohort: s.cohort,
    founderEmail: s.founder?.email ?? null,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        {template ? (
          <PublishSheet
            templateId={template.id}
            defaultTitle={template.title}
            templateQuestions={parseQuestions(template.questions)}
            startups={startups}
          />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published reports</CardTitle>
          <CardDescription>
            Each publication snapshots the template at the moment of publish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing published yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {publications.map((p) => {
                const assignments = p.report_assignments ?? []
                const submitted = assignments.filter(
                  (a) => a.status === "submitted"
                ).length
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <Link
                        href={`/team/reports/${p.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {p.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        Period {p.period_start} → {p.period_end} · due{" "}
                        {p.due_date}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {submitted}/{assignments.length} submitted
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {template ? (
        <TemplateEditor
          templateId={template.id}
          initialTitle={template.title}
          initialDescription={template.description ?? ""}
          initialQuestions={parseQuestions(template.questions)}
        />
      ) : (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No default template found. Run the seed migration.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
