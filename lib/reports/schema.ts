import type { Json } from "@/lib/supabase/database.types"

export type ReportQuestionType =
  | "currency"
  | "number"
  | "percent"
  | "text"
  | "longtext"
  | "boolean"

export type ReportQuestion = {
  id: string
  label: string
  type: ReportQuestionType
  unit?: string
  required?: boolean
  group?: string
}

export type ReportAnswerValue = string | number | boolean | null

export type ReportAnswers = Record<string, ReportAnswerValue>

export type ReportFieldSource =
  | "manual"
  | "startup_profile"
  | "stripe"
  | "google_workspace"
  | "google_drive"
  | "google_calendar"
  | "linkedin"
  | "ai_extract"

export type VerifiedField = {
  source: ReportFieldSource
  is_verified: boolean
  pulled_at?: string
  label?: string
}

export type VerifiedFields = Record<string, VerifiedField>

const QUESTION_TYPES: ReadonlySet<ReportQuestionType> = new Set([
  "currency",
  "number",
  "percent",
  "text",
  "longtext",
  "boolean",
])

export function parseQuestions(
  value: Json | null | undefined
): ReportQuestion[] {
  if (!Array.isArray(value)) return []
  const out: ReportQuestion[] = []
  const seen = new Set<string>()
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue
    const obj = raw as Record<string, unknown>
    const id = typeof obj.id === "string" ? obj.id.trim() : ""
    const label = typeof obj.label === "string" ? obj.label.trim() : ""
    const type =
      typeof obj.type === "string" &&
      QUESTION_TYPES.has(obj.type as ReportQuestionType)
        ? (obj.type as ReportQuestionType)
        : null
    if (!id || !label || !type || seen.has(id)) continue
    seen.add(id)
    out.push({
      id,
      label,
      type,
      unit: typeof obj.unit === "string" ? obj.unit : undefined,
      required: obj.required === true,
      group: typeof obj.group === "string" ? obj.group : undefined,
    })
  }
  return out
}

export function questionsToJson(questions: ReportQuestion[]): Json {
  return questions.map((q) => ({
    id: q.id,
    label: q.label,
    type: q.type,
    ...(q.unit !== undefined ? { unit: q.unit } : {}),
    ...(q.required ? { required: true } : {}),
    ...(q.group !== undefined ? { group: q.group } : {}),
  })) as Json
}

export function parseAnswers(value: Json | null | undefined): ReportAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const out: ReportAnswers = {}
  for (const [k, v] of Object.entries(value)) {
    if (v === null) {
      out[k] = null
    } else if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      out[k] = v
    }
  }
  return out
}

const FIELD_SOURCES: ReadonlySet<ReportFieldSource> = new Set([
  "manual",
  "startup_profile",
  "stripe",
  "google_workspace",
  "google_drive",
  "google_calendar",
  "linkedin",
  "ai_extract",
])

export function parseVerifiedFields(
  value: Json | null | undefined
): VerifiedFields {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const out: VerifiedFields = {}
  for (const [fieldId, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue
    const obj = raw as Record<string, unknown>
    const source =
      typeof obj.source === "string" &&
      FIELD_SOURCES.has(obj.source as ReportFieldSource)
        ? (obj.source as ReportFieldSource)
        : null
    if (!source) continue
    out[fieldId] = {
      source,
      is_verified: obj.is_verified === true,
      pulled_at: typeof obj.pulled_at === "string" ? obj.pulled_at : undefined,
      label: typeof obj.label === "string" ? obj.label : undefined,
    }
  }
  return out
}

export function coerceAnswer(
  type: ReportQuestionType,
  raw: string | undefined
): ReportAnswerValue {
  if (raw === undefined || raw === "") return null
  switch (type) {
    case "currency":
    case "number":
    case "percent": {
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    }
    case "boolean":
      return raw === "true" || raw === "on"
    case "text":
    case "longtext":
    default:
      return raw
  }
}

export function groupQuestions(
  questions: ReportQuestion[]
): { group: string; items: ReportQuestion[] }[] {
  const groups: { group: string; items: ReportQuestion[] }[] = []
  const byKey = new Map<string, ReportQuestion[]>()
  for (const q of questions) {
    const key = q.group ?? "General"
    if (!byKey.has(key)) {
      const arr: ReportQuestion[] = []
      byKey.set(key, arr)
      groups.push({ group: key, items: arr })
    }
    byKey.get(key)!.push(q)
  }
  return groups
}
