#!/usr/bin/env node
// Local MCP server: lets a founder list, fill, and submit pending KPI reports
// from Claude Desktop / Claude Code. Mirrors app/founder/submit/actions.ts.

import { createClient } from "@supabase/supabase-js"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL?.toLowerCase()
const FOUNDER_ID = process.env.FOUNDER_ID

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env."
  )
  process.exit(1)
}
if (!FOUNDER_EMAIL && !FOUNDER_ID) {
  console.error("Set FOUNDER_EMAIL or FOUNDER_ID in env.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// --- founder identity ---------------------------------------------------------

let founderId = FOUNDER_ID ?? null
async function resolveFounderId() {
  if (founderId) return founderId
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", FOUNDER_EMAIL)
    .maybeSingle()
  if (error || !data) throw new Error(`Founder not found for ${FOUNDER_EMAIL}`)
  if (data.role !== "founder") throw new Error("Profile is not a founder")
  founderId = data.id
  return founderId
}

// --- helpers (ported from lib/reports/schema.ts, trimmed) --------------------

const QUESTION_TYPES = new Set([
  "currency",
  "number",
  "percent",
  "text",
  "longtext",
  "boolean",
])

function parseQuestions(value) {
  if (!Array.isArray(value)) return []
  const out = []
  const seen = new Set()
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue
    const id = typeof raw.id === "string" ? raw.id.trim() : ""
    const label = typeof raw.label === "string" ? raw.label.trim() : ""
    const type = QUESTION_TYPES.has(raw.type) ? raw.type : null
    if (!id || !label || !type || seen.has(id)) continue
    seen.add(id)
    out.push({
      id,
      label,
      type,
      unit: typeof raw.unit === "string" ? raw.unit : undefined,
      required: raw.required === true,
      group: typeof raw.group === "string" ? raw.group : undefined,
    })
  }
  return out
}

function parseAnswers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const out = {}
  for (const [k, v] of Object.entries(value)) {
    if (v === null) out[k] = null
    else if (["string", "number", "boolean"].includes(typeof v)) out[k] = v
  }
  return out
}

function parseVerifiedFields(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const out = {}
  for (const [k, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object") continue
    if (typeof raw.source !== "string") continue
    out[k] = {
      source: raw.source,
      is_verified: raw.is_verified === true,
      pulled_at: typeof raw.pulled_at === "string" ? raw.pulled_at : undefined,
      label: typeof raw.label === "string" ? raw.label : undefined,
    }
  }
  return out
}

function coerceAnswer(type, raw) {
  if (raw === null || raw === undefined || raw === "") return null
  switch (type) {
    case "currency":
    case "number":
    case "percent": {
      const n = typeof raw === "number" ? raw : Number(raw)
      return Number.isFinite(n) ? n : null
    }
    case "boolean":
      if (typeof raw === "boolean") return raw
      return raw === "true" || raw === "on" || raw === true
    default:
      return String(raw)
  }
}

function isBlank(v) {
  return v === null || v === undefined || v === ""
}

// Mirror reconcileVerifiedFieldsAfterEdit: drop verification when the value
// changes from what it was when prefilled.
function reconcileVerifiedFields({
  questions,
  previousAnswers,
  previousVerified,
  nextAnswers,
}) {
  const out = { ...previousVerified }
  for (const q of questions) {
    const prev = previousAnswers[q.id]
    const next = nextAnswers[q.id]
    if (prev !== next && out[q.id]) delete out[q.id]
  }
  return out
}

// --- data access -------------------------------------------------------------

async function loadAssignment(assignmentId) {
  const fid = await resolveFounderId()
  const { data, error } = await supabase
    .from("report_assignments")
    .select(
      "id, status, submission_id, publication_id, startup_id, " +
        "startups!inner(founder_id, name), " +
        "report_publications!inner(title, period_start, period_end, due_date, questions)"
    )
    .eq("id", assignmentId)
    .maybeSingle()
  if (error || !data) return null
  if (data.startups.founder_id !== fid) return null
  return data
}

async function listPending() {
  const fid = await resolveFounderId()
  const { data, error } = await supabase
    .from("report_assignments")
    .select(
      "id, status, submission_id, publication_id, " +
        "startups!inner(founder_id, name), " +
        "report_publications!inner(title, period_start, period_end, due_date)"
    )
    .eq("startups.founder_id", fid)
    .in("status", ["pending", "in_progress"])
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    assignment_id: row.id,
    status: row.status,
    startup_name: row.startups.name,
    title: row.report_publications.title,
    period_start: row.report_publications.period_start,
    period_end: row.report_publications.period_end,
    due_date: row.report_publications.due_date,
    has_draft: row.submission_id !== null,
  }))
}

async function getOrCreateSubmission(assignment) {
  if (assignment.submission_id) return assignment.submission_id
  const fid = await resolveFounderId()
  const { data, error } = await supabase
    .from("kpi_submissions")
    .insert({
      startup_id: assignment.startup_id,
      submitted_by: fid,
      status: "in_progress",
      period_start: assignment.report_publications.period_start,
      period_end: assignment.report_publications.period_end,
      publication_id: assignment.publication_id,
    })
    .select("id")
    .single()
  if (error || !data) throw new Error(error?.message ?? "Could not create draft")
  await supabase
    .from("report_assignments")
    .update({ submission_id: data.id, status: "in_progress" })
    .eq("id", assignment.id)
  return data.id
}

async function getReport(assignmentId) {
  const assignment = await loadAssignment(assignmentId)
  if (!assignment) throw new Error("Assignment not found")

  const submissionId = await getOrCreateSubmission(assignment)
  const { data: submission } = await supabase
    .from("kpi_submissions")
    .select("status, metrics, verified_fields, submitted_at")
    .eq("id", submissionId)
    .maybeSingle()

  const questions = parseQuestions(assignment.report_publications.questions)
  const answers = parseAnswers(submission?.metrics ?? null)
  const verified = parseVerifiedFields(submission?.verified_fields ?? null)

  return {
    assignment_id: assignment.id,
    submission_id: submissionId,
    submission_status: submission?.status ?? "in_progress",
    submitted_at: submission?.submitted_at ?? null,
    startup_name: assignment.startups.name,
    title: assignment.report_publications.title,
    period_start: assignment.report_publications.period_start,
    period_end: assignment.report_publications.period_end,
    due_date: assignment.report_publications.due_date,
    questions: questions.map((q) => ({
      ...q,
      current_value: answers[q.id] ?? null,
      verified: verified[q.id] ?? null,
      blank: isBlank(answers[q.id]),
    })),
  }
}

async function saveDraft(assignmentId, partialAnswers) {
  const assignment = await loadAssignment(assignmentId)
  if (!assignment) throw new Error("Assignment not found")
  const submissionId = await getOrCreateSubmission(assignment)

  const { data: existing } = await supabase
    .from("kpi_submissions")
    .select("status, metrics, verified_fields")
    .eq("id", submissionId)
    .maybeSingle()
  if (existing?.status === "submitted") {
    throw new Error("Already submitted; cannot edit draft")
  }

  const questions = parseQuestions(assignment.report_publications.questions)
  const previousAnswers = parseAnswers(existing?.metrics ?? null)
  const previousVerified = parseVerifiedFields(existing?.verified_fields ?? null)

  const merged = { ...previousAnswers }
  for (const q of questions) {
    if (Object.prototype.hasOwnProperty.call(partialAnswers, q.id)) {
      merged[q.id] = coerceAnswer(q.type, partialAnswers[q.id])
    }
  }
  const verified = reconcileVerifiedFields({
    questions,
    previousAnswers,
    previousVerified,
    nextAnswers: merged,
  })

  const { error } = await supabase
    .from("kpi_submissions")
    .update({ metrics: merged, verified_fields: verified })
    .eq("id", submissionId)
  if (error) throw new Error(error.message)

  return { submission_id: submissionId, saved_fields: Object.keys(partialAnswers) }
}

async function submitReport(assignmentId, partialAnswers) {
  const assignment = await loadAssignment(assignmentId)
  if (!assignment) throw new Error("Assignment not found")
  const submissionId = await getOrCreateSubmission(assignment)

  const { data: existing } = await supabase
    .from("kpi_submissions")
    .select("status, metrics, verified_fields")
    .eq("id", submissionId)
    .maybeSingle()
  if (existing?.status === "submitted") {
    return {
      submission_id: submissionId,
      status: "submitted",
      idempotent: true,
      message: "Already submitted; no changes made.",
    }
  }

  const questions = parseQuestions(assignment.report_publications.questions)
  const previousAnswers = parseAnswers(existing?.metrics ?? null)
  const previousVerified = parseVerifiedFields(existing?.verified_fields ?? null)

  const merged = { ...previousAnswers }
  if (partialAnswers && typeof partialAnswers === "object") {
    for (const q of questions) {
      if (Object.prototype.hasOwnProperty.call(partialAnswers, q.id)) {
        merged[q.id] = coerceAnswer(q.type, partialAnswers[q.id])
      }
    }
  }
  const verified = reconcileVerifiedFields({
    questions,
    previousAnswers,
    previousVerified,
    nextAnswers: merged,
  })

  const missing = questions
    .filter((q) => q.required && isBlank(merged[q.id]))
    .map((q) => ({ id: q.id, label: q.label }))
  if (missing.length > 0) {
    await supabase
      .from("kpi_submissions")
      .update({ metrics: merged, verified_fields: verified })
      .eq("id", submissionId)
    const labels = missing.map((m) => m.label).join(", ")
    throw new Error(`Required fields missing: ${labels}`)
  }

  const submittedAt = new Date().toISOString()
  const { error: subErr } = await supabase
    .from("kpi_submissions")
    .update({
      metrics: merged,
      verified_fields: verified,
      status: "submitted",
      submitted_at: submittedAt,
    })
    .eq("id", submissionId)
  if (subErr) throw new Error(subErr.message)

  await supabase
    .from("report_assignments")
    .update({ status: "submitted" })
    .eq("id", assignment.id)

  return {
    submission_id: submissionId,
    status: "submitted",
    submitted_at: submittedAt,
    answers: merged,
  }
}

// --- MCP server --------------------------------------------------------------

const server = new Server(
  { name: "qstp-founder-reports", version: "0.1.0" },
  { capabilities: { tools: {} } }
)

const TOOLS = [
  {
    name: "list_pending_reports",
    description:
      "List the founder's pending and in-progress KPI report assignments. Returns assignment_id, period, due_date, and whether a draft exists.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_report",
    description:
      "Fetch a single report assignment with its questions and any current draft answers. Creates a draft submission if none exists yet. Each question includes current_value, blank flag, and verified source if prefilled from Stripe/Google/AI.",
    inputSchema: {
      type: "object",
      properties: {
        assignment_id: { type: "string", description: "The assignment UUID." },
      },
      required: ["assignment_id"],
      additionalProperties: false,
    },
  },
  {
    name: "save_draft",
    description:
      "Merge partial answers into the draft submission. `answers` is a map of question id -> value. Values are coerced to the question's type. Does NOT submit.",
    inputSchema: {
      type: "object",
      properties: {
        assignment_id: { type: "string" },
        answers: {
          type: "object",
          description:
            "Map of question id -> answer value (string, number, boolean, or null).",
          additionalProperties: true,
        },
      },
      required: ["assignment_id", "answers"],
      additionalProperties: false,
    },
  },
  {
    name: "submit_report",
    description:
      "Final submit. Optionally pass remaining `answers` to merge in before submitting. Validates that all required questions have non-blank answers; throws with the missing labels otherwise. Idempotent: re-calling on a submitted report returns the existing submission unchanged.",
    inputSchema: {
      type: "object",
      properties: {
        assignment_id: { type: "string" },
        answers: {
          type: "object",
          description: "Optional final answers to merge before submit.",
          additionalProperties: true,
        },
      },
      required: ["assignment_id"],
      additionalProperties: false,
    },
  },
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params
  try {
    let result
    switch (name) {
      case "list_pending_reports":
        result = await listPending()
        break
      case "get_report":
        result = await getReport(args.assignment_id)
        break
      case "save_draft":
        result = await saveDraft(args.assignment_id, args.answers ?? {})
        break
      case "submit_report":
        result = await submitReport(args.assignment_id, args.answers ?? null)
        break
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }
  } catch (e) {
    return {
      isError: true,
      content: [
        { type: "text", text: e instanceof Error ? e.message : String(e) },
      ],
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
console.error("[mcp] qstp-founder-reports ready")
