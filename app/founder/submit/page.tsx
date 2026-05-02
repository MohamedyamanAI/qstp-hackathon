import { openAssignment } from "@/app/founder/submit/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require"

const STATUS_LABEL: Record<string, string> = {
  pending: "Not started",
  draft: "Draft",
  in_progress: "In progress",
  submitted: "Submitted",
}

function daysUntil(dateStr: string): number {
  const due = new Date(`${dateStr}T00:00:00`)
  const now = new Date()
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Submit</h1>
        <p className="text-sm text-muted-foreground">
          Reports your incubation team has assigned to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open reports</CardTitle>
          <CardDescription>
            {open.length === 0
              ? "All caught up."
              : `${open.length} report${open.length > 1 ? "s" : ""} waiting on you.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing assigned right now.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {open.map((r) => {
                const days = daysUntil(r.publication.due_date)
                const overdue = days < 0
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card px-3 py-3"
                  >
                    <div>
                      <div className="font-medium">{r.publication.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.publication.period_start} →{" "}
                        {r.publication.period_end} · due{" "}
                        {r.publication.due_date}{" "}
                        <span
                          className={
                            overdue
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        >
                          ({overdue ? `${-days}d overdue` : `${days}d left`})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
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
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {done.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Submitted</CardTitle>
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
                  <div>
                    <div className="font-medium">{r.publication.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.publication.period_start} →{" "}
                      {r.publication.period_end}
                    </div>
                  </div>
                  <Badge>Submitted</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
