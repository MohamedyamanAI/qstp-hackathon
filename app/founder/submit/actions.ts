"use server"

import { Resend } from "resend"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireRole } from "@/lib/auth/require"
import {
  buildReportPrefill,
  mergePrefillIntoDraft,
  reconcileVerifiedFieldsAfterEdit,
} from "@/lib/integrations/report-prefill"
import { syncGoogleForStartup } from "@/lib/integrations/google"
import { syncStripeForStartup } from "@/lib/integrations/stripe"
import { dispatchToUsers } from "@/lib/notifications/dispatch"
import {
  buildFilingPack,
  parseExtendedProfile,
  type FilingFlag,
  type FilingPack,
} from "@/lib/reports/government-filing/build"
import { renderFilingPdf } from "@/lib/reports/government-filing/pdf"
import {
  buildMetricTiles,
  draftInvestorEmail,
  type DraftedEmail,
} from "@/lib/reports/investor-email/draft"
import { renderInvestorPdf } from "@/lib/reports/investor-email/pdf"
import { type MetricTile } from "@/lib/reports/investor-email/template"
import {
  coerceAnswer,
  parseAnswers,
  parseQuestions,
  parseVerifiedFields,
  type ReportAnswers,
} from "@/lib/reports/schema"
import type { Json } from "@/lib/supabase/database.types"

export type ActionState = { error?: string; ok?: boolean } | undefined

async function loadAssignmentForFounder(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  founderId: string,
  assignmentId: string
) {
  const { data, error } = await supabase
    .from("report_assignments")
    .select(
      "id, status, submission_id, publication_id, startup_id, startups!inner(founder_id, name, sector, stage, team_size, connected_integrations, extended_profile), report_publications!inner(period_start, period_end, questions)"
    )
    .eq("id", assignmentId)
    .maybeSingle()

  if (error || !data) return null
  if (data.startups.founder_id !== founderId) return null
  return data
}

async function applyReportPrefillToSubmission({
  supabase,
  assignment,
  submissionId,
}: {
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"]
  assignment: NonNullable<Awaited<ReturnType<typeof loadAssignmentForFounder>>>
  submissionId: string
}) {
  const questions = parseQuestions(assignment.report_publications.questions)
  if (questions.length === 0) return

  const { data: submission } = await supabase
    .from("kpi_submissions")
    .select("metrics, verified_fields")
    .eq("id", submissionId)
    .maybeSingle()
  const { data: startup } = await supabase
    .from("startups")
    .select(
      "name, sector, stage, team_size, connected_integrations, extended_profile"
    )
    .eq("id", assignment.startup_id)
    .maybeSingle()
  if (!startup) return

  const prefill = buildReportPrefill({
    startup,
    questions,
  })
  const merged = mergePrefillIntoDraft({
    currentAnswers: parseAnswers(submission?.metrics ?? null),
    currentVerifiedFields: parseVerifiedFields(
      submission?.verified_fields ?? null
    ),
    prefillAnswers: prefill.answers,
    prefillVerifiedFields: prefill.verifiedFields,
  })

  if (!merged.changed) return

  await supabase
    .from("kpi_submissions")
    .update({
      metrics: merged.answers as unknown as Json,
      verified_fields: merged.verifiedFields as unknown as Json,
    })
    .eq("id", submissionId)
}

export async function openAssignment(formData: FormData): Promise<void> {
  const { supabase, userId } = await requireRole("founder")
  const assignmentId = String(formData.get("assignment_id") ?? "")
  if (!assignmentId) redirect("/founder/submit")

  const assignment = await loadAssignmentForFounder(
    supabase,
    userId,
    assignmentId
  )
  if (!assignment) redirect("/founder/submit")

  let submissionId = assignment.submission_id

  if (!submissionId) {
    const { data: created, error: createErr } = await supabase
      .from("kpi_submissions")
      .insert({
        startup_id: assignment.startup_id,
        submitted_by: userId,
        status: "in_progress",
        period_start: assignment.report_publications.period_start,
        period_end: assignment.report_publications.period_end,
        publication_id: assignment.publication_id,
      })
      .select("id")
      .single()

    if (createErr || !created) {
      redirect("/founder/submit")
    }

    submissionId = created.id

    await supabase
      .from("report_assignments")
      .update({ submission_id: submissionId, status: "in_progress" })
      .eq("id", assignment.id)
  } else if (assignment.status === "pending") {
    await supabase
      .from("report_assignments")
      .update({ status: "in_progress" })
      .eq("id", assignment.id)
  }

  await syncConnectedIntegrationsForAssignment(assignment)

  await applyReportPrefillToSubmission({
    supabase,
    assignment,
    submissionId,
  })

  revalidatePath("/founder/submit")
  redirect(`/founder/submit/${assignment.id}`)
}

async function syncConnectedIntegrationsForAssignment(
  assignment: NonNullable<Awaited<ReturnType<typeof loadAssignmentForFounder>>>
) {
  const integrations = asRecord(assignment.startups.connected_integrations)
  const periodStart = assignment.report_publications.period_start
  const periodEnd = assignment.report_publications.period_end
  const tasks: Promise<unknown>[] = []

  if (integrations.stripe === true) {
    tasks.push(
      syncStripeForStartup({
        startupId: assignment.startup_id,
        periodStart,
        periodEnd,
      })
    )
  }
  if (integrations.google_workspace === true) {
    tasks.push(
      syncGoogleForStartup({
        startupId: assignment.startup_id,
        periodStart,
        periodEnd,
      })
    )
  }

  // Prefill can still use the most recent successful snapshot if any sync errors.
  await Promise.allSettled(tasks)
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

async function readAnswersFromForm(
  formData: FormData,
  questions: ReturnType<typeof parseQuestions>
): Promise<ReportAnswers> {
  const answers: ReportAnswers = {}
  for (const q of questions) {
    const raw = formData.get(`q_${q.id}`)
    if (raw === null) {
      answers[q.id] = null
      continue
    }
    answers[q.id] = coerceAnswer(q.type, String(raw))
  }
  return answers
}

export async function saveDraft(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const assignmentId = String(formData.get("assignment_id") ?? "")
  if (!assignmentId) return { error: "Missing assignment." }

  const assignment = await loadAssignmentForFounder(
    supabase,
    userId,
    assignmentId
  )
  if (!assignment || !assignment.submission_id) {
    return { error: "Assignment not found." }
  }

  const questions = parseQuestions(assignment.report_publications.questions)
  const answers = await readAnswersFromForm(formData, questions)

  const { data: existing } = await supabase
    .from("kpi_submissions")
    .select("metrics, verified_fields")
    .eq("id", assignment.submission_id)
    .maybeSingle()
  const verifiedFields = reconcileVerifiedFieldsAfterEdit({
    questions,
    previousAnswers: parseAnswers(existing?.metrics ?? null),
    previousVerifiedFields: parseVerifiedFields(
      existing?.verified_fields ?? null
    ),
    nextAnswers: answers,
  })

  const { error } = await supabase
    .from("kpi_submissions")
    .update({
      metrics: answers as unknown as Json,
      verified_fields: verifiedFields as unknown as Json,
    })
    .eq("id", assignment.submission_id)

  if (error) return { error: error.message }

  revalidatePath(`/founder/submit/${assignment.id}`)
  return { ok: true }
}

export async function submitReport(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireRole("founder")
  const assignmentId = String(formData.get("assignment_id") ?? "")
  if (!assignmentId) return { error: "Missing assignment." }

  const assignment = await loadAssignmentForFounder(
    supabase,
    userId,
    assignmentId
  )
  if (!assignment || !assignment.submission_id) {
    return { error: "Assignment not found." }
  }

  const questions = parseQuestions(assignment.report_publications.questions)
  const answers = await readAnswersFromForm(formData, questions)
  const { data: existing } = await supabase
    .from("kpi_submissions")
    .select("metrics, verified_fields")
    .eq("id", assignment.submission_id)
    .maybeSingle()
  const verifiedFields = reconcileVerifiedFieldsAfterEdit({
    questions,
    previousAnswers: parseAnswers(existing?.metrics ?? null),
    previousVerifiedFields: parseVerifiedFields(
      existing?.verified_fields ?? null
    ),
    nextAnswers: answers,
  })

  const missingRequired = questions.filter(
    (q) => q.required && (answers[q.id] === null || answers[q.id] === undefined)
  )
  if (missingRequired.length > 0) {
    const labels = missingRequired.map((q) => q.label).join(", ")
    // Persist what we have as a draft before bailing.
    await supabase
      .from("kpi_submissions")
      .update({
        metrics: answers as unknown as Json,
        verified_fields: verifiedFields as unknown as Json,
      })
      .eq("id", assignment.submission_id)
    return { error: `Required: ${labels}` }
  }

  const submittedAt = new Date().toISOString()

  const { error: subErr } = await supabase
    .from("kpi_submissions")
    .update({
      metrics: answers as unknown as Json,
      verified_fields: verifiedFields as unknown as Json,
      status: "submitted",
      submitted_at: submittedAt,
    })
    .eq("id", assignment.submission_id)

  if (subErr) return { error: subErr.message }

  await supabase
    .from("report_assignments")
    .update({ status: "submitted" })
    .eq("id", assignment.id)

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "team")

  const { data: startup } = await supabase
    .from("startups")
    .select("name")
    .eq("id", assignment.startup_id)
    .maybeSingle()

  if (teamMembers && teamMembers.length > 0) {
    await dispatchToUsers({
      supabase,
      userIds: teamMembers.map((m) => m.id),
      payload: {
        type: "report_submitted",
        title: `New submission${startup?.name ? `: ${startup.name}` : ""}`,
        message: `A founder submitted their KPI report.`,
        action_url: `/team/reports/${assignment.publication_id}`,
        data: {
          submission_id: assignment.submission_id,
          publication_id: assignment.publication_id,
        },
      },
    })
  }

  // Touch parseAnswers so the import isn't unused; harmless.
  void parseAnswers(answers as unknown as Json)

  revalidatePath("/founder/submit")
  revalidatePath(`/founder/submit/${assignment.id}`)
  redirect(`/founder/submit/${assignment.id}`)
}

// ---------------------------------------------------------------------------
// Investor email — generate and send
// ---------------------------------------------------------------------------

export type GenerateInvestorEmailResult =
  | { ok: true; data: GeneratedInvestorEmail }
  | { ok: false; error: string }

export type GeneratedInvestorEmail = {
  subject: string
  bodyText: string
  wins: string[]
  challenge?: string
  asks: string[]
  tiles: MetricTile[]
  pdfBase64: string
  meta: {
    startupName: string
    founderName: string
    founderEmail: string
    periodLabel: string
  }
}

function periodLabel(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d: Date) =>
    d.toLocaleString("en-US", { month: "short", year: "numeric" })
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return fmt(s)
  return `${fmt(s)} – ${fmt(e)}`
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full
}

async function loadInvestorEmailContext(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  founderId: string,
  assignmentId: string
) {
  const { data: assignment } = await supabase
    .from("report_assignments")
    .select(
      "id, submission_id, startup_id, startup:startups!inner(id, name, founder_id), publication:report_publications!inner(period_start, period_end, questions)"
    )
    .eq("id", assignmentId)
    .maybeSingle()

  if (!assignment || assignment.startup.founder_id !== founderId) return null
  if (!assignment.submission_id) return null

  const { data: submission } = await supabase
    .from("kpi_submissions")
    .select(
      "id, metrics, generated_outputs, period_start, period_end, submitted_at"
    )
    .eq("id", assignment.submission_id)
    .maybeSingle()
  if (!submission) return null

  const { data: previous } = await supabase
    .from("kpi_submissions")
    .select("metrics")
    .eq("startup_id", assignment.startup_id)
    .eq("status", "submitted")
    .neq("id", submission.id)
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: founder } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", founderId)
    .maybeSingle()

  return { assignment, submission, previous, founder }
}

export async function generateInvestorEmail(
  assignmentId: string
): Promise<GenerateInvestorEmailResult> {
  const { supabase, userId } = await requireRole("founder")
  const ctx = await loadInvestorEmailContext(supabase, userId, assignmentId)
  if (!ctx) return { ok: false, error: "Submission not found." }
  if (!ctx.founder) return { ok: false, error: "Founder profile missing." }

  const questions = parseQuestions(ctx.assignment.publication.questions)
  const answers = parseAnswers(ctx.submission.metrics)
  const previousAnswers = ctx.previous
    ? parseAnswers(ctx.previous.metrics)
    : null

  const period = periodLabel(
    ctx.submission.period_start,
    ctx.submission.period_end
  )
  const startupName = ctx.assignment.startup.name
  const founderName = ctx.founder.full_name
  const founderEmail = ctx.founder.email

  let drafted: DraftedEmail
  try {
    drafted = await draftInvestorEmail({
      startupName,
      founderName,
      founderFirstName: firstName(founderName),
      periodLabel: period,
      questions,
      answers,
      previousAnswers,
    })
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Draft generation failed.",
    }
  }

  const tiles = buildMetricTiles({
    startupName,
    founderName,
    founderFirstName: firstName(founderName),
    periodLabel: period,
    questions,
    answers,
    previousAnswers,
  })

  let pdfBytes: Uint8Array
  try {
    pdfBytes = await renderInvestorPdf({
      startupName,
      founderName,
      periodLabel: period,
      metrics: tiles,
      wins: drafted.wins,
      challenge: drafted.challenge,
      asks: drafted.asks,
      generatedAt: new Date().toLocaleDateString("en-US", {
        dateStyle: "medium",
      }),
    })
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "PDF render failed.",
    }
  }

  // Cache the draft (excluding PDF) on the submission so the send step is
  // deterministic and can re-render the PDF from the same data.
  const existingOutputs =
    ctx.submission.generated_outputs &&
    typeof ctx.submission.generated_outputs === "object" &&
    !Array.isArray(ctx.submission.generated_outputs)
      ? (ctx.submission.generated_outputs as Record<string, unknown>)
      : {}

  await supabase
    .from("kpi_submissions")
    .update({
      generated_outputs: {
        ...existingOutputs,
        investor_email: {
          subject: drafted.subject,
          bodyText: drafted.bodyText,
          wins: drafted.wins,
          challenge: drafted.challenge,
          asks: drafted.asks,
          tiles,
          generatedAt: new Date().toISOString(),
        },
      } as unknown as Json,
    })
    .eq("id", ctx.submission.id)

  return {
    ok: true,
    data: {
      subject: drafted.subject,
      bodyText: drafted.bodyText,
      wins: drafted.wins,
      challenge: drafted.challenge,
      asks: drafted.asks,
      tiles,
      pdfBase64: bytesToBase64(pdfBytes),
      meta: { startupName, founderName, founderEmail, periodLabel: period },
    },
  }
}

export type SendInvestorEmailInput = {
  assignmentId: string
  recipients: string[]
  subject: string
  bodyText: string
}

export type SendInvestorEmailResult =
  | { ok: true; sentTo: number }
  | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendInvestorEmail(
  input: SendInvestorEmailInput
): Promise<SendInvestorEmailResult> {
  const { supabase, userId } = await requireRole("founder")

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Resend is not configured." }
  }

  const recipients = Array.from(
    new Set(
      input.recipients
        .map((r) => r.trim().toLowerCase())
        .filter((r) => EMAIL_RE.test(r))
    )
  )
  if (recipients.length === 0)
    return { ok: false, error: "Add at least one valid investor email." }

  const subject = input.subject.trim()
  if (!subject) return { ok: false, error: "Subject is required." }
  const bodyText = input.bodyText.trim()
  if (!bodyText) return { ok: false, error: "Body is required." }

  const ctx = await loadInvestorEmailContext(
    supabase,
    userId,
    input.assignmentId
  )
  if (!ctx) return { ok: false, error: "Submission not found." }
  if (!ctx.founder) return { ok: false, error: "Founder profile missing." }

  const cached =
    ctx.submission.generated_outputs &&
    typeof ctx.submission.generated_outputs === "object" &&
    !Array.isArray(ctx.submission.generated_outputs)
      ? (ctx.submission.generated_outputs as Record<string, unknown>)
          .investor_email
      : null
  if (!cached || typeof cached !== "object") {
    return { ok: false, error: "Generate the email first." }
  }
  const draft = cached as {
    wins: string[]
    challenge?: string
    asks: string[]
    tiles: MetricTile[]
  }

  const period = periodLabel(
    ctx.submission.period_start,
    ctx.submission.period_end
  )
  const startupName = ctx.assignment.startup.name
  const founderName = ctx.founder.full_name
  const founderEmail = ctx.founder.email

  let pdfBytes: Uint8Array
  try {
    pdfBytes = await renderInvestorPdf({
      startupName,
      founderName,
      periodLabel: period,
      metrics: draft.tiles,
      wins: draft.wins,
      challenge: draft.challenge,
      asks: draft.asks,
      generatedAt: new Date().toLocaleDateString("en-US", {
        dateStyle: "medium",
      }),
    })
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "PDF render failed.",
    }
  }

  const fullBody = `${bodyText}\n\n— ${founderName}\nFounder, ${startupName}`
  const safeFile = `${startupName.replace(/[^A-Za-z0-9]+/g, "-")}-Update-${period.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`

  const fromHeader = buildFromHeader(founderName, startupName, fromEmail)

  const resend = new Resend(apiKey)
  try {
    const result = await resend.emails.send({
      from: fromHeader,
      to: recipients,
      replyTo: founderEmail,
      subject,
      text: fullBody,
      attachments: [
        {
          filename: safeFile,
          content: bytesToBase64(pdfBytes),
        },
      ],
    })
    if (result.error) return { ok: false, error: result.error.message }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed." }
  }

  // Mark sent
  const existingOutputs =
    ctx.submission.generated_outputs &&
    typeof ctx.submission.generated_outputs === "object" &&
    !Array.isArray(ctx.submission.generated_outputs)
      ? (ctx.submission.generated_outputs as Record<string, unknown>)
      : {}
  const existingEmail =
    existingOutputs.investor_email &&
    typeof existingOutputs.investor_email === "object" &&
    !Array.isArray(existingOutputs.investor_email)
      ? (existingOutputs.investor_email as Record<string, unknown>)
      : {}

  await supabase
    .from("kpi_submissions")
    .update({
      generated_outputs: {
        ...existingOutputs,
        investor_email: {
          ...existingEmail,
          subject,
          bodyText,
          lastSentAt: new Date().toISOString(),
          lastSentTo: recipients,
        },
      } as unknown as Json,
    })
    .eq("id", ctx.submission.id)

  revalidatePath(`/founder/submit/${input.assignmentId}`)
  return { ok: true, sentTo: recipients.length }
}

function buildFromHeader(
  founderName: string,
  startupName: string,
  fromEnv: string
): string {
  const env = fromEnv.trim()
  // Env may already be a full mailbox like "Brand <hi@brand.com>"; if so, use it.
  const envMailboxMatch = /<([^>]+)>/.exec(env)
  const bareEmail = envMailboxMatch ? envMailboxMatch[1].trim() : env
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bareEmail)) return env

  const rawName = (founderName?.trim() || startupName?.trim() || "").replace(
    /[\r\n]+/g,
    " "
  )
  // Strip characters that can't appear in a display name even when quoted.
  const cleaned = rawName.replace(/["\\]/g, "").trim()
  if (!cleaned) return bareEmail

  // RFC 5322: if name contains specials, it must be a quoted-string.
  const needsQuoting = /[(),:;<>@\[\]."]/.test(cleaned)
  const display = needsQuoting ? `"${cleaned}"` : cleaned
  return `${display} <${bareEmail}>`
}

// ---------------------------------------------------------------------------
// Government filing pack — generate Q15 + UBO PDFs from the latest submission
// ---------------------------------------------------------------------------

export type FilingDocKind =
  | "pack"
  | "q15"
  | "ubo"
  | "moci"
  | "gta"
  | "qdb"
  | "invest_qatar"

export type GeneratedFilingPack = {
  pack: FilingPack
  pdfBase64: Record<FilingDocKind, string>
  meta: {
    startupName: string
    legalNameEn: string
    qfcRegistrationNumber: string
    periodLabel: string
  }
  flags: FilingFlag[]
}

export type GenerateGovernmentFilingsResult =
  | { ok: true; data: GeneratedFilingPack }
  | { ok: false; error: string }

export async function generateGovernmentFilings(
  assignmentId: string
): Promise<GenerateGovernmentFilingsResult> {
  const { supabase, userId } = await requireRole("founder")

  const { data: assignment } = await supabase
    .from("report_assignments")
    .select(
      "id, submission_id, startup_id, startup:startups!inner(id, name, founder_id, extended_profile), publication:report_publications!inner(period_start, period_end, questions)"
    )
    .eq("id", assignmentId)
    .maybeSingle()

  if (!assignment || assignment.startup.founder_id !== userId) {
    return { ok: false, error: "Assignment not found." }
  }
  if (!assignment.submission_id) {
    return { ok: false, error: "Submission not found." }
  }

  const { data: submission } = await supabase
    .from("kpi_submissions")
    .select("id, metrics, generated_outputs, period_start, period_end")
    .eq("id", assignment.submission_id)
    .maybeSingle()
  if (!submission) return { ok: false, error: "Submission not found." }

  const { data: founder } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle()
  if (!founder) return { ok: false, error: "Founder profile missing." }

  const questions = parseQuestions(assignment.publication.questions)
  const answers = parseAnswers(submission.metrics)
  const extendedProfile = parseExtendedProfile(
    assignment.startup.extended_profile
  )

  const pack = buildFilingPack({
    startupName: assignment.startup.name,
    founderName: founder.full_name,
    extendedProfile,
    periodStart: submission.period_start,
    periodEnd: submission.period_end,
    questions,
    answers,
  })

  const docKinds: FilingDocKind[] = [
    "pack",
    "q15",
    "ubo",
    "moci",
    "gta",
    "qdb",
    "invest_qatar",
  ]
  let pdfs: Uint8Array[]
  try {
    pdfs = await Promise.all(docKinds.map((d) => renderFilingPdf(pack, d)))
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Filing render failed.",
    }
  }
  const pdfBase64 = Object.fromEntries(
    docKinds.map((d, i) => [d, bytesToBase64(pdfs[i])])
  ) as Record<FilingDocKind, string>

  const existingOutputs =
    submission.generated_outputs &&
    typeof submission.generated_outputs === "object" &&
    !Array.isArray(submission.generated_outputs)
      ? (submission.generated_outputs as Record<string, unknown>)
      : {}
  const existingFiling =
    existingOutputs.government_filings &&
    typeof existingOutputs.government_filings === "object" &&
    !Array.isArray(existingOutputs.government_filings)
      ? (existingOutputs.government_filings as Record<string, unknown>)
      : {}

  await supabase
    .from("kpi_submissions")
    .update({
      generated_outputs: {
        ...existingOutputs,
        government_filings: {
          ...existingFiling,
          generatedAt: new Date().toISOString(),
          flags: pack.flags,
          meta: pack.meta,
        },
      } as unknown as Json,
    })
    .eq("id", submission.id)

  return {
    ok: true,
    data: {
      pack,
      pdfBase64,
      meta: {
        startupName: assignment.startup.name,
        legalNameEn: pack.meta.legalNameEn,
        qfcRegistrationNumber: pack.meta.qfcRegistrationNumber,
        periodLabel: pack.meta.periodLabel,
      },
      flags: pack.flags,
    },
  }
}

export type MarkFilingSubmittedInput = {
  assignmentId: string
  doc: FilingDocKind
  reference?: string
}

export type MarkFilingSubmittedResult =
  | { ok: true; submittedAt: string }
  | { ok: false; error: string }

export async function markFilingSubmitted(
  input: MarkFilingSubmittedInput
): Promise<MarkFilingSubmittedResult> {
  const { supabase, userId } = await requireRole("founder")

  const { data: assignment } = await supabase
    .from("report_assignments")
    .select(
      "id, submission_id, startup_id, startup:startups!inner(founder_id)"
    )
    .eq("id", input.assignmentId)
    .maybeSingle()
  if (!assignment || assignment.startup.founder_id !== userId) {
    return { ok: false, error: "Assignment not found." }
  }
  if (!assignment.submission_id) {
    return { ok: false, error: "Submission not found." }
  }

  const { data: submission } = await supabase
    .from("kpi_submissions")
    .select("generated_outputs")
    .eq("id", assignment.submission_id)
    .maybeSingle()
  if (!submission) return { ok: false, error: "Submission not found." }

  const submittedAt = new Date().toISOString()
  const existingOutputs =
    submission.generated_outputs &&
    typeof submission.generated_outputs === "object" &&
    !Array.isArray(submission.generated_outputs)
      ? (submission.generated_outputs as Record<string, unknown>)
      : {}
  const existingFiling =
    existingOutputs.government_filings &&
    typeof existingOutputs.government_filings === "object" &&
    !Array.isArray(existingOutputs.government_filings)
      ? (existingOutputs.government_filings as Record<string, unknown>)
      : {}
  const submitted =
    existingFiling.submitted &&
    typeof existingFiling.submitted === "object" &&
    !Array.isArray(existingFiling.submitted)
      ? (existingFiling.submitted as Record<string, unknown>)
      : {}

  const next = {
    ...submitted,
    [input.doc]: {
      submittedAt,
      reference: input.reference?.trim() || null,
    },
  }

  await supabase
    .from("kpi_submissions")
    .update({
      generated_outputs: {
        ...existingOutputs,
        government_filings: {
          ...existingFiling,
          submitted: next,
        },
      } as unknown as Json,
    })
    .eq("id", assignment.submission_id)

  revalidatePath(`/founder/submit/${input.assignmentId}`)
  return { ok: true, submittedAt }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  // btoa is available in both Node 16+ and Workers
  return btoa(binary)
}
