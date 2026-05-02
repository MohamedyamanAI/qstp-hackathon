import { generateObject } from "ai"
import { vertex } from "@ai-sdk/google-vertex/edge"
import { z } from "zod"

import {
  coerceAnswer,
  type ReportAnswerValue,
  type ReportQuestion,
} from "@/lib/reports/schema"

export type GmailMessageInput = {
  subject: string
  from: string
  date: string
  snippet: string
}

export type DriveTitleInput = {
  name: string
  mime: string
  modified_at?: string
}

export type ExtractInput = {
  questions: ReportQuestion[]
  emails: GmailMessageInput[]
  driveTitles: DriveTitleInput[]
  periodStart: string
  periodEnd: string
}

export type ExtractedField = {
  fieldId: string
  value: ReportAnswerValue
  evidence: string
  source: "google_workspace" | "google_drive"
}

export type ExtractResult = {
  fields: ExtractedField[]
}

const responseSchema = z.object({
  fields: z
    .array(
      z.object({
        field_id: z
          .string()
          .describe("Must exactly match one of the provided question ids."),
        value: z
          .string()
          .describe(
            "The extracted value as a plain string. Numbers without units, currency without symbols, percentages without %. For booleans use 'true' or 'false'."
          ),
        evidence: z
          .string()
          .describe(
            "Short quote or paraphrase from the source explaining why this value applies. Max ~120 chars."
          ),
        source: z
          .enum(["google_workspace", "google_drive"])
          .describe("Which source the evidence came from."),
      })
    )
    .describe(
      "One entry per field that can be confidently filled. Omit fields with no clear evidence."
    ),
})

export async function extractFromGoogle(
  input: ExtractInput
): Promise<ExtractResult> {
  if (input.questions.length === 0) {
    return { fields: [] }
  }
  if (input.emails.length === 0 && input.driveTitles.length === 0) {
    return { fields: [] }
  }

  const questionLines = input.questions.map(
    (q) =>
      `- id="${q.id}" type=${q.type}${q.unit ? ` unit=${q.unit}` : ""} label="${q.label}"`
  )

  const emailLines = input.emails.slice(0, 40).map((m, i) => {
    const subject = oneLine(m.subject) || "(no subject)"
    const from = oneLine(m.from)
    const date = oneLine(m.date)
    const snippet = oneLine(m.snippet)
    return `${i + 1}. [${date}] from=${from} subject="${subject}" snippet="${snippet}"`
  })

  const driveLines = input.driveTitles.slice(0, 30).map((f, i) => {
    return `${i + 1}. [${f.modified_at ?? ""}] (${f.mime}) ${oneLine(f.name)}`
  })

  const prompt = `You extract structured KPI report values from a founder's Gmail subjects/snippets and Drive document titles for the period ${input.periodStart} to ${input.periodEnd}.

QUESTIONS (use these ids exactly):
${questionLines.join("\n")}

GMAIL (sent and received headers + snippets, most recent first):
${emailLines.length ? emailLines.join("\n") : "(none)"}

DRIVE TITLES (created/modified in period):
${driveLines.length ? driveLines.join("\n") : "(none)"}

Rules:
- Only emit a field if the evidence clearly supports it. When in doubt, omit.
- For currency/number/percent questions, return only digits (e.g. "20000" not "$20K").
- Convert shorthand: "20K" → "20000", "1.2M" → "1200000", "5%" → "5".
- For text/longtext, prefer concise factual phrases drawn from the evidence (e.g., "Won $20K QFC grant").
- Do NOT invent values that aren't supported by the email/drive data.
- Each evidence string must reference the originating subject or filename.`

  const { object } = await generateObject({
    model: vertex("gemini-2.5-flash"),
    schema: responseSchema,
    prompt,
  })

  const byId = new Map(input.questions.map((q) => [q.id, q]))
  const fields: ExtractedField[] = []

  for (const raw of object.fields) {
    const question = byId.get(raw.field_id)
    if (!question) continue
    const coerced = coerceAnswer(question.type, raw.value)
    if (coerced === null) continue
    fields.push({
      fieldId: question.id,
      value: coerced,
      evidence: raw.evidence.slice(0, 200),
      source: raw.source,
    })
  }

  return { fields }
}

function oneLine(value: string | undefined): string {
  if (!value) return ""
  return value.replace(/\s+/g, " ").replace(/"/g, "'").trim().slice(0, 240)
}
