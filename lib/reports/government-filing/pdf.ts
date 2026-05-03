import { type FilingPack } from "./build"
import { type FilingDoc, renderFilingHtml } from "./template"

/**
 * Render a government-filing PDF (QFC pack, Q15, or UBO).
 *
 * Uses the Cloudflare Browser Rendering binding. Keep the Worker-facing code
 * free of the Node `puppeteer` package so OpenNext does not trace it into the
 * Cloudflare bundle.
 */
export async function renderFilingPdf(
  pack: FilingPack,
  doc: FilingDoc
): Promise<Uint8Array> {
  const html = renderFilingHtml(pack, doc)

  const browserBinding = await getBrowserBinding()
  if (browserBinding) {
    const { default: puppeteer } = await import("@cloudflare/puppeteer")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const browser = await puppeteer.launch(browserBinding as any)
    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: "networkidle0" })
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
      })
      return pdf
    } finally {
      await browser.close()
    }
  }

  throw new Error("Cloudflare Browser Rendering binding is not configured.")
}

async function getBrowserBinding(): Promise<unknown> {
  try {
    const mod = await import("@opennextjs/cloudflare")
    const ctx = await mod.getCloudflareContext({ async: true })
    const env = ctx?.env as { BROWSER?: unknown } | undefined
    return env?.BROWSER ?? null
  } catch {
    return null
  }
}
