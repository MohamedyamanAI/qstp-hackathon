import { renderInvestorEmailHtml, type InvestorEmailData } from "./template"

/**
 * Render an investor-update PDF.
 *
 * On Cloudflare Workers (production / `wrangler dev --remote`) we use the
 * Browser Rendering binding via `@cloudflare/puppeteer`.
 *
 * On Node (`pnpm dev`, no binding present) we fall back to local Puppeteer.
 * The dynamic import keeps `puppeteer` (heavy, devDependency) out of the
 * Worker bundle.
 */
export async function renderInvestorPdf(data: InvestorEmailData): Promise<Uint8Array> {
  const html = renderInvestorEmailHtml(data)

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

  // Local dev fallback — uses node Puppeteer
  const { default: nodePuppeteer } = await import("puppeteer")
  const browser = await nodePuppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    })
    return new Uint8Array(pdf)
  } finally {
    await browser.close()
  }
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
