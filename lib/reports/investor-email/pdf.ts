import { renderInvestorEmailHtml, type InvestorEmailData } from "./template"

/**
 * Render an investor-update PDF.
 *
 * On Cloudflare Workers (production / `wrangler dev --remote`) we use the
 * Browser Rendering binding via `@cloudflare/puppeteer`.
 *
 * The Worker bundle must not import the Node `puppeteer` package. OpenNext
 * traces dynamic imports during bundling, and Puppeteer's optional BiDi files
 * are not copied into the generated Worker package.
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
