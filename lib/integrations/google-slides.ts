type SlideText = { index: number; text: string }

export type DeckSnapshot = {
  presentationId: string
  title: string
  slides: SlideText[]
}

export type DeckEdit = {
  find: string
  replace: string
  metricKey?: string
}

type PageElement = {
  shape?: {
    text?: { textElements?: { textRun?: { content?: string } }[] }
  }
  table?: {
    tableRows?: {
      tableCells?: {
        text?: { textElements?: { textRun?: { content?: string } }[] }
      }[]
    }[]
  }
  group?: { children?: PageElement[] }
}

type SlideResource = {
  objectId?: string
  pageElements?: PageElement[]
}

type PresentationResource = {
  presentationId?: string
  title?: string
  slides?: SlideResource[]
}

export function parsePresentationId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  // Accept raw IDs (typical length 25-60, base64url-ish)
  if (/^[A-Za-z0-9_-]{20,}$/.test(trimmed)) return trimmed
  const match = trimmed.match(
    /docs\.google\.com\/presentation\/d\/([A-Za-z0-9_-]+)/
  )
  return match ? match[1] : null
}

export async function fetchDeckSnapshot({
  presentationId,
  accessToken,
}: {
  presentationId: string
  accessToken: string
}): Promise<DeckSnapshot> {
  const res = await fetch(
    `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; status?: string }
    }
    const msg = json.error?.message ?? `Slides fetch failed (${res.status})`
    throw new Error(msg)
  }
  const data = (await res.json()) as PresentationResource
  const slides: SlideText[] = (data.slides ?? []).map((slide, i) => ({
    index: i + 1,
    text: extractSlideText(slide).trim(),
  }))
  return {
    presentationId: data.presentationId ?? presentationId,
    title: data.title ?? "",
    slides,
  }
}

export async function applyDeckReplacements({
  presentationId,
  accessToken,
  edits,
}: {
  presentationId: string
  accessToken: string
  edits: DeckEdit[]
}): Promise<{ applied: { find: string; replace: string; occurrences: number }[] }> {
  if (edits.length === 0) return { applied: [] }

  const requests = edits.map((e) => ({
    replaceAllText: {
      containsText: { text: e.find, matchCase: true },
      replaceText: e.replace,
    },
  }))

  const res = await fetch(
    `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    }
  )
  const json = (await res.json().catch(() => ({}))) as {
    replies?: { replaceAllText?: { occurrencesChanged?: number } }[]
    error?: { message?: string }
  }
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Slides batchUpdate failed (${res.status})`)
  }
  const applied = (json.replies ?? []).map((reply, i) => ({
    find: edits[i].find,
    replace: edits[i].replace,
    occurrences: reply.replaceAllText?.occurrencesChanged ?? 0,
  }))
  return { applied }
}

function extractSlideText(slide: SlideResource): string {
  const parts: string[] = []
  walkElements(slide.pageElements ?? [], parts)
  return parts.join("\n")
}

function walkElements(elements: PageElement[], out: string[]): void {
  for (const el of elements) {
    if (el.shape?.text?.textElements) {
      const text = readTextElements(el.shape.text.textElements)
      if (text) out.push(text)
    }
    if (el.table?.tableRows) {
      for (const row of el.table.tableRows) {
        for (const cell of row.tableCells ?? []) {
          if (cell.text?.textElements) {
            const text = readTextElements(cell.text.textElements)
            if (text) out.push(text)
          }
        }
      }
    }
    if (el.group?.children) {
      walkElements(el.group.children, out)
    }
  }
}

function readTextElements(
  elements: { textRun?: { content?: string } }[]
): string {
  return elements
    .map((e) => e.textRun?.content ?? "")
    .join("")
    .replace(//g, "\n")
    .trimEnd()
}
