"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require"
import type { Json } from "@/lib/supabase/database.types"

type WinDecision = "approved" | "rejected"

type WinEntry = {
  id?: string
  headline?: string
  channel?: string
  draft?: string
  approval_status?: WinDecision | "pending"
  impact_estimate?: string
  decided_by?: string
  decided_at?: string
  [k: string]: Json | undefined
}

type GeneratedOutputs = {
  wins?: WinEntry[]
  [k: string]: Json | undefined
}

export async function decideWin(
  submissionId: string,
  winId: string,
  decision: WinDecision
) {
  const { supabase, userId } = await requireRole("team")

  const { data, error } = await supabase
    .from("kpi_submissions")
    .select("generated_outputs")
    .eq("id", submissionId)
    .single()

  if (error || !data) return

  const outputs = (data.generated_outputs as GeneratedOutputs | null) ?? {}
  const wins = Array.isArray(outputs.wins) ? outputs.wins : []
  const next = wins.map((w) =>
    w.id === winId
      ? {
          ...w,
          approval_status: decision,
          decided_by: userId,
          decided_at: new Date().toISOString(),
        }
      : w
  )

  await supabase
    .from("kpi_submissions")
    .update({
      generated_outputs: { ...outputs, wins: next } as unknown as Json,
    })
    .eq("id", submissionId)

  revalidatePath("/team/today")
}

export async function leaveQuickFeedback(
  submissionId: string,
  content: string
) {
  const { supabase, userId } = await requireRole("team")
  if (!content.trim()) return
  await supabase.from("submission_feedback").insert({
    submission_id: submissionId,
    user_id: userId,
    content: content.trim(),
    reaction: "kudos",
  })
  revalidatePath("/team/today")
}
