import type { ReportAnswers, ReportQuestion } from "@/lib/reports/schema"

export type Shareholder = {
  name?: string
  ownership_percentage?: number
  nationality?: string | null
  source_of_control?: string | null
  date_of_birth?: string | null
}

export type ExtendedProfile = {
  legal_name_en?: string
  legal_name_ar?: string
  cr_number?: string
  qfc_registration_number?: string
  incorporation_date?: string
  registered_address?: string
  business_activities?: string | string[]
  tax_regime?: string
  auditor_name?: string
  auditor_contact?: string
  auditor_registration?: string
  active_grants?: string
  financial_year_end?: string
  cap_table?: Shareholder[]
}

export type Member = {
  name: string
  ownership: number
  nationality?: string
  dateOfBirth?: string
  occupation?: string
}

export type BeneficialOwner = {
  name: string
  nationality?: string
  ownership: number
  sourceOfControl?: string
  dateOfBirth?: string
}

export type FilingFlag = {
  field: string
  message: string
}

export type MoCISection = {
  crNumber: string
  tradeNameEn: string
  tradeNameAr?: string
  legalForm: string
  registeredAddress: string
  businessActivities: string[]
  manager: string
  capital?: string
  shareholders: Member[]
  renewalDueLabel: string
}

export type GTASection = {
  taxpayerName: string
  tin: string
  qfcRegistrationNumber: string
  taxPeriodStart: string
  taxPeriodEnd: string
  totalRevenue: string
  totalExpenses: string
  taxableIncome: string
  taxRate: string
  taxDue: string
  exemptionsApplied: string[]
  attachedAuditedAccounts: boolean
  authorizedSignatory: string
  filingDeadline: string
}

export type QDBSection = {
  grantReference: string
  reportingPeriodStart: string
  reportingPeriodEnd: string
  milestones: Array<{ planned: string; status: string }>
  fundsUtilized: string
  budget: string
  jobsCreatedTotal: number
  jobsCreatedQatari: number
  localSourcingPct?: string
  forwardPlan: string
  evidenceSummary: string
}

export type InvestQatarSection = {
  programmeName: string
  incentiveCap: string
  reportingPeriodStart: string
  reportingPeriodEnd: string
  eligibleSpend: string
  jobsCreated: number
  investmentMilestones: string
  localSpendPct?: string
  status: string
}

export type FilingPack = {
  meta: {
    startupName: string
    legalNameEn: string
    legalNameAr?: string
    qfcRegistrationNumber: string
    crNumber?: string
    taxRegime?: string
    incorporationDate?: string
    financialYearEnd?: string
    periodLabel: string
    arPeriodStart: string
    arPeriodEnd: string
    submissionDate: string
    generatedAt: string
  }
  q15: {
    firmName: string
    qfcRegistrationNumber: string
    arPeriodStart: string
    arPeriodEnd: string
    registeredOffice: string
    businessActivities: string[]
    auditor: { name: string; contact: string; registration?: string }
    members: Member[]
    authorizedSignatory: { name: string; role: string }
    submissionDate: string
  }
  ubo: {
    firmName: string
    qfcRegistrationNumber: string
    beneficialOwners: BeneficialOwner[]
    nomineeShareholders: Array<{ name: string; nominatedFor: string }>
    nomineeDirectors: Array<{ name: string; details: string }>
    corporateDirectors: Array<{ name: string; jurisdiction: string }>
    declarationName: string
    declarationDate: string
  }
  moci: MoCISection
  gta: GTASection
  qdb: QDBSection
  investQatar: InvestQatarSection
  flags: FilingFlag[]
  highlights: {
    revenueLabel?: string
    revenueValue?: string
    headcountLabel?: string
    headcountValue?: string
    runwayLabel?: string
    runwayValue?: string
  }
}

export type BuildFilingInput = {
  startupName: string
  founderName: string
  founderRole?: string
  extendedProfile: ExtendedProfile
  periodStart: string
  periodEnd: string
  questions: ReportQuestion[]
  answers: ReportAnswers
}

const longDate = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

const todayLong = (): string =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

function periodLabel(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return ""
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return fmt(s)
  return `${fmt(s)} – ${fmt(e)}`
}

function splitActivities(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => v.trim())
  return value
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function findAnswer(
  questions: ReportQuestion[],
  answers: ReportAnswers,
  needles: string[]
): { question?: ReportQuestion; value?: string | number | boolean | null } {
  const lc = needles.map((n) => n.toLowerCase())
  for (const q of questions) {
    const id = q.id.toLowerCase()
    const label = q.label.toLowerCase()
    if (lc.some((n) => id.includes(n) || label.includes(n))) {
      return { question: q, value: answers[q.id] }
    }
  }
  return {}
}

function fmtMoney(v: unknown): string | undefined {
  const n = Number(v)
  if (!Number.isFinite(n)) return undefined
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

function fmtNumber(v: unknown): string | undefined {
  const n = Number(v)
  if (!Number.isFinite(n)) return undefined
  return n.toLocaleString("en-US")
}

function moneyOr(v: unknown, dash = "—"): string {
  return fmtMoney(v) ?? dash
}

function numberOr(v: unknown, dash = "—"): string {
  return fmtNumber(v) ?? dash
}

function asInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n) : 0
}

export function buildFilingPack(input: BuildFilingInput): FilingPack {
  const ext = input.extendedProfile ?? {}
  const flags: FilingFlag[] = []

  const legalNameEn = (ext.legal_name_en ?? input.startupName).trim()
  const qfcReg = (ext.qfc_registration_number ?? ext.cr_number ?? "").trim()
  const crNumber = (ext.cr_number ?? "").trim()
  if (!qfcReg) {
    flags.push({
      field: "qfcRegistrationNumber",
      message: "Add your QFC / CR number in Settings → Profile.",
    })
  }
  if (!ext.legal_name_en) {
    flags.push({
      field: "legalNameEn",
      message:
        "Add the full English legal name in Settings → Profile (currently using display name).",
    })
  }

  const arPeriodStart = longDate(input.periodStart)
  const arPeriodEnd = longDate(input.periodEnd)

  const registeredOffice = (ext.registered_address ?? "").trim()
  if (!registeredOffice) {
    flags.push({
      field: "registeredOffice",
      message: "Set the registered office address in Settings → Profile.",
    })
  }

  const businessActivities = splitActivities(ext.business_activities)
  if (businessActivities.length === 0) {
    flags.push({
      field: "businessActivities",
      message: "List principal business activities in Settings → Profile.",
    })
  }

  const auditor = {
    name: (ext.auditor_name ?? "").trim(),
    contact: (ext.auditor_contact ?? "").trim(),
    registration: ext.auditor_registration?.trim(),
  }
  if (!auditor.name) {
    flags.push({
      field: "auditor",
      message: "Add auditor details in Settings → Compliance.",
    })
  }

  const cap: Shareholder[] = Array.isArray(ext.cap_table) ? ext.cap_table : []
  const members: Member[] = cap
    .filter((sh) => sh && sh.name)
    .map((sh) => ({
      name: sh.name!.trim(),
      ownership: Number(sh.ownership_percentage) || 0,
      nationality: sh.nationality?.trim() || undefined,
      dateOfBirth: sh.date_of_birth?.trim() || undefined,
      occupation: undefined,
    }))

  if (members.length === 0) {
    flags.push({
      field: "members",
      message: "Add shareholders in Settings → Cap Table for member details.",
    })
  }

  const authorizedSignatory = {
    name: input.founderName,
    role: input.founderRole ?? "Founder / Designated Member",
  }

  const beneficialOwners: BeneficialOwner[] = cap
    .filter((sh) => sh && sh.name && Number(sh.ownership_percentage) >= 25)
    .map((sh) => ({
      name: sh.name!.trim(),
      nationality: sh.nationality?.trim() || undefined,
      ownership: Number(sh.ownership_percentage) || 0,
      sourceOfControl:
        sh.source_of_control?.trim() ||
        (Number(sh.ownership_percentage) >= 25 ? "Direct shareholding" : undefined),
      dateOfBirth: sh.date_of_birth?.trim() || undefined,
    }))

  if (beneficialOwners.length === 0 && members.length > 0) {
    flags.push({
      field: "beneficialOwners",
      message:
        "No shareholder holds ≥25%. UBO Report will require manual disclosure of controllers.",
    })
  }

  const taxRegime = ext.tax_regime?.trim() || "QFC"
  const isQfc = taxRegime.toLowerCase() === "qfc"

  // KPI lookups (used by GTA / QDB / Invest Qatar / cover)
  const revenue = findAnswer(input.questions, input.answers, [
    "revenue",
    "mrr",
    "arr",
  ])
  const expenses = findAnswer(input.questions, input.answers, [
    "burn",
    "expenses",
    "opex",
    "cost",
  ])
  const headcount = findAnswer(input.questions, input.answers, [
    "headcount",
    "team_size",
    "team size",
    "employees",
  ])
  const qatariHires = findAnswer(input.questions, input.answers, [
    "qatari",
    "national_hires",
    "nationals",
  ])
  const localSpend = findAnswer(input.questions, input.answers, [
    "local_sourcing",
    "local sourcing",
    "local_spend",
    "local spend",
  ])
  const runway = findAnswer(input.questions, input.answers, ["runway"])
  const wins = findAnswer(input.questions, input.answers, ["wins", "milestones"])

  const period = periodLabel(input.periodStart, input.periodEnd)

  // Tax math (10% on profit, capped at 0)
  const revenueNum = Number(revenue.value)
  const expensesNum = Number(expenses.value)
  const profit =
    Number.isFinite(revenueNum) && Number.isFinite(expensesNum)
      ? Math.max(0, revenueNum - expensesNum)
      : NaN
  const taxDueNum = Number.isFinite(profit) ? profit * 0.1 : NaN

  const moci: MoCISection = {
    crNumber: crNumber || qfcReg || "—",
    tradeNameEn: legalNameEn,
    tradeNameAr: ext.legal_name_ar?.trim() || undefined,
    legalForm: "LLC",
    registeredAddress: registeredOffice || "—",
    businessActivities,
    manager: input.founderName,
    capital: undefined,
    shareholders: members,
    renewalDueLabel: ext.financial_year_end
      ? longDate(ext.financial_year_end)
      : "—",
  }

  if (!isQfc && !crNumber) {
    flags.push({
      field: "crNumber",
      message: "Mainland firms need a CR number for the MoCI renewal.",
    })
  }

  const gta: GTASection = {
    taxpayerName: legalNameEn,
    tin: crNumber || qfcReg || "—",
    qfcRegistrationNumber: qfcReg || "—",
    taxPeriodStart: arPeriodStart,
    taxPeriodEnd: arPeriodEnd,
    totalRevenue: moneyOr(revenue.value),
    totalExpenses: moneyOr(expenses.value),
    taxableIncome: Number.isFinite(profit) ? moneyOr(profit) : "—",
    taxRate: "10%",
    taxDue: Number.isFinite(taxDueNum) ? moneyOr(taxDueNum) : "—",
    exemptionsApplied: [],
    attachedAuditedAccounts: Boolean(auditor.name),
    authorizedSignatory: input.founderName,
    filingDeadline: ext.financial_year_end
      ? longDate(addMonths(ext.financial_year_end, 4))
      : "Within 4 months of FY end",
  }

  const qdb: QDBSection = {
    grantReference:
      pickFirstActiveGrant(ext.active_grants, ["qdb"]) ?? "QDB-PENDING",
    reportingPeriodStart: arPeriodStart,
    reportingPeriodEnd: arPeriodEnd,
    milestones: extractMilestones(wins.value),
    fundsUtilized: moneyOr(expenses.value),
    budget: moneyOr(revenue.value),
    jobsCreatedTotal: asInt(headcount.value),
    jobsCreatedQatari: asInt(qatariHires.value),
    localSourcingPct: localSpend.value
      ? `${numberOr(localSpend.value)}%`
      : undefined,
    forwardPlan:
      "Continue executing the milestones above; next quarter focus on revenue retention and Qatari national hiring.",
    evidenceSummary:
      "Audited financials, payroll register, and customer contracts available on request.",
  }

  const investQatar: InvestQatarSection = {
    programmeName: "National Incentives Programme",
    incentiveCap: "Up to 40% of eligible local expenses",
    reportingPeriodStart: arPeriodStart,
    reportingPeriodEnd: arPeriodEnd,
    eligibleSpend: moneyOr(expenses.value),
    jobsCreated: asInt(headcount.value),
    investmentMilestones:
      typeof wins.value === "string" && wins.value
        ? wins.value
        : "Operational ramp-up, hiring against plan, customer acquisition.",
    localSpendPct: localSpend.value
      ? `${numberOr(localSpend.value)}%`
      : undefined,
    status: "On track",
  }

  return {
    meta: {
      startupName: input.startupName,
      legalNameEn,
      legalNameAr: ext.legal_name_ar?.trim() || undefined,
      qfcRegistrationNumber: qfcReg || "—",
      crNumber: crNumber || undefined,
      taxRegime,
      incorporationDate: ext.incorporation_date
        ? longDate(ext.incorporation_date)
        : undefined,
      financialYearEnd: ext.financial_year_end
        ? longDate(ext.financial_year_end)
        : undefined,
      periodLabel: period,
      arPeriodStart,
      arPeriodEnd,
      submissionDate: todayLong(),
      generatedAt: new Date().toISOString(),
    },
    q15: {
      firmName: legalNameEn,
      qfcRegistrationNumber: qfcReg || "—",
      arPeriodStart,
      arPeriodEnd,
      registeredOffice: registeredOffice || "—",
      businessActivities,
      auditor,
      members,
      authorizedSignatory,
      submissionDate: todayLong(),
    },
    ubo: {
      firmName: legalNameEn,
      qfcRegistrationNumber: qfcReg || "—",
      beneficialOwners,
      nomineeShareholders: [],
      nomineeDirectors: [],
      corporateDirectors: [],
      declarationName: input.founderName,
      declarationDate: todayLong(),
    },
    moci,
    gta,
    qdb,
    investQatar,
    flags,
    highlights: {
      revenueLabel: revenue.question?.label,
      revenueValue:
        revenue.question?.type === "currency"
          ? fmtMoney(revenue.value)
          : fmtNumber(revenue.value),
      headcountLabel: headcount.question?.label ?? "Team size",
      headcountValue: fmtNumber(headcount.value),
      runwayLabel: runway.question?.label,
      runwayValue:
        runway.question?.type === "number"
          ? `${fmtNumber(runway.value) ?? "—"} mo`
          : fmtNumber(runway.value),
    },
  }
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function pickFirstActiveGrant(
  active: string | undefined,
  needles: string[]
): string | null {
  if (!active) return null
  const parts = active
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const lc = needles.map((n) => n.toLowerCase())
  return (
    parts.find((p) => lc.some((n) => p.toLowerCase().includes(n))) ?? null
  )
}

function extractMilestones(value: unknown): Array<{ planned: string; status: string }> {
  if (typeof value !== "string" || !value.trim()) {
    return [
      {
        planned: "Hit committed monthly revenue target",
        status: "Captured in latest submission",
      },
      {
        planned: "Maintain hiring pace",
        status: "Captured in latest submission",
      },
    ]
  }
  return value
    .split(/[\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((line) => ({ planned: line, status: "Achieved" }))
}

export function parseExtendedProfile(value: unknown): ExtendedProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as ExtendedProfile
}
