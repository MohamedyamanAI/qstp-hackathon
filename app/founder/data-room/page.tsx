import { requireRole } from "@/lib/auth/require"

import { DataRoomView, type RecentReport } from "./data-room-view"
import type { ShareState } from "./actions"

const RECENT_LIMIT = 6

export default async function FounderDataRoomPage() {
  const { supabase, userId } = await requireRole("founder")

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", userId)
    .maybeSingle()

  let reports: RecentReport[] = []
  let initialShare: ShareState = {
    enabled: false,
    token: null,
    showCapTable: true,
    showDocuments: true,
  }

  if (startup) {
    const { data: shareRow } = await supabase
      .from("data_room_shares")
      .select("token, enabled, show_cap_table, show_documents")
      .eq("startup_id", startup.id)
      .maybeSingle()
    if (shareRow) {
      initialShare = {
        enabled: shareRow.enabled,
        token: shareRow.token,
        showCapTable: shareRow.show_cap_table,
        showDocuments: shareRow.show_documents,
      }
    }

    const { data: rows } = await supabase
      .from("report_assignments")
      .select(
        `id, status,
         publication:report_publications!inner(id, title, period_start, period_end, due_date, published_at),
         submission:kpi_submissions(id, metrics, submitted_at, status)`
      )
      .eq("startup_id", startup.id)
      .order("published_at", {
        referencedTable: "report_publications",
        ascending: false,
      })
      .limit(RECENT_LIMIT)

    reports = (rows ?? []).map((r) => {
      const metrics =
        r.submission?.metrics &&
        typeof r.submission.metrics === "object" &&
        !Array.isArray(r.submission.metrics)
          ? (r.submission.metrics as Record<string, number | string | boolean | null>)
          : {}
      return {
        assignmentId: r.id,
        publicationId: r.publication.id,
        title: r.publication.title,
        periodStart: r.publication.period_start,
        periodEnd: r.publication.period_end,
        dueDate: r.publication.due_date,
        publishedAt: r.publication.published_at,
        status: r.status as RecentReport["status"],
        submittedAt: r.submission?.submitted_at ?? null,
        metrics,
      }
    })
  }

  return <DataRoomView reports={reports} initialShare={initialShare} />
}
