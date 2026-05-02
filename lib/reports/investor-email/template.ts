export type MetricTile = {
  label: string
  value: string
  delta?: string
  trend?: "up" | "down" | "flat"
}

export type InvestorEmailData = {
  startupName: string
  founderName: string
  periodLabel: string
  metrics: MetricTile[]
  wins: string[]
  challenge?: string
  asks: string[]
  generatedAt: string
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const trendBadge = (trend?: "up" | "down" | "flat", delta?: string) => {
  if (!delta) return ""
  const palette =
    trend === "down"
      ? { bg: "#fee2e2", fg: "#991b1b", arrow: "▼" }
      : trend === "flat"
        ? { bg: "#e5e7eb", fg: "#374151", arrow: "→" }
        : { bg: "#dcfce7", fg: "#166534", arrow: "▲" }
  return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;background:${palette.bg};color:${palette.fg};font-size:11px;font-weight:600;letter-spacing:0.02em;">${palette.arrow} ${escapeHtml(delta)}</span>`
}

export function renderInvestorEmailHtml(data: InvestorEmailData): string {
  const { startupName, founderName, periodLabel, metrics, wins, challenge, asks, generatedAt } = data

  const tiles = metrics
    .slice(0, 4)
    .map(
      (m) => `
      <td style="width:25%;padding:0 6px;vertical-align:top;">
        <div style="border:1px solid #e5e7eb;border-radius:14px;padding:18px 16px;background:#ffffff;height:100%;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">${escapeHtml(m.label)}</div>
          <div style="font-size:26px;font-weight:700;color:#0f172a;line-height:1.1;margin-bottom:8px;letter-spacing:-0.02em;">${escapeHtml(m.value)}</div>
          ${trendBadge(m.trend, m.delta)}
        </div>
      </td>`
    )
    .join("")

  const winsHtml = wins.length
    ? `<ul style="margin:0;padding-left:20px;color:#1f2937;font-size:14px;line-height:1.7;">
        ${wins.map((w) => `<li style="margin-bottom:6px;">${escapeHtml(w)}</li>`).join("")}
      </ul>`
    : `<p style="margin:0;color:#9ca3af;font-style:italic;font-size:14px;">No wins recorded this period.</p>`

  const asksHtml = asks.length
    ? `<ul style="margin:0;padding-left:20px;color:#1f2937;font-size:14px;line-height:1.7;">
        ${asks.map((a) => `<li style="margin-bottom:6px;">${escapeHtml(a)}</li>`).join("")}
      </ul>`
    : `<p style="margin:0;color:#9ca3af;font-style:italic;font-size:14px;">No specific asks this period.</p>`

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(startupName)} — Investor Update</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #0f172a;
    background: #f8fafc;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 28mm 22mm;
    background: #ffffff;
  }
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 18px;
    margin-bottom: 28px;
  }
  .brand {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #6b7280;
    margin-bottom: 6px;
  }
  .title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .period {
    font-size: 13px;
    color: #6b7280;
    margin-top: 6px;
  }
  .pill {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #ffffff;
    background: #0f172a;
    padding: 6px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .section {
    margin-top: 26px;
  }
  .section h2 {
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin: 0 0 12px 0;
  }
  .metrics-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 0 -6px;
  }
  .callout {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #fcd34d;
    border-radius: 14px;
    padding: 18px 20px;
  }
  .callout h2 { color: #92400e; }
  .challenge-box {
    background: #f8fafc;
    border-left: 3px solid #0f172a;
    border-radius: 4px;
    padding: 14px 18px;
    font-size: 14px;
    line-height: 1.6;
    color: #1f2937;
  }
  .footer {
    margin-top: 40px;
    padding-top: 18px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #9ca3af;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand">Investor Update</div>
        <div class="title">${escapeHtml(startupName)}</div>
        <div class="period">${escapeHtml(periodLabel)}</div>
      </div>
      <div class="pill">${escapeHtml(periodLabel.split(" ")[0] ?? "Update")}</div>
    </div>

    <div class="section">
      <h2>Key Metrics</h2>
      <table class="metrics-table" cellpadding="0" cellspacing="0"><tr>${tiles}</tr></table>
    </div>

    <div class="section">
      <h2>Wins this period</h2>
      ${winsHtml}
    </div>

    ${
      challenge
        ? `<div class="section">
        <h2>Challenge &amp; response</h2>
        <div class="challenge-box">${escapeHtml(challenge)}</div>
      </div>`
        : ""
    }

    <div class="section callout">
      <h2>Asks</h2>
      ${asksHtml}
    </div>

    <div class="footer">
      <span>${escapeHtml(founderName)} · Founder</span>
      <span>Generated ${escapeHtml(generatedAt)}</span>
    </div>
  </div>
</body>
</html>`
}
