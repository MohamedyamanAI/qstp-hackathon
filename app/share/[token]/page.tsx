import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { createClient } from "@/lib/supabase/server"

import {
  DataRoomView,
  type RecentReport,
} from "@/app/founder/data-room/data-room-view"
import type { ShareState } from "@/app/founder/data-room/actions"

const RECENT_LIMIT = 6

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Investor data room",
  robots: { index: false, follow: false },
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: share } = await supabase
    .from("data_room_shares")
    .select(
      "id, token, enabled, show_cap_table, show_documents, expires_at, startup_id"
    )
    .eq("token", token)
    .maybeSingle()

  if (!share || !share.enabled) {
    notFound()
  }

  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    notFound()
  }

  await supabase
    .from("data_room_shares")
    .update({
      view_count: (await currentViewCount(supabase, share.id)) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("id", share.id)

  const { data: rows } = await supabase
    .from("report_assignments")
    .select(
      `id, status,
       publication:report_publications!inner(id, title, period_start, period_end, due_date, published_at),
       submission:kpi_submissions(id, metrics, submitted_at, status)`
    )
    .eq("startup_id", share.startup_id)
    .order("published_at", {
      referencedTable: "report_publications",
      ascending: false,
    })
    .limit(RECENT_LIMIT)

  const reports: RecentReport[] = (rows ?? []).map((r) => {
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

  const initialShare: ShareState = {
    enabled: share.enabled,
    token: share.token,
    showCapTable: share.show_cap_table,
    showDocuments: share.show_documents,
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
      <DataRoomView
        reports={reports}
        initialShare={initialShare}
        mode="public"
      />
    </div>
  )
}

async function currentViewCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string
): Promise<number> {
  const { data } = await supabase
    .from("data_room_shares")
    .select("view_count")
    .eq("id", id)
    .maybeSingle()
  return data?.view_count ?? 0
}
