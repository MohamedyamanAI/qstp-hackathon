import type { FilingPack } from "./build"

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

// Brand palette — QFC-style purple
const C = {
  ink: "#0f0a1f",
  ink2: "#1f1735",
  text: "#211a36",
  muted: "#6b6685",
  line: "#ece7f5",
  line2: "#dcd3ee",
  cardBg: "#ffffff",
  pageBg: "#f4f1fb",
  primary: "#5b2bb5", // QFC purple
  primaryDeep: "#3f1b8a",
  primaryLight: "#ede5fb",
  accent: "#a78bfa",
  warnBg: "#fff4e5",
  warnLine: "#f6b26b",
  warnInk: "#7a3d00",
  okBg: "#e7f9f0",
  okInk: "#0a6b3b",
}

// Inline SVG mark used as the QFC logo placeholder. The wordmark uses the
// purple primary; replace this block with an <img> pointing to /qfc-logo.png
// when the official asset is dropped into /public.
function qfcLogoSvg(): string {
  return `
  <svg width="118" height="40" viewBox="0 0 118 40" xmlns="http://www.w3.org/2000/svg" aria-label="QFC">
    <defs>
      <linearGradient id="qfcg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${C.primary}" />
        <stop offset="100%" stop-color="${C.primaryDeep}" />
      </linearGradient>
    </defs>
    <rect x="0" y="3" width="40" height="34" rx="9" fill="url(#qfcg)" />
    <text x="20" y="26" text-anchor="middle" font-family="-apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="17" fill="#ffffff" letter-spacing="0.5">QFC</text>
    <text x="50" y="18" font-family="-apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="11" fill="${C.ink}" letter-spacing="1.4">QATAR</text>
    <text x="50" y="31" font-family="-apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="9" fill="${C.muted}" letter-spacing="1.2">FINANCIAL CENTRE</text>
  </svg>`
}

// Authority badges for non-QFC pages.
function authorityBadge(label: string, sub: string): string {
  return `
  <svg width="118" height="40" viewBox="0 0 118 40" xmlns="http://www.w3.org/2000/svg" aria-label="${escapeHtml(label)}">
    <defs>
      <linearGradient id="abg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${C.primary}" />
        <stop offset="100%" stop-color="${C.primaryDeep}" />
      </linearGradient>
    </defs>
    <rect x="0" y="3" width="40" height="34" rx="9" fill="url(#abg)" />
    <text x="20" y="26" text-anchor="middle" font-family="-apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="13" fill="#ffffff" letter-spacing="0.5">${escapeHtml(label.slice(0, 4).toUpperCase())}</text>
    <text x="50" y="18" font-family="-apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="11" fill="${C.ink}" letter-spacing="1.2">${escapeHtml(label.toUpperCase())}</text>
    <text x="50" y="31" font-family="-apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="9" fill="${C.muted}" letter-spacing="0.8">${escapeHtml(sub.toUpperCase())}</text>
  </svg>`
}

const baseStyles = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: ${C.text};
    background: ${C.pageBg};
    -webkit-font-smoothing: antialiased;
  }
  .page {
    position: relative;
    width: 210mm;
    min-height: 297mm;
    padding: 22mm 20mm 28mm 20mm;
    background: ${C.cardBg};
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  .page::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 6px;
    background: linear-gradient(90deg, ${C.primary} 0%, ${C.primaryDeep} 60%, ${C.accent} 100%);
  }
  .page::after {
    content: "";
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 14mm;
    background: linear-gradient(180deg, transparent 0%, ${C.primaryLight} 100%);
    opacity: 0.55;
    pointer-events: none;
  }
  .ribbon {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 2px solid ${C.primary};
    padding-bottom: 16px;
    margin-bottom: 22px;
  }
  .ribbon-left { display: flex; align-items: flex-start; gap: 14px; }
  .brand { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${C.primary}; margin-bottom: 4px; }
  .h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; color: ${C.ink}; }
  .sub { font-size: 12px; color: ${C.muted}; margin-top: 4px; }
  .pill {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: ${C.primary};
    color: #ffffff;
    padding: 6px 11px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .pill.amber { background: ${C.warnInk}; }
  .pill.emerald { background: ${C.okInk}; }
  .pill.outline { background: transparent; color: ${C.primary}; border: 1px solid ${C.primary}; }
  .section { margin-top: 22px; }
  .section h2 {
    font-size: 11px;
    font-weight: 700;
    color: ${C.primary};
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section h2::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: ${C.primary};
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid ${C.line2};
    border-radius: 12px;
    overflow: hidden;
    background: #ffffff;
  }
  .grid .cell {
    padding: 12px 14px;
    border-right: 1px solid ${C.line};
    border-bottom: 1px solid ${C.line};
  }
  .grid .cell:nth-child(2n) { border-right: 0; }
  .grid .cell:nth-last-child(-n+2) { border-bottom: 0; }
  .cell .lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.muted}; margin-bottom: 4px; }
  .cell .val { font-size: 13px; font-weight: 500; color: ${C.ink}; }
  .cell .val.ar { direction: rtl; font-family: "Tajawal", "Cairo", "Noto Sans Arabic", sans-serif; }
  .field-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 18px;
    padding: 10px 0;
    border-bottom: 1px dashed ${C.line2};
  }
  .field-row:last-child { border-bottom: 0; }
  .field-row .lbl { font-size: 12px; color: ${C.muted}; flex: 0 0 38%; }
  .field-row .val { font-size: 13px; font-weight: 500; color: ${C.ink}; text-align: right; flex: 1; }
  .table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid ${C.line2};
    background: #ffffff;
  }
  .table th {
    background: ${C.primaryLight};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${C.primaryDeep};
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid ${C.line2};
  }
  .table td {
    font-size: 12px;
    color: ${C.ink};
    padding: 10px 12px;
    border-bottom: 1px solid ${C.line};
  }
  .table tr:last-child td { border-bottom: 0; }
  .num { font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
  .empty {
    padding: 14px 16px;
    background: ${C.warnBg};
    border: 1px dashed ${C.warnLine};
    border-radius: 12px;
    color: ${C.warnInk};
    font-size: 12px;
  }
  .signature {
    margin-top: 30px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .sig-block { font-size: 12px; color: ${C.muted}; }
  .sig-line { border-top: 1px solid ${C.line2}; margin-top: 36px; padding-top: 6px; font-weight: 600; color: ${C.ink}; }
  .footer {
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid ${C.line};
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: ${C.muted};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .footer .seal {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${C.primary};
    font-weight: 700;
  }
  .footer .seal::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${C.primary};
  }
  .stamp {
    margin-top: 26px;
    background: linear-gradient(135deg, ${C.primaryDeep} 0%, ${C.primary} 100%);
    color: #ffffff;
    border-radius: 14px;
    padding: 18px 22px;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    box-shadow: 0 6px 20px rgba(91, 43, 181, 0.22);
  }
  .stamp .col { display: flex; flex-direction: column; gap: 4px; }
  .stamp .lbl { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.accent}; }
  .stamp .val { font-size: 14px; font-weight: 700; }
  .stamp .small { font-size: 11px; color: rgba(255,255,255,0.75); }
  .pack-cover { padding: 26mm 22mm 28mm 22mm; }
  .pack-cover .title { font-size: 36px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.1; color: ${C.ink}; }
  .pack-cover .lede { font-size: 14px; color: ${C.muted}; margin-top: 14px; max-width: 540px; line-height: 1.6; }
  .doc-list { margin-top: 26px; display: flex; flex-direction: column; gap: 10px; }
  .doc-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border: 1px solid ${C.line2};
    border-radius: 12px;
    background: #ffffff;
  }
  .doc-item .left { display: flex; flex-direction: column; gap: 2px; }
  .doc-item .name { font-size: 13px; font-weight: 700; color: ${C.ink}; }
  .doc-item .kind { font-size: 11px; color: ${C.muted}; letter-spacing: 0.04em; }
  .doc-item .meta { font-size: 11px; color: ${C.primaryDeep}; font-weight: 600; }
  .doc-num {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: ${C.primaryLight};
    color: ${C.primaryDeep};
    font-weight: 800;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }
  .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 22px; }
  .kpi {
    background: linear-gradient(180deg, #ffffff 0%, ${C.primaryLight} 200%);
    border: 1px solid ${C.line2};
    border-radius: 12px;
    padding: 14px 16px;
  }
  .kpi .lbl { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: ${C.primary}; margin-bottom: 6px; }
  .kpi .val { font-size: 18px; font-weight: 800; color: ${C.ink}; letter-spacing: -0.01em; }
  .flags {
    margin-top: 22px;
    background: ${C.warnBg};
    border: 1px solid ${C.warnLine};
    border-radius: 12px;
    padding: 16px 18px;
  }
  .flags h3 { margin: 0 0 8px 0; font-size: 11px; color: ${C.warnInk}; letter-spacing: 0.08em; text-transform: uppercase; }
  .flags ul { margin: 0; padding-left: 18px; color: ${C.warnInk}; font-size: 12px; line-height: 1.6; }
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-22deg);
    font-size: 110px;
    font-weight: 800;
    color: ${C.primary};
    opacity: 0.04;
    letter-spacing: 0.18em;
    pointer-events: none;
  }
  .form-tag {
    display: inline-block;
    margin-top: 6px;
    background: ${C.primaryLight};
    color: ${C.primaryDeep};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .totals {
    margin-top: 14px;
    border: 1px solid ${C.line2};
    border-radius: 12px;
    overflow: hidden;
  }
  .totals .row {
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 12px;
    border-bottom: 1px solid ${C.line};
  }
  .totals .row:last-child { border-bottom: 0; }
  .totals .row.total {
    background: ${C.primaryLight};
    color: ${C.primaryDeep};
    font-weight: 800;
  }
  .narrative {
    background: #faf7ff;
    border-left: 3px solid ${C.primary};
    padding: 14px 18px;
    border-radius: 4px;
    color: ${C.text};
    font-size: 12.5px;
    line-height: 1.7;
  }
`

type RibbonOpts = {
  brand: string
  title: string
  sub: string
  formTag?: string
  pill?: { text: string; tone?: "amber" | "emerald" | "default" | "outline" }
  logo?: "qfc" | { label: string; sub: string }
}

function ribbon(args: RibbonOpts): string {
  const tone =
    args.pill?.tone === "amber"
      ? "amber"
      : args.pill?.tone === "emerald"
        ? "emerald"
        : args.pill?.tone === "outline"
          ? "outline"
          : ""
  const logo =
    args.logo === "qfc"
      ? qfcLogoSvg()
      : args.logo
        ? authorityBadge(args.logo.label, args.logo.sub)
        : qfcLogoSvg()
  return `
    <div class="ribbon">
      <div class="ribbon-left">
        ${logo}
        <div>
          <div class="brand">${escapeHtml(args.brand)}</div>
          <div class="h1">${escapeHtml(args.title)}</div>
          <div class="sub">${escapeHtml(args.sub)}</div>
          ${args.formTag ? `<div class="form-tag">${escapeHtml(args.formTag)}</div>` : ""}
        </div>
      </div>
      ${args.pill ? `<div class="pill ${tone}">${escapeHtml(args.pill.text)}</div>` : ""}
    </div>`
}

function membersTable(members: FilingPack["q15"]["members"]): string {
  if (members.length === 0) {
    return `<div class="empty">No members captured. Add shareholders in Settings → Cap Table to populate Field 7.</div>`
  }
  return `<table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Nationality</th>
        <th>Date of birth</th>
        <th class="num">Ownership</th>
      </tr>
    </thead>
    <tbody>
      ${members
        .map(
          (m) => `<tr>
        <td>${escapeHtml(m.name)}</td>
        <td>${escapeHtml(m.nationality ?? "—")}</td>
        <td>${escapeHtml(m.dateOfBirth ?? "—")}</td>
        <td class="num">${m.ownership.toFixed(2)}%</td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>`
}

function uboTable(owners: FilingPack["ubo"]["beneficialOwners"]): string {
  if (owners.length === 0) {
    return `<div class="empty">No beneficial owners (≥25%) detected. Disclose any individuals who control the firm by other means manually before filing.</div>`
  }
  return `<table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Nationality</th>
        <th>DOB</th>
        <th class="num">Ownership</th>
        <th>Source of control</th>
      </tr>
    </thead>
    <tbody>
      ${owners
        .map(
          (o) => `<tr>
        <td>${escapeHtml(o.name)}</td>
        <td>${escapeHtml(o.nationality ?? "—")}</td>
        <td>${escapeHtml(o.dateOfBirth ?? "—")}</td>
        <td class="num">${o.ownership.toFixed(2)}%</td>
        <td>${escapeHtml(o.sourceOfControl ?? "Direct shareholding")}</td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>`
}

function activityList(items: string[]): string {
  if (items.length === 0)
    return `<div class="empty">List principal business activities in Settings → Profile.</div>`
  return `<table class="table">
    <thead><tr><th style="width:48px;">#</th><th>Activity</th></tr></thead>
    <tbody>
      ${items
        .map(
          (a, i) => `<tr><td class="num">${i + 1}</td><td>${escapeHtml(a)}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>`
}

function flagsBlock(flags: FilingPack["flags"]): string {
  if (flags.length === 0) return ""
  return `<div class="flags">
    <h3>Items needing your verification before filing</h3>
    <ul>
      ${flags.map((f) => `<li>${escapeHtml(f.message)}</li>`).join("")}
    </ul>
  </div>`
}

function watermark(text: string): string {
  return `<div class="watermark">${escapeHtml(text)}</div>`
}

// ============================================================================
// 1 · Cover
// ============================================================================
function coverPage(pack: FilingPack): string {
  const kpis = [
    pack.highlights.revenueValue
      ? { lbl: pack.highlights.revenueLabel ?? "Revenue", val: pack.highlights.revenueValue }
      : null,
    pack.highlights.headcountValue
      ? { lbl: pack.highlights.headcountLabel ?? "Team", val: pack.highlights.headcountValue }
      : null,
    pack.highlights.runwayValue
      ? { lbl: pack.highlights.runwayLabel ?? "Runway", val: pack.highlights.runwayValue }
      : null,
  ].filter((k): k is { lbl: string; val: string } => Boolean(k))

  return `<div class="page pack-cover">
    ${ribbon({
      brand: "Qatar Compliance Pack",
      title: pack.meta.legalNameEn,
      sub: `${pack.meta.qfcRegistrationNumber} · ${pack.meta.periodLabel || pack.meta.arPeriodEnd}`,
      pill: { text: pack.meta.taxRegime ?? "QFC", tone: "default" },
      logo: "qfc",
    })}
    <div class="title">Pre-filled regulatory pack ready for submission.</div>
    <p class="lede">
      This pack assembles your QFC Annual Return (Form Q15), Annual UBO
      Report, MoCI commercial license renewal data sheet, GTA corporate tax
      return, QDB grant report, and Invest Qatar incentives compliance —
      pulled from your latest KPI submission, settings profile and cap table.
    </p>

    ${kpis.length > 0 ? `<div class="kpi-row">
      ${kpis
        .map(
          (k) => `<div class="kpi"><div class="lbl">${escapeHtml(k.lbl)}</div><div class="val">${escapeHtml(k.val)}</div></div>`
        )
        .join("")}
    </div>` : ""}

    <div class="doc-list">
      ${docItem("01", "Form Q15 — Annual Return", "Qatar Financial Centre · CRO", "28 days after AR period · USD 200")}
      ${docItem("02", "Annual UBO Report", "Qatar Financial Centre · AML disclosure", "Within 30 days of CRO request · No fee")}
      ${docItem("03", "MoCI Commercial License Renewal", "Ministry of Commerce and Industry · Single Window", "Annual · before CR expiry")}
      ${docItem("04", "Corporate Tax Return", "General Tax Authority · Dhareeba portal", "Within 4 months of FY end · 10%")}
      ${docItem("05", "QDB Grant Report", "Qatar Development Bank", "Per programme cadence (typically quarterly)")}
      ${docItem("06", "Invest Qatar Incentives Compliance", "Invest Qatar · National Incentives Programme", "Periodic per agreement")}
    </div>

    ${flagsBlock(pack.flags)}

    <div class="footer">
      <span class="seal">Generated for ${escapeHtml(pack.meta.startupName)}</span>
      <span>${escapeHtml(pack.meta.submissionDate)}</span>
    </div>
  </div>`
}

function docItem(num: string, name: string, kind: string, meta: string): string {
  return `<div class="doc-item">
    <div style="display:flex;align-items:center;">
      <span class="doc-num">${escapeHtml(num)}</span>
      <span class="left">
        <span class="name">${escapeHtml(name)}</span>
        <span class="kind">${escapeHtml(kind)}</span>
      </span>
    </div>
    <span class="meta">${escapeHtml(meta)}</span>
  </div>`
}

// ============================================================================
// 2 · Form Q15
// ============================================================================
function q15Page(pack: FilingPack): string {
  const q = pack.q15
  return `<div class="page">
    ${watermark("QFC · DRAFT")}
    ${ribbon({
      brand: "Qatar Financial Centre · CRO",
      title: "QFC Annual Return",
      sub: "Submitted to the Companies Registration Office",
      formTag: "Form Q15",
      pill: { text: "DRAFT", tone: "amber" },
      logo: "qfc",
    })}

    <div class="section">
      <h2>1 · Firm identification</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Firm name (English)</div><div class="val">${escapeHtml(q.firmName)}</div></div>
        <div class="cell"><div class="lbl">QFC registration #</div><div class="val">${escapeHtml(q.qfcRegistrationNumber)}</div></div>
        <div class="cell"><div class="lbl">AR period start</div><div class="val">${escapeHtml(q.arPeriodStart)}</div></div>
        <div class="cell"><div class="lbl">AR period end</div><div class="val">${escapeHtml(q.arPeriodEnd)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>4 · Registered office address</h2>
      <div class="field-row"><div class="lbl">Office, floor, building, street, area</div><div class="val">${escapeHtml(q.registeredOffice)}</div></div>
    </div>

    <div class="section">
      <h2>5 · Principal business activities</h2>
      ${activityList(q.businessActivities)}
    </div>

    <div class="section">
      <h2>6 · Auditor details</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Auditor firm</div><div class="val">${escapeHtml(q.auditor.name || "—")}</div></div>
        <div class="cell"><div class="lbl">Registration #</div><div class="val">${escapeHtml(q.auditor.registration ?? "—")}</div></div>
        <div class="cell"><div class="lbl">Contact</div><div class="val">${escapeHtml(q.auditor.contact || "—")}</div></div>
        <div class="cell"><div class="lbl">Confirmed for AR period</div><div class="val">Yes</div></div>
      </div>
    </div>

    <div class="section">
      <h2>7 · Members / Designated members</h2>
      ${membersTable(q.members)}
    </div>

    <div class="section">
      <h2>8 · Authorized signatory</h2>
      <div class="signature">
        <div class="sig-block">
          <div class="lbl" style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">Member / Designated member</div>
          <div class="sig-line">${escapeHtml(q.authorizedSignatory.name)}</div>
          <div>${escapeHtml(q.authorizedSignatory.role)}</div>
        </div>
        <div class="sig-block">
          <div class="lbl" style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">Date of submission</div>
          <div class="sig-line">${escapeHtml(q.submissionDate)}</div>
          <div>Filed via QFC Client Portal</div>
        </div>
      </div>
    </div>

    <div class="stamp">
      <div class="col">
        <div class="lbl">Filing fee</div>
        <div class="val">USD 200</div>
        <div class="small">USD 50 for LLC(G) and Foundations</div>
      </div>
      <div class="col" style="text-align:right;align-items:flex-end;">
        <div class="lbl">Time limit</div>
        <div class="val">28 days from AR period end</div>
        <div class="small">Late penalties per Schedule 1, QFC Regulations</div>
      </div>
    </div>

    <div class="footer">
      <span class="seal">Form Q15 · v.${escapeHtml(new Date().getFullYear().toString())}</span>
      <span>Generated ${escapeHtml(pack.meta.submissionDate)}</span>
    </div>
  </div>`
}

// ============================================================================
// 3 · UBO Report
// ============================================================================
function uboPage(pack: FilingPack): string {
  const u = pack.ubo
  return `<div class="page">
    ${watermark("QFC · UBO")}
    ${ribbon({
      brand: "Qatar Financial Centre",
      title: "Annual UBO Report",
      sub: "Beneficial Ownership Disclosure · AML / Transparency",
      formTag: "UBO · Annual",
      pill: { text: "DRAFT", tone: "amber" },
      logo: "qfc",
    })}

    <div class="section">
      <h2>1 · Firm</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Firm name</div><div class="val">${escapeHtml(u.firmName)}</div></div>
        <div class="cell"><div class="lbl">QFC registration #</div><div class="val">${escapeHtml(u.qfcRegistrationNumber)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>2 · Beneficial owners (≥25%)</h2>
      ${uboTable(u.beneficialOwners)}
    </div>

    <div class="section">
      <h2>3 · Nominee shareholders</h2>
      ${
        u.nomineeShareholders.length === 0
          ? `<div class="field-row"><div class="lbl">Nominee shareholders</div><div class="val">None declared</div></div>`
          : `<table class="table"><thead><tr><th>Name</th><th>Nominated for</th></tr></thead><tbody>${u.nomineeShareholders
              .map(
                (n) =>
                  `<tr><td>${escapeHtml(n.name)}</td><td>${escapeHtml(n.nominatedFor)}</td></tr>`
              )
              .join("")}</tbody></table>`
      }
    </div>

    <div class="section">
      <h2>4 · Nominee directors</h2>
      <div class="field-row"><div class="lbl">Nominee directors</div><div class="val">${u.nomineeDirectors.length === 0 ? "None declared" : `${u.nomineeDirectors.length} disclosed`}</div></div>
    </div>

    <div class="section">
      <h2>5 · Corporate directors</h2>
      <div class="field-row"><div class="lbl">Corporate directors</div><div class="val">${u.corporateDirectors.length === 0 ? "None declared" : `${u.corporateDirectors.length} disclosed`}</div></div>
    </div>

    <div class="section">
      <h2>6 · Declaration</h2>
      <p class="narrative" style="margin:0 0 12px 0;">
        I confirm that the information disclosed above is true and accurate to
        the best of my knowledge, and undertake to notify the Companies
        Registration Office of any change to ultimate beneficial ownership
        within the time limits prescribed by the QFC Regulations.
      </p>
      <div class="signature">
        <div class="sig-block">
          <div class="lbl" style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">Authorized signatory</div>
          <div class="sig-line">${escapeHtml(u.declarationName)}</div>
          <div>Founder / Designated Member</div>
        </div>
        <div class="sig-block">
          <div class="lbl" style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">Date</div>
          <div class="sig-line">${escapeHtml(u.declarationDate)}</div>
          <div>Filed via QFC Client Portal</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="seal">UBO Report · ${escapeHtml(new Date().getFullYear().toString())}</span>
      <span>Generated ${escapeHtml(pack.meta.submissionDate)}</span>
    </div>
  </div>`
}

// ============================================================================
// 4 · MoCI Commercial License Renewal
// ============================================================================
function mociPage(pack: FilingPack): string {
  const m = pack.moci
  return `<div class="page">
    ${watermark("MoCI")}
    ${ribbon({
      brand: "Ministry of Commerce and Industry",
      title: "Commercial License Renewal",
      sub: "Single Window · Commercial Companies Law No. 11 of 2015",
      formTag: "MoCI · Annual",
      pill: { text: "DATA SHEET", tone: "outline" },
      logo: { label: "MoCI", sub: "Ministry of Commerce" },
    })}

    <div class="section">
      <h2>1 · Commercial registration</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">CR number</div><div class="val">${escapeHtml(m.crNumber)}</div></div>
        <div class="cell"><div class="lbl">Legal form</div><div class="val">${escapeHtml(m.legalForm)}</div></div>
        <div class="cell"><div class="lbl">Trade name (English)</div><div class="val">${escapeHtml(m.tradeNameEn)}</div></div>
        <div class="cell"><div class="lbl">Trade name (Arabic)</div><div class="val ar">${escapeHtml(m.tradeNameAr ?? "—")}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>2 · Registered address</h2>
      <div class="field-row"><div class="lbl">Address per CR</div><div class="val">${escapeHtml(m.registeredAddress)}</div></div>
    </div>

    <div class="section">
      <h2>3 · Business activities (per CR)</h2>
      ${activityList(m.businessActivities)}
    </div>

    <div class="section">
      <h2>4 · Manager / Authorized signatory</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Manager</div><div class="val">${escapeHtml(m.manager)}</div></div>
        <div class="cell"><div class="lbl">Capital structure changes</div><div class="val">${escapeHtml(m.capital ?? "None this period")}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>5 · Shareholders</h2>
      ${membersTable(m.shareholders)}
    </div>

    <div class="stamp">
      <div class="col">
        <div class="lbl">Renewal due</div>
        <div class="val">${escapeHtml(m.renewalDueLabel)}</div>
        <div class="small">Reminder cadence: 60 / 30 / 7 days before CR expiry</div>
      </div>
      <div class="col" style="text-align:right;align-items:flex-end;">
        <div class="lbl">Submission channel</div>
        <div class="val">MoCI Single Window e-portal</div>
        <div class="small">Event-driven disclosures filed separately</div>
      </div>
    </div>

    <div class="footer">
      <span class="seal">MoCI Renewal Data Sheet</span>
      <span>Generated ${escapeHtml(pack.meta.submissionDate)}</span>
    </div>
  </div>`
}

// ============================================================================
// 5 · GTA Corporate Tax Return (Dhareeba)
// ============================================================================
function gtaPage(pack: FilingPack): string {
  const g = pack.gta
  return `<div class="page">
    ${watermark("GTA · DRAFT")}
    ${ribbon({
      brand: "General Tax Authority · Dhareeba",
      title: "Corporate Tax Return",
      sub: "QFC tax regime · 10% on locally-sourced profits",
      formTag: "Tax · Annual",
      pill: { text: "DRAFT", tone: "amber" },
      logo: { label: "GTA", sub: "General Tax Authority" },
    })}

    <div class="section">
      <h2>1 · Taxpayer identification</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Taxpayer name</div><div class="val">${escapeHtml(g.taxpayerName)}</div></div>
        <div class="cell"><div class="lbl">TIN</div><div class="val">${escapeHtml(g.tin)}</div></div>
        <div class="cell"><div class="lbl">QFC registration #</div><div class="val">${escapeHtml(g.qfcRegistrationNumber)}</div></div>
        <div class="cell"><div class="lbl">Tax period</div><div class="val">${escapeHtml(g.taxPeriodStart)} → ${escapeHtml(g.taxPeriodEnd)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>2 · Income statement summary</h2>
      <div class="totals">
        <div class="row"><span>Total revenue</span><span class="num">${escapeHtml(g.totalRevenue)}</span></div>
        <div class="row"><span>Total deductible expenses</span><span class="num">${escapeHtml(g.totalExpenses)}</span></div>
        <div class="row"><span>Taxable income</span><span class="num">${escapeHtml(g.taxableIncome)}</span></div>
        <div class="row"><span>Tax rate</span><span class="num">${escapeHtml(g.taxRate)}</span></div>
        <div class="row total"><span>Tax due</span><span class="num">${escapeHtml(g.taxDue)}</span></div>
      </div>
    </div>

    <div class="section">
      <h2>3 · Exemptions applied</h2>
      ${
        g.exemptionsApplied.length === 0
          ? `<div class="field-row"><div class="lbl">Exemptions</div><div class="val">None claimed this period</div></div>`
          : activityList(g.exemptionsApplied)
      }
    </div>

    <div class="section">
      <h2>4 · Supporting documents</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Audited financial statements</div><div class="val">${g.attachedAuditedAccounts ? "Attached (per Settings → Compliance)" : "Auditor not yet set"}</div></div>
        <div class="cell"><div class="lbl">Filing deadline</div><div class="val">${escapeHtml(g.filingDeadline)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>5 · Authorized signatory</h2>
      <div class="signature">
        <div class="sig-block">
          <div class="lbl" style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">Signatory</div>
          <div class="sig-line">${escapeHtml(g.authorizedSignatory)}</div>
          <div>Founder</div>
        </div>
        <div class="sig-block">
          <div class="lbl" style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">Submission</div>
          <div class="sig-line">${escapeHtml(pack.meta.submissionDate)}</div>
          <div>Dhareeba e-portal</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="seal">GTA · Dhareeba draft return</span>
      <span>Generated ${escapeHtml(pack.meta.submissionDate)}</span>
    </div>
  </div>`
}

// ============================================================================
// 6 · QDB Grant Report
// ============================================================================
function qdbPage(pack: FilingPack): string {
  const q = pack.qdb
  return `<div class="page">
    ${watermark("QDB")}
    ${ribbon({
      brand: "Qatar Development Bank",
      title: "Grant Compliance Report",
      sub: "Programme reporting · funds, jobs, milestones",
      formTag: "QDB · Periodic",
      pill: { text: "DRAFT", tone: "amber" },
      logo: { label: "QDB", sub: "Qatar Development Bank" },
    })}

    <div class="section">
      <h2>1 · Grant identification</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Grant reference</div><div class="val">${escapeHtml(q.grantReference)}</div></div>
        <div class="cell"><div class="lbl">Reporting period</div><div class="val">${escapeHtml(q.reportingPeriodStart)} → ${escapeHtml(q.reportingPeriodEnd)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>2 · Milestones</h2>
      <table class="table">
        <thead><tr><th>Planned milestone</th><th>Status</th></tr></thead>
        <tbody>
          ${q.milestones
            .map(
              (m) =>
                `<tr><td>${escapeHtml(m.planned)}</td><td>${escapeHtml(m.status)}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>3 · Financial utilization</h2>
      <div class="totals">
        <div class="row"><span>Funds utilized</span><span class="num">${escapeHtml(q.fundsUtilized)}</span></div>
        <div class="row"><span>Approved budget reference</span><span class="num">${escapeHtml(q.budget)}</span></div>
      </div>
    </div>

    <div class="section">
      <h2>4 · Impact metrics</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Jobs created (total)</div><div class="val">${q.jobsCreatedTotal}</div></div>
        <div class="cell"><div class="lbl">Jobs created (Qatari nationals)</div><div class="val">${q.jobsCreatedQatari}</div></div>
        <div class="cell"><div class="lbl">Local sourcing %</div><div class="val">${escapeHtml(q.localSourcingPct ?? "—")}</div></div>
        <div class="cell"><div class="lbl">Evidence</div><div class="val">${escapeHtml(q.evidenceSummary)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>5 · Forward-looking plan</h2>
      <div class="narrative">${escapeHtml(q.forwardPlan)}</div>
    </div>

    <div class="footer">
      <span class="seal">QDB · Periodic grant report</span>
      <span>Generated ${escapeHtml(pack.meta.submissionDate)}</span>
    </div>
  </div>`
}

// ============================================================================
// 7 · Invest Qatar / National Incentives
// ============================================================================
function investQatarPage(pack: FilingPack): string {
  const i = pack.investQatar
  return `<div class="page">
    ${watermark("INVEST QATAR")}
    ${ribbon({
      brand: "Invest Qatar",
      title: "Incentives Compliance Report",
      sub: "National Incentives Programme · investment milestones",
      formTag: "Invest Qatar · Periodic",
      pill: { text: i.status, tone: "outline" },
      logo: { label: "Invest Qatar", sub: "National Incentives" },
    })}

    <div class="section">
      <h2>1 · Programme</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Programme</div><div class="val">${escapeHtml(i.programmeName)}</div></div>
        <div class="cell"><div class="lbl">Incentive cap</div><div class="val">${escapeHtml(i.incentiveCap)}</div></div>
        <div class="cell"><div class="lbl">Reporting period</div><div class="val">${escapeHtml(i.reportingPeriodStart)} → ${escapeHtml(i.reportingPeriodEnd)}</div></div>
        <div class="cell"><div class="lbl">Status</div><div class="val">${escapeHtml(i.status)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>2 · Eligible local spend</h2>
      <div class="totals">
        <div class="row"><span>Eligible spend this period</span><span class="num">${escapeHtml(i.eligibleSpend)}</span></div>
        <div class="row"><span>Local spend %</span><span class="num">${escapeHtml(i.localSpendPct ?? "—")}</span></div>
      </div>
    </div>

    <div class="section">
      <h2>3 · Workforce impact</h2>
      <div class="grid">
        <div class="cell"><div class="lbl">Jobs created</div><div class="val">${i.jobsCreated}</div></div>
        <div class="cell"><div class="lbl">Investment milestones</div><div class="val">${escapeHtml(i.investmentMilestones)}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>4 · Declaration</h2>
      <div class="narrative">
        We confirm continued compliance with the agreed incentive terms,
        including job creation, eligible local spend and investment milestone
        commitments. Supporting evidence is available on request.
      </div>
    </div>

    <div class="footer">
      <span class="seal">Invest Qatar · Compliance</span>
      <span>Generated ${escapeHtml(pack.meta.submissionDate)}</span>
    </div>
  </div>`
}

export type FilingDoc =
  | "pack"
  | "q15"
  | "ubo"
  | "moci"
  | "gta"
  | "qdb"
  | "invest_qatar"

export const FILING_DOC_ORDER: FilingDoc[] = [
  "q15",
  "ubo",
  "moci",
  "gta",
  "qdb",
  "invest_qatar",
]

export function renderFilingHtml(pack: FilingPack, doc: FilingDoc): string {
  let body = ""
  if (doc === "pack") {
    body = `${coverPage(pack)}${q15Page(pack)}${uboPage(pack)}${mociPage(pack)}${gtaPage(pack)}${qdbPage(pack)}${investQatarPage(pack)}`
  } else if (doc === "q15") {
    body = q15Page(pack)
  } else if (doc === "ubo") {
    body = uboPage(pack)
  } else if (doc === "moci") {
    body = mociPage(pack)
  } else if (doc === "gta") {
    body = gtaPage(pack)
  } else if (doc === "qdb") {
    body = qdbPage(pack)
  } else {
    body = investQatarPage(pack)
  }

  const titleMap: Record<FilingDoc, string> = {
    pack: "Qatar Compliance Pack",
    q15: "Form Q15 — QFC Annual Return",
    ubo: "Annual UBO Report",
    moci: "MoCI Commercial License Renewal",
    gta: "GTA Corporate Tax Return",
    qdb: "QDB Grant Report",
    invest_qatar: "Invest Qatar Incentives Compliance",
  }

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(pack.meta.legalNameEn)} — ${escapeHtml(titleMap[doc])}</title>
<style>${baseStyles}</style>
</head>
<body>
${body}
</body>
</html>`
}
