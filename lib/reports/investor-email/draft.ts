import { generateObject } from "ai"
import { vertex } from "@ai-sdk/google-vertex/edge"
import { z } from "zod"

import type { ReportAnswers, ReportQuestion } from "@/lib/reports/schema"

import type { MetricTile } from "./template"

export type DraftedEmail = {
  subject: string
  bodyText: string
  wins: string[]
  challenge?: string
  asks: string[]
}

export type DraftInput = {
  startupName: string
  founderName: string
  founderFirstName: string
  periodLabel: string
  questions: ReportQuestion[]
  answers: ReportAnswers
  previousAnswers?: ReportAnswers | null
}

const draftSchema = z.object({
  subject: z.string().describe("Email subject line, ~60-80 chars, includes one headline metric."),
  bodyText: z
    .string()
    .describe(
      "Plain-text investor email body. 4-6 short paragraphs. Greeting, headline, 2-3 metric callouts in prose, brief closing. NO bullet lists (those go in the PDF). NO sign-off (we'll append the founder name)."
    ),
  wins: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("3-5 concrete wins from this period. ~10 words each. No emojis."),
  challenge: z
    .string()
    .optional()
    .describe(
      "ONE short paragraph: a real challenge we faced and what we're doing about it. Honest, not vague. Omit if no challenge is evident from the data."
    ),
  asks: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe(
      "2-3 specific asks of investors: intros, hires, customers, advice. Concrete, not platitudes."
    ),
})

const fmt = (v: unknown, type: ReportQuestion["type"], unit?: string): string => {
  if (v === null || v === undefined || v === "") return "—"
  if (type === "currency") {
    const n = Number(v)
    return Number.isFinite(n)
      ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : String(v)
  }
  if (type === "percent") {
    const n = Number(v)
    return Number.isFinite(n) ? `${n}%` : String(v)
  }
  if (type === "number") {
    const n = Number(v)
    return Number.isFinite(n) ? n.toLocaleString("en-US") : String(v)
  }
  if (type === "boolean") return v ? "Yes" : "No"
  return `${v}${unit ? ` ${unit}` : ""}`
}

function pctDelta(curr: number, prev: number): { text: string; trend: "up" | "down" | "flat" } {
  if (prev === 0) return { text: curr > 0 ? "new" : "—", trend: curr > 0 ? "up" : "flat" }
  const diff = ((curr - prev) / Math.abs(prev)) * 100
  if (Math.abs(diff) < 0.5) return { text: "flat", trend: "flat" }
  const sign = diff > 0 ? "+" : ""
  return {
    text: `${sign}${diff.toFixed(diff < 10 && diff > -10 ? 1 : 0)}%`,
    trend: diff > 0 ? "up" : "down",
  }
}

/**
 * Pick top metric tiles for the PDF — prefer numeric/currency/percent fields
 * with non-empty values. Compute MoM deltas vs previous submission if present.
 */
export function buildMetricTiles(input: DraftInput): MetricTile[] {
  const numericTypes = new Set<ReportQuestion["type"]>(["currency", "number", "percent"])
  const candidates = input.questions.filter(
    (q) => numericTypes.has(q.type) && input.answers[q.id] !== null && input.answers[q.id] !== undefined && input.answers[q.id] !== ""
  )

  const priorityOrder = ["mrr", "revenue", "arr", "customers", "users", "downloads"]
  candidates.sort((a, b) => {
    const ai = priorityOrder.findIndex((k) => a.id.toLowerCase().includes(k))
    const bi = priorityOrder.findIndex((k) => b.id.toLowerCase().includes(k))
    const aw = ai === -1 ? 99 : ai
    const bw = bi === -1 ? 99 : bi
    return aw - bw
  })

  return candidates.slice(0, 4).map((q) => {
    const value = fmt(input.answers[q.id], q.type, q.unit)
    let delta: string | undefined
    let trend: "up" | "down" | "flat" | undefined
    if (input.previousAnswers && q.type !== "percent") {
      const curr = Number(input.answers[q.id])
      const prev = Number(input.previousAnswers[q.id])
      if (Number.isFinite(curr) && Number.isFinite(prev)) {
        const d = pctDelta(curr, prev)
        delta = d.text
        trend = d.trend
      }
    }
    return { label: q.label, value, delta, trend }
  })
}

function summarizeAnswers(input: DraftInput): string {
  const lines: string[] = []
  for (const q of input.questions) {
    const curr = input.answers[q.id]
    if (curr === null || curr === undefined || curr === "") continue
    const currStr = fmt(curr, q.type, q.unit)
    const prev = input.previousAnswers?.[q.id]
    const prevStr = prev !== undefined && prev !== null && prev !== "" ? ` (prev ${fmt(prev, q.type, q.unit)})` : ""
    lines.push(`- ${q.label}: ${currStr}${prevStr}`)
  }
  return lines.join("\n")
}

export async function draftInvestorEmail(input: DraftInput): Promise<DraftedEmail> {
  const data = summarizeAnswers(input)

  const prompt = `You are drafting a monthly investor update for "${input.startupName}".
Tone: confident, concise, data-led, founder-voice. Avoid hype.
Period: ${input.periodLabel}.
Founder: ${input.founderFirstName}.

This period's metrics (with previous-period comparison where available):
${data || "(no metrics provided)"}

Write the update following the schema. The bodyText should READ as a personal note — it will be the email body. The wins/challenge/asks are for the attached PDF, so make them crisp and skimmable. Use the metric movements above to ground concrete claims (e.g., "MRR up X%"). Do not invent numbers not present.`

  const { object } = await generateObject({
    model: vertex("gemini-2.5-flash"),
    schema: draftSchema,
    prompt,
  })

  return object
}
