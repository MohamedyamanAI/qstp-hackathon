import { generateObject } from "ai"
import { vertex } from "@ai-sdk/google-vertex/edge"
import { z } from "zod"

import type {
  ReportAnswers,
  ReportQuestion,
} from "@/lib/reports/schema"

export type DeckSyncEdit = {
  find: string
  replace: string
  metricKey: string
  reason: string
  confidence: "high" | "medium" | "low"
}

export type MapMetricsInput = {
  questions: ReportQuestion[]
  answers: ReportAnswers
  deckSlides: { index: number; text: string }[]
  startupName?: string
  periodLabel?: string
}

export type MapMetricsResult = {
  edits: DeckSyncEdit[]
  considered: { metricKey: string; label: string; newValue: string }[]
}

const responseSchema = z.object({
  edits: z
    .array(
      z.object({
        metric_key: z
          .string()
          .describe("Must match one of the provided question ids."),
        find: z
          .string()
          .describe(
            "Exact substring currently in the deck that represents the OLD value of this metric. Must be present verbatim — do not paraphrase or reformat."
          ),
        replace: z
          .string()
          .describe(
            "Replacement string with the NEW value, preserving the surrounding label/units/style of the find string when possible."
          ),
        reason: z
          .string()
          .describe("Short explanation, max ~120 chars."),
        confidence: z.enum(["high", "medium", "low"]),
      })
    )
    .describe(
      "One entry per metric you can confidently locate in the deck. Skip metrics you can't find."
    ),
})

export async function mapMetricsToDeckEdits(
  input: MapMetricsInput
): Promise<MapMetricsResult> {
  const considered = input.questions
    .map((q) => {
      const value = input.answers[q.id]
      if (value === null || value === undefined || value === "") return null
      return {
        metricKey: q.id,
        label: q.label,
        newValue: formatNewValue(q, value),
      }
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)

  if (considered.length === 0 || input.deckSlides.length === 0) {
    return { edits: [], considered }
  }

  const metricLines = input.questions
    .map((q) => {
      const value = input.answers[q.id]
      if (value === null || value === undefined || value === "") return null
      return `- key="${q.id}" type=${q.type}${q.unit ? ` unit=${q.unit}` : ""} label="${q.label}" new_value=${formatNewValue(q, value)}`
    })
    .filter((line): line is string => line !== null)

  const slideLines = input.deckSlides
    .map((s) => `--- Slide ${s.index} ---\n${s.text || "(empty)"}`)
    .join("\n")

  const prompt = `You are updating a startup pitch deck with new KPI numbers for ${input.startupName ?? "the startup"}${input.periodLabel ? ` (${input.periodLabel})` : ""}.

For each metric below, find the substring in the deck text that currently represents that metric's OLD value, and produce a replacement using the NEW value.

METRICS:
${metricLines.join("\n")}

DECK CONTENT (text only, slide by slide):
${slideLines}

Rules:
- "find" MUST be an exact substring that appears verbatim in the deck text above. Do not invent strings.
- "replace" should preserve the formatting style of the original (currency symbol, units, abbreviations like K/M, surrounding label text). E.g. if the deck says "MRR: $12K" and the new value is 15000, replace with "MRR: $15K".
- Confidence "high" only when you are sure the substring corresponds to this metric and nothing else.
- If the same metric appears multiple times with different formats, emit one edit per occurrence (each with its own exact "find").
- If a metric has no clear representation in the deck, skip it.
- Do NOT edit dates, names, or non-numeric content unrelated to the listed metrics.`

  const { object } = await generateObject({
    model: vertex("gemini-2.5-flash"),
    schema: responseSchema,
    prompt,
  })

  const validKeys = new Set(input.questions.map((q) => q.id))
  const deckCorpus = input.deckSlides.map((s) => s.text).join("\n")
  const edits: DeckSyncEdit[] = []
  const seen = new Set<string>()
  for (const raw of object.edits) {
    if (!validKeys.has(raw.metric_key)) continue
    if (!raw.find || !raw.replace) continue
    if (raw.find === raw.replace) continue
    if (!deckCorpus.includes(raw.find)) continue
    const dedupeKey = `${raw.find}→${raw.replace}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    edits.push({
      metricKey: raw.metric_key,
      find: raw.find,
      replace: raw.replace,
      reason: raw.reason.slice(0, 200),
      confidence: raw.confidence,
    })
  }

  return { edits, considered }
}

function formatNewValue(
  question: ReportQuestion,
  value: string | number | boolean
): string {
  if (typeof value === "boolean") return value ? "yes" : "no"
  if (question.type === "currency") {
    const n = typeof value === "number" ? value : Number(value)
    if (Number.isFinite(n))
      return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}${question.unit ? ` ${question.unit}` : ""}`
    return String(value)
  }
  if (question.type === "percent") {
    const n = typeof value === "number" ? value : Number(value)
    if (Number.isFinite(n)) return `${n}%`
    return String(value)
  }
  if (question.type === "number") {
    const n = typeof value === "number" ? value : Number(value)
    if (Number.isFinite(n)) return n.toLocaleString("en-US")
    return String(value)
  }
  return String(value)
}
