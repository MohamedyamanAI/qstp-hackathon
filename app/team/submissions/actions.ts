"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require"
import { dispatchToUser } from "@/lib/notifications/dispatch"
import type { Database, Json } from "@/lib/supabase/database.types"

type FeedbackReaction = Database["public"]["Enums"]["feedback_reaction_enum"]
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

const REACTIONS: FeedbackReaction[] = ["kudos", "flag", "clarify", "none"]

async function canReviewSubmission(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  userId: string,
  submissionId: string
) {
  const { data: submission } = await supabase
    .from("kpi_submissions")
    .select("id, startup_id, period_start")
    .eq("id", submissionId)
    .maybeSingle()

  if (!submission) return null

  const { data: assignment } = await supabase
    .from("team_assignments")
    .select("startup_id")
    .eq("team_member_id", userId)
    .eq("startup_id", submission.startup_id)
    .maybeSingle()

  return assignment ? submission : null
}

async function loadSubmissionFounder(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  startupId: string
) {
  const { data } = await supabase
    .from("startups")
    .select("id, name, founder_id")
    .eq("id", startupId)
    .maybeSingle()

  return data
}

function readOutputs(raw: Json | null | undefined): GeneratedOutputs {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as GeneratedOutputs)
    : {}
}

function nextWins(wins: WinEntry[], winId: string, patch: Partial<WinEntry>) {
  return wins.map((w) => (w.id === winId ? { ...w, ...patch } : w))
}

export async function addSubmissionFeedback(formData: FormData) {
  const { supabase, userId } = await requireRole("team")
  const submissionId = String(formData.get("submission_id") ?? "")
  const content = String(formData.get("content") ?? "").trim()
  const field = String(formData.get("field") ?? "").trim()
  const reactionValue = String(formData.get("reaction") ?? "none")
  const reaction = REACTIONS.includes(reactionValue as FeedbackReaction)
    ? (reactionValue as FeedbackReaction)
    : "none"

  if (!submissionId || !content) return

  const submission = await canReviewSubmission(supabase, userId, submissionId)
  if (!submission) return
  const storedContent = field ? `[field:${field}]\n${content}` : content

  await supabase.from("submission_feedback").insert({
    submission_id: submissionId,
    user_id: userId,
    content: storedContent,
    reaction,
  })

  revalidatePath("/team/submissions")
  revalidatePath("/team/today")
}

export async function decideSubmissionWin(
  submissionId: string,
  winId: string,
  decision: WinDecision,
  formData?: FormData
) {
  const { supabase, userId } = await requireRole("team")
  if (!submissionId || !winId) return

  const submission = await canReviewSubmission(supabase, userId, submissionId)
  if (!submission) return

  const { data } = await supabase
    .from("kpi_submissions")
    .select("generated_outputs")
    .eq("id", submissionId)
    .maybeSingle()

  const outputs = readOutputs(data?.generated_outputs)
  const wins = Array.isArray(outputs.wins) ? outputs.wins : []
  const headline = String(formData?.get("headline") ?? "").trim()
  const draft = String(formData?.get("draft") ?? "").trim()
  const channel = String(formData?.get("channel") ?? "").trim()
  const next = nextWins(wins, winId, {
    ...(headline ? { headline } : {}),
    ...(draft ? { draft } : {}),
    ...(channel ? { channel } : {}),
    approval_status: decision,
    decided_by: userId,
    decided_at: new Date().toISOString(),
  })

  await supabase
    .from("kpi_submissions")
    .update({
      generated_outputs: { ...outputs, wins: next } as unknown as Json,
    })
    .eq("id", submissionId)

  revalidatePath("/team/submissions")
  revalidatePath("/team/today")
}

export async function updateSubmissionWinDraft(formData: FormData) {
  const { supabase, userId } = await requireRole("team")
  const submissionId = String(formData.get("submission_id") ?? "")
  const winId = String(formData.get("win_id") ?? "")
  const headline = String(formData.get("headline") ?? "").trim()
  const draft = String(formData.get("draft") ?? "").trim()
  const channel = String(formData.get("channel") ?? "").trim()

  if (!submissionId || !winId || !headline || !draft) return

  const submission = await canReviewSubmission(supabase, userId, submissionId)
  if (!submission) return

  const { data } = await supabase
    .from("kpi_submissions")
    .select("generated_outputs")
    .eq("id", submissionId)
    .maybeSingle()

  const outputs = readOutputs(data?.generated_outputs)
  const wins = Array.isArray(outputs.wins) ? outputs.wins : []
  const next = nextWins(wins, winId, {
    headline,
    draft,
    ...(channel ? { channel } : {}),
    edited_by: userId,
    edited_at: new Date().toISOString(),
  })

  await supabase
    .from("kpi_submissions")
    .update({
      generated_outputs: { ...outputs, wins: next } as unknown as Json,
    })
    .eq("id", submissionId)

  revalidatePath("/team/submissions")
  revalidatePath("/team/today")
}

export async function sendFounderNote(formData: FormData) {
  const { supabase, userId } = await requireRole("team")
  const submissionId = String(formData.get("submission_id") ?? "")
  const note = String(formData.get("note") ?? "").trim()

  if (!submissionId || !note) return

  const submission = await canReviewSubmission(supabase, userId, submissionId)
  if (!submission) return

  const startup = await loadSubmissionFounder(supabase, submission.startup_id)
  if (!startup?.founder_id) return

  await supabase.from("submission_feedback").insert({
    submission_id: submissionId,
    user_id: userId,
    content: `[founder_note]\n${note}`,
    reaction: "none",
  })

  await dispatchToUser({
    supabase,
    userId: startup.founder_id,
    payload: {
      type: "team_feedback",
      title: "New team note",
      message: note,
      action_url: "/founder/home",
      data: {
        submission_id: submissionId,
        startup_id: submission.startup_id,
      },
    },
  })

  revalidatePath("/team/submissions")
  revalidatePath("/team/today")
}
