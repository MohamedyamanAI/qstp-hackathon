"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireRole } from "@/lib/auth/require"
import { dispatchToUsers } from "@/lib/notifications/dispatch"
import {
  parseQuestions,
  questionsToJson,
  type ReportQuestion,
  type ReportQuestionType,
} from "@/lib/reports/schema"

export type ActionState = { error?: string; ok?: boolean } | undefined

const QUESTION_TYPES: ReportQuestionType[] = [
  "currency",
  "number",
  "percent",
  "text",
  "longtext",
  "boolean",
]

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60)
}

function readQuestionsFromForm(formData: FormData): ReportQuestion[] {
  const ids = formData.getAll("question_id").map(String)
  const labels = formData.getAll("question_label").map(String)
  const types = formData.getAll("question_type").map(String)
  const units = formData.getAll("question_unit").map(String)
  const groups = formData.getAll("question_group").map(String)
  const requiredFlags = formData.getAll("question_required").map(String)

  const out: ReportQuestion[] = []
  const seen = new Set<string>()
  const len = Math.max(
    ids.length,
    labels.length,
    types.length,
    units.length,
    groups.length,
    requiredFlags.length
  )

  for (let i = 0; i < len; i++) {
    const label = (labels[i] ?? "").trim()
    if (!label) continue
    const rawType = types[i] ?? "text"
    const type = (
      QUESTION_TYPES as string[]
    ).includes(rawType)
      ? (rawType as ReportQuestionType)
      : "text"

    let id = (ids[i] ?? "").trim() || slugify(label) || `q_${i + 1}`
    if (seen.has(id)) {
      let suffix = 2
      while (seen.has(`${id}_${suffix}`)) suffix++
      id = `${id}_${suffix}`
    }
    seen.add(id)

    const unit = (units[i] ?? "").trim()
    const group = (groups[i] ?? "").trim()
    const required = requiredFlags[i] === "true" || requiredFlags[i] === "on"

    out.push({
      id,
      label,
      type,
      ...(unit ? { unit } : {}),
      ...(required ? { required: true } : {}),
      ...(group ? { group } : {}),
    })
  }

  return out
}

export async function updateDefaultTemplate(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("team")

  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  if (!title) return { error: "Title is required." }

  const questions = readQuestionsFromForm(formData)
  if (questions.length === 0) {
    return { error: "Add at least one question." }
  }

  const templateId = String(formData.get("template_id") ?? "")
  if (!templateId) return { error: "Missing template id." }

  const { error } = await supabase
    .from("report_templates")
    .update({
      title,
      description: description || null,
      questions: questionsToJson(questions),
      updated_by: userId,
    })
    .eq("id", templateId)

  if (error) return { error: error.message }

  revalidatePath("/team/reports")
  return { ok: true }
}

export async function publishReport(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("team")

  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const customNote = String(formData.get("custom_note") ?? "").trim()
  const periodStart = String(formData.get("period_start") ?? "")
  const periodEnd = String(formData.get("period_end") ?? "")
  const dueDate = String(formData.get("due_date") ?? "")
  const templateId = String(formData.get("template_id") ?? "")
  const silent = formData.get("silent") === "true"
  const startupIds = formData
    .getAll("startup_id")
    .map(String)
    .filter((v) => v.length > 0)
  const includedQuestionIds = new Set(
    formData
      .getAll("question_id")
      .map(String)
      .filter((v) => v.length > 0)
  )

  if (!title) return { error: "Title is required." }
  if (!periodStart || !periodEnd) return { error: "Period dates required." }
  if (!dueDate) return { error: "Due date required." }
  if (startupIds.length === 0) return { error: "Select at least one startup." }

  const { data: template, error: templateError } = await supabase
    .from("report_templates")
    .select("id, questions")
    .eq("id", templateId)
    .maybeSingle()

  if (templateError || !template) {
    return { error: "Template not found." }
  }

  const allQuestions = parseQuestions(template.questions)
  if (allQuestions.length === 0) {
    return { error: "Template has no valid questions." }
  }

  const questions =
    includedQuestionIds.size > 0
      ? allQuestions.filter((q) => includedQuestionIds.has(q.id))
      : allQuestions

  if (questions.length === 0) {
    return { error: "Select at least one question." }
  }

  const { data: publication, error: pubError } = await supabase
    .from("report_publications")
    .insert({
      template_id: template.id,
      title,
      description: description || null,
      period_start: periodStart,
      period_end: periodEnd,
      due_date: dueDate,
      questions: questionsToJson(questions),
      created_by: userId,
    })
    .select("id")
    .single()

  if (pubError || !publication) {
    return { error: pubError?.message ?? "Failed to publish." }
  }

  const { data: startups, error: startupError } = await supabase
    .from("startups")
    .select("id, name, founder_id")
    .in("id", startupIds)

  if (startupError) return { error: startupError.message }

  const validStartups = startups ?? []
  if (validStartups.length === 0) {
    return { error: "Selected startups not found." }
  }

  const assignmentRows = validStartups.map((s) => ({
    publication_id: publication.id,
    startup_id: s.id,
    status: "pending" as const,
  }))

  const { error: assignError } = await supabase
    .from("report_assignments")
    .insert(assignmentRows)

  if (assignError) return { error: assignError.message }

  if (!silent) {
    const messageBase = `Your incubation team published "${title}". Due ${dueDate}.`
    const message = customNote
      ? `${messageBase}\n\n${customNote}`
      : messageBase

    await dispatchToUsers({
      supabase,
      userIds: validStartups.map((s) => s.founder_id),
      payload: {
        type: "report_published",
        title: `New report: ${title}`,
        message,
        action_url: "/founder/submit",
        data: { publication_id: publication.id },
      },
    })
  }

  revalidatePath("/team/reports")
  redirect("/team/reports")
}
