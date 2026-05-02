import {
  coerceAnswer,
  type ReportAnswers,
  type ReportQuestion,
  type VerifiedFields,
} from "@/lib/reports/schema"
import type { Json } from "@/lib/supabase/database.types"

type JsonObject = Record<string, Json | undefined>

type StartupPrefillContext = {
  name: string
  sector: string
  stage: string
  team_size: number | null
  connected_integrations: Json
  extended_profile: Json
}

type ProviderSource =
  | "startup_profile"
  | "stripe"
  | "google_workspace"
  | "google_drive"
  | "google_calendar"
  | "linkedin"

type ProviderSnapshot = {
  source: ProviderSource
  label: string
  connected: boolean
  data: JsonObject
}

const PROVIDER_LABELS: Record<ProviderSource, string> = {
  startup_profile: "Profile",
  stripe: "Stripe",
  google_workspace: "Google Workspace",
  google_drive: "Google Drive",
  google_calendar: "Google Calendar",
  linkedin: "LinkedIn",
}

const FIELD_ALIASES: Record<ProviderSource, Record<string, string[]>> = {
  startup_profile: {
    company_name: ["company_name", "startup_name", "name"],
    sector: ["sector", "industry"],
    stage: ["stage"],
    team_size: ["team_size", "headcount", "employees"],
  },
  stripe: {
    revenue_this_month: [
      "revenue_this_month",
      "monthly_revenue",
      "revenue",
      "gross_revenue",
    ],
    mrr: ["mrr", "monthly_recurring_revenue"],
    arr: ["arr", "annual_recurring_revenue"],
    total_revenue_cumulative: [
      "total_revenue_cumulative",
      "cumulative_revenue",
      "lifetime_revenue",
    ],
    customers_reached: [
      "customers_reached",
      "customer_count",
      "paying_customers",
      "active_customers",
    ],
    revenue_per_active_user: ["revenue_per_active_user", "arpu"],
    conversion_rate_pct: ["conversion_rate_pct", "conversion_rate"],
  },
  google_workspace: {
    active_users: ["active_users", "workspace_active_users"],
    team_size: ["team_size", "licensed_users", "users"],
  },
  google_drive: {
    product_updates: ["product_updates", "docs_created", "files_created"],
    biggest_win: ["biggest_win", "launch_notes", "milestone"],
  },
  google_calendar: {
    sales_meetings: ["sales_meetings", "customer_meetings", "meetings"],
    investor_meetings: ["investor_meetings"],
  },
  linkedin: {
    team_size: ["team_size", "headcount", "employees"],
    hires_this_month: ["hires_this_month", "new_hires"],
    linkedin_followers: ["linkedin_followers", "followers"],
    biggest_win: ["biggest_win", "recent_update", "latest_post"],
  },
}

export function buildReportPrefill({
  startup,
  questions,
  now = new Date(),
}: {
  startup: StartupPrefillContext
  questions: ReportQuestion[]
  now?: Date
}): { answers: ReportAnswers; verifiedFields: VerifiedFields } {
  const snapshots = buildProviderSnapshots(startup)
  const answers: ReportAnswers = {}
  const verifiedFields: VerifiedFields = {}
  const pulledAt = now.toISOString()

  for (const question of questions) {
    const match = findProviderValue(question, snapshots)
    if (!match) continue

    const answer = coerceProviderValue(question, match.value)
    if (answer === null) continue

    answers[question.id] = answer
    verifiedFields[question.id] = {
      source: match.snapshot.source,
      is_verified: match.snapshot.source !== "startup_profile",
      pulled_at: pulledAt,
      label: match.snapshot.label,
    }
  }

  return { answers, verifiedFields }
}

export function mergePrefillIntoDraft({
  currentAnswers,
  currentVerifiedFields,
  prefillAnswers,
  prefillVerifiedFields,
}: {
  currentAnswers: ReportAnswers
  currentVerifiedFields: VerifiedFields
  prefillAnswers: ReportAnswers
  prefillVerifiedFields: VerifiedFields
}): {
  answers: ReportAnswers
  verifiedFields: VerifiedFields
  changed: boolean
} {
  const answers = { ...currentAnswers }
  const verifiedFields = { ...currentVerifiedFields }
  let changed = false

  for (const [fieldId, value] of Object.entries(prefillAnswers)) {
    if (!isBlankAnswer(answers[fieldId])) continue
    answers[fieldId] = value
    verifiedFields[fieldId] = prefillVerifiedFields[fieldId]
    changed = true
  }

  return { answers, verifiedFields, changed }
}

export function reconcileVerifiedFieldsAfterEdit({
  questions,
  previousAnswers,
  previousVerifiedFields,
  nextAnswers,
}: {
  questions: ReportQuestion[]
  previousAnswers: ReportAnswers
  previousVerifiedFields: VerifiedFields
  nextAnswers: ReportAnswers
}): VerifiedFields {
  const next: VerifiedFields = {}
  const changedAt = new Date().toISOString()

  for (const question of questions) {
    const value = nextAnswers[question.id]
    if (isBlankAnswer(value)) continue

    const previousMeta = previousVerifiedFields[question.id]
    if (
      previousMeta &&
      previousMeta.source !== "manual" &&
      answerValuesEqual(previousAnswers[question.id], value)
    ) {
      next[question.id] = previousMeta
      continue
    }

    next[question.id] = {
      source: "manual",
      is_verified: false,
      pulled_at: changedAt,
      label: "Manual",
    }
  }

  return next
}

function buildProviderSnapshots(
  startup: StartupPrefillContext
): ProviderSnapshot[] {
  const connected = asObject(startup.connected_integrations)
  const extended = asObject(startup.extended_profile)

  return [
    providerSnapshot("stripe", connected, extended),
    providerSnapshot("google_workspace", connected, extended),
    providerSnapshot("google_drive", connected, extended),
    providerSnapshot("google_calendar", connected, extended),
    providerSnapshot("linkedin", connected, extended),
    {
      source: "startup_profile" as const,
      label: PROVIDER_LABELS.startup_profile,
      connected: true,
      data: {
        company_name: startup.name,
        name: startup.name,
        sector: startup.sector,
        stage: startup.stage,
        team_size: startup.team_size,
      },
    },
  ].filter((snapshot) => snapshot.connected)
}

function providerSnapshot(
  source: ProviderSource,
  connectedIntegrations: JsonObject,
  extendedProfile: JsonObject
): ProviderSnapshot {
  return {
    source,
    label: PROVIDER_LABELS[source],
    connected: isConnected(source, connectedIntegrations),
    data: readProviderData(source, extendedProfile),
  }
}

function isConnected(source: ProviderSource, connected: JsonObject): boolean {
  if (source === "startup_profile") return true
  if (source === "google_drive" || source === "google_calendar") {
    return connected.google_workspace === true || connected[source] === true
  }
  return connected[source] === true
}

function readProviderData(
  source: ProviderSource,
  extended: JsonObject
): JsonObject {
  const integrationSnapshots = asObject(extended.integration_snapshots)
  const integrations = asObject(extended.integrations)

  return firstObject(
    integrationSnapshots[source],
    integrations[source],
    extended[source]
  )
}

function findProviderValue(
  question: ReportQuestion,
  snapshots: ProviderSnapshot[]
): { snapshot: ProviderSnapshot; value: Json } | null {
  const questionKeys = normalizedQuestionKeys(question)

  for (const snapshot of snapshots) {
    const aliases = FIELD_ALIASES[snapshot.source]
    for (const [canonicalKey, candidates] of Object.entries(aliases)) {
      if (
        !questionKeys.some((key) =>
          keyMatchesAny(key, [canonicalKey, ...candidates])
        )
      ) {
        continue
      }

      const value = readFirstValue(snapshot.data, [canonicalKey, ...candidates])
      if (value !== undefined) return { snapshot, value }
    }
  }

  return null
}

function normalizedQuestionKeys(question: ReportQuestion): string[] {
  return [
    normalizeKey(question.id),
    normalizeKey(question.label),
    ...question.label.split(/\s+/).map(normalizeKey),
  ].filter(Boolean)
}

function keyMatchesAny(key: string, candidates: string[]): boolean {
  return candidates.some((candidate) => {
    const normalized = normalizeKey(candidate)
    return (
      key === normalized || key.includes(normalized) || normalized.includes(key)
    )
  })
}

function readFirstValue(data: JsonObject, keys: string[]): Json | undefined {
  for (const key of keys) {
    const direct = data[key]
    if (direct !== undefined) return direct
    const normalized = normalizeKey(key)
    for (const [candidateKey, value] of Object.entries(data)) {
      if (normalizeKey(candidateKey) === normalized && value !== undefined) {
        return value
      }
    }
  }
  return undefined
}

function coerceProviderValue(
  question: ReportQuestion,
  value: Json
): ReportAnswers[string] {
  if (value === null || value === undefined) return null
  if (typeof value === "boolean")
    return question.type === "boolean" ? value : null
  if (typeof value === "number")
    return coerceAnswer(question.type, String(value))
  if (typeof value === "string") return coerceAnswer(question.type, value)
  return null
}

function asObject(value: Json | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject
  }
  return {}
}

function firstObject(...values: (Json | undefined)[]): JsonObject {
  for (const value of values) {
    const obj = asObject(value)
    if (Object.keys(obj).length > 0) return obj
  }
  return {}
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

function isBlankAnswer(value: ReportAnswers[string] | undefined): boolean {
  return value === null || value === undefined || value === ""
}

function answerValuesEqual(
  a: ReportAnswers[string] | undefined,
  b: ReportAnswers[string]
): boolean {
  if (typeof a === "number" || typeof b === "number")
    return Number(a) === Number(b)
  return a === b
}
