import { getGoogleAccessTokenForStartup } from "@/lib/integrations/google"
import {
  applyDeckReplacements,
  fetchDeckSnapshot,
  parsePresentationId,
} from "@/lib/integrations/google-slides"
import {
  mapMetricsToDeckEdits,
  type DeckSyncEdit,
} from "@/lib/intelligence/features/deck-sync"
import type { ReportAnswers, ReportQuestion } from "@/lib/reports/schema"

export type DeckSyncResult = {
  ok: boolean
  syncedAt: string
  presentationId: string | null
  appliedEdits: {
    metricKey: string
    find: string
    replace: string
    occurrences: number
    reason: string
  }[]
  skippedEdits: {
    metricKey: string
    find: string
    replace: string
    reason: string
    confidence: "high" | "medium" | "low"
  }[]
  considered: { metricKey: string; label: string; newValue: string }[]
  error: string | null
}

export type SyncDeckInput = {
  startupId: string
  deckUrl: string
  questions: ReportQuestion[]
  answers: ReportAnswers
  startupName?: string
  periodLabel?: string
}

export async function syncDeckFromMetrics(
  input: SyncDeckInput
): Promise<DeckSyncResult> {
  const syncedAt = new Date().toISOString()
  const base: DeckSyncResult = {
    ok: false,
    syncedAt,
    presentationId: null,
    appliedEdits: [],
    skippedEdits: [],
    considered: [],
    error: null,
  }

  const presentationId = parsePresentationId(input.deckUrl)
  if (!presentationId) {
    return { ...base, error: "invalid_deck_url" }
  }
  base.presentationId = presentationId

  const token = await getGoogleAccessTokenForStartup(input.startupId)
  if (!token.ok) {
    return { ...base, error: token.reason }
  }

  let snapshot
  try {
    snapshot = await fetchDeckSnapshot({
      presentationId,
      accessToken: token.accessToken,
    })
  } catch (e) {
    return {
      ...base,
      error: e instanceof Error ? e.message : "deck_fetch_failed",
    }
  }

  const map = await mapMetricsToDeckEdits({
    questions: input.questions,
    answers: input.answers,
    deckSlides: snapshot.slides,
    startupName: input.startupName,
    periodLabel: input.periodLabel,
  })

  const highConfidence = map.edits.filter((e) => e.confidence === "high")
  const skipped: DeckSyncEdit[] = map.edits.filter(
    (e) => e.confidence !== "high"
  )

  if (highConfidence.length === 0) {
    return {
      ...base,
      ok: true,
      considered: map.considered,
      skippedEdits: skipped.map((e) => ({
        metricKey: e.metricKey,
        find: e.find,
        replace: e.replace,
        reason: e.reason,
        confidence: e.confidence,
      })),
    }
  }

  let applyResult
  try {
    applyResult = await applyDeckReplacements({
      presentationId,
      accessToken: token.accessToken,
      edits: highConfidence.map((e) => ({
        find: e.find,
        replace: e.replace,
        metricKey: e.metricKey,
      })),
    })
  } catch (e) {
    return {
      ...base,
      considered: map.considered,
      error: e instanceof Error ? e.message : "deck_update_failed",
    }
  }

  return {
    ok: true,
    syncedAt,
    presentationId,
    appliedEdits: applyResult.applied.map((a, i) => ({
      metricKey: highConfidence[i].metricKey,
      find: a.find,
      replace: a.replace,
      occurrences: a.occurrences,
      reason: highConfidence[i].reason,
    })),
    skippedEdits: skipped.map((e) => ({
      metricKey: e.metricKey,
      find: e.find,
      replace: e.replace,
      reason: e.reason,
      confidence: e.confidence,
    })),
    considered: map.considered,
    error: null,
  }
}

export function readDeckUrlFromExtendedProfile(
  extendedProfile: unknown
): string | null {
  if (!extendedProfile || typeof extendedProfile !== "object") return null
  const obj = extendedProfile as Record<string, unknown>
  const url = obj.slides_deck_url
  if (typeof url === "string" && url.trim()) return url.trim()
  return null
}
