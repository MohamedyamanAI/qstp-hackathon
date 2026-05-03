"use client"

import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Download01Icon,
  FileVerifiedIcon,
  MaximizeScreenIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useState, useTransition } from "react"
import { createPortal } from "react-dom"

import {
  generateGovernmentFilings,
  markFilingSubmitted,
  type GeneratedFilingPack,
} from "@/app/founder/submit/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Phase = "generating" | "ready" | "error"

type DocKind =
  | "pack"
  | "q15"
  | "ubo"
  | "moci"
  | "gta"
  | "qdb"
  | "invest_qatar"

type SubmittedMap = Partial<Record<DocKind, { at: string; reference: string | null }>>

const DOC_KINDS: DocKind[] = [
  "q15",
  "ubo",
  "moci",
  "gta",
  "qdb",
  "invest_qatar",
  "pack",
]

const FILABLE_DOCS: DocKind[] = ["q15", "ubo", "moci", "gta", "qdb", "invest_qatar"]

const DOC_LABELS: Record<
  DocKind,
  { tab: string; name: string; sub: string; file: string; authority: string }
> = {
  pack: {
    tab: "Full pack",
    name: "Qatar Compliance Pack",
    sub: "All 6 filings · cover sheet included",
    file: "Qatar-Compliance-Pack",
    authority: "All authorities",
  },
  q15: {
    tab: "Form Q15",
    name: "Form Q15 · Annual Return",
    sub: "28-day deadline · USD 200",
    file: "QFC-Form-Q15-Annual-Return",
    authority: "QFC · CRO",
  },
  ubo: {
    tab: "UBO Report",
    name: "Annual UBO Report",
    sub: "Beneficial ownership disclosure · No fee",
    file: "QFC-UBO-Report",
    authority: "QFC · CRO",
  },
  moci: {
    tab: "MoCI",
    name: "MoCI License Renewal",
    sub: "Commercial license data sheet · Single Window",
    file: "MoCI-License-Renewal",
    authority: "Ministry of Commerce & Industry",
  },
  gta: {
    tab: "GTA Tax",
    name: "GTA Corporate Tax Return",
    sub: "Dhareeba portal · 4 months after FY end",
    file: "GTA-Corporate-Tax-Return",
    authority: "General Tax Authority",
  },
  qdb: {
    tab: "QDB",
    name: "QDB Grant Report",
    sub: "Programme reporting · jobs, funds, milestones",
    file: "QDB-Grant-Report",
    authority: "Qatar Development Bank",
  },
  invest_qatar: {
    tab: "Invest Qatar",
    name: "Invest Qatar Incentives",
    sub: "National Incentives Programme compliance",
    file: "Invest-Qatar-Incentives",
    authority: "Invest Qatar",
  },
}

export function GovernmentFilingSheet({
  assignmentId,
  open,
  onOpenChange,
  initialSubmitted,
  onSubmittedChange,
}: {
  assignmentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSubmitted?: SubmittedMap
  onSubmittedChange?: (submitted: SubmittedMap) => void
}) {
  const [phase, setPhase] = useState<Phase>("generating")
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<GeneratedFilingPack | null>(null)
  const [activeDoc, setActiveDoc] = useState<DocKind>("q15")
  const [pdfUrls, setPdfUrls] = useState<Record<DocKind, string | null>>(
    () => emptyUrls()
  )
  const [submitted, setSubmitted] = useState<SubmittedMap>(
    initialSubmitted ?? {}
  )
  const [referenceInput, setReferenceInput] = useState("")
  const [marking, setMarking] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    /* eslint-disable react-hooks/set-state-in-effect */
    setPhase("generating")
    setError(null)
    startTransition(async () => {
      const result = await generateGovernmentFilings(assignmentId)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error)
        setPhase("error")
        return
      }
      setData(result.data)
      const urls: Record<DocKind, string | null> = emptyUrls()
      for (const k of DOC_KINDS) {
        const b64 = result.data.pdfBase64[k]
        if (b64) urls[k] = blobUrl(b64)
      }
      setPdfUrls(urls)
      setPhase("ready")
    })
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      cancelled = true
    }
  }, [open, assignmentId])

  function handleSheetOpenChange(next: boolean) {
    if (!next) {
      Object.values(pdfUrls).forEach((u) => {
        if (u) URL.revokeObjectURL(u)
      })
      setPdfUrls(emptyUrls())
      setData(null)
      setError(null)
      setActiveDoc("q15")
      setReferenceInput("")
      setMarking(false)
      setFullscreen(false)
      setPhase("generating")
    }
    onOpenChange(next)
  }

  function handleMarkSubmitted() {
    if (marking) return
    setMarking(true)
    startTransition(async () => {
      const result = await markFilingSubmitted({
        assignmentId,
        doc: activeDoc,
        reference: referenceInput.trim() || undefined,
      })
      setMarking(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const next: SubmittedMap = {
        ...submitted,
        [activeDoc]: {
          at: result.submittedAt,
          reference: referenceInput.trim() || null,
        },
      }
      setSubmitted(next)
      setReferenceInput("")
      onSubmittedChange?.(next)
    })
  }

  const activeUrl = pdfUrls[activeDoc]
  const activeLabels = DOC_LABELS[activeDoc]
  const activeSubmitted = submitted[activeDoc]

  return (
    <>
      <Drawer
        modal={!fullscreen}
        open={open}
        onOpenChange={handleSheetOpenChange}
      >
        <DrawerContent className="mx-auto h-[100dvh] max-h-[100dvh] w-full md:h-[90vh] md:max-h-[90vh] md:max-w-5xl">
          <DrawerHeader className="border-b border-border/60 px-6 py-4">
            <DrawerTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={FileVerifiedIcon} className="h-5 w-5" />
              Government filing pack
              {phase === "generating" ? (
                <Badge variant="secondary">Drafting…</Badge>
              ) : data ? (
                <Badge variant="outline">
                  {data.meta.qfcRegistrationNumber} · {data.meta.periodLabel || "Annual"}
                </Badge>
              ) : null}
            </DrawerTitle>
            <DrawerDescription>
              Six pre-filled filings — QFC Form Q15, UBO Report, MoCI license
              renewal, GTA tax return, QDB grant report, and Invest Qatar
              incentives. Drafted from your latest submission, settings, and
              cap table.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {phase === "generating" && !data ? (
              <FilingSkeleton />
            ) : phase === "error" && !data ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  onClick={() => handleSheetOpenChange(false)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            ) : data ? (
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="flex flex-col gap-5">
                  <FilingChecklist
                    flags={data.flags}
                    submitted={submitted}
                  />

                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Mark as submitted
                    </h3>
                    <div className="rounded-lg border border-border/60 bg-card p-3">
                      <p className="text-xs text-muted-foreground">
                        Once you&apos;ve filed{" "}
                        <strong>{activeLabels.name}</strong> with{" "}
                        {activeLabels.authority}, log it here so the deadline
                        drops off your compliance calendar.
                      </p>
                      <div className="mt-3 grid gap-2">
                        <Label htmlFor="filing-ref" className="text-xs">
                          Authority reference (optional)
                        </Label>
                        <Input
                          id="filing-ref"
                          placeholder="e.g. Q15-2026-00874"
                          value={referenceInput}
                          onChange={(e) => setReferenceInput(e.target.value)}
                          disabled={Boolean(activeSubmitted) || marking}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {activeSubmitted ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              className="h-3.5 w-3.5"
                            />
                            Submitted {formatRelative(activeSubmitted.at)}
                            {activeSubmitted.reference ? (
                              <span className="text-muted-foreground">
                                · {activeSubmitted.reference}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Logs the submission against this period.
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleMarkSubmitted}
                          disabled={marking || Boolean(activeSubmitted)}
                        >
                          {activeSubmitted
                            ? "Logged ✓"
                            : marking
                              ? "Saving…"
                              : "Mark submitted"}
                        </Button>
                      </div>
                    </div>
                  </section>

                  <FilingDetails data={data} />
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Tabs
                      value={activeDoc}
                      onValueChange={(v) => setActiveDoc(v as DocKind)}
                      className="flex-1 min-w-0"
                    >
                      <TabsList
                        variant="line"
                        className="h-auto w-full flex-wrap justify-start"
                      >
                        {DOC_KINDS.map((k) => (
                          <TabsTrigger key={k} value={k}>
                            {DOC_LABELS[k].tab}
                            {submitted[k] ? (
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                className="ml-1.5 h-3 w-3 text-emerald-600"
                              />
                            ) : null}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {DOC_KINDS.map((k) => (
                        <TabsContent key={k} value={k} />
                      ))}
                    </Tabs>
                    {activeUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="hidden h-7 gap-1.5 px-2 text-xs md:inline-flex"
                        onClick={() => setFullscreen(true)}
                      >
                        <HugeiconsIcon
                          icon={MaximizeScreenIcon}
                          className="h-3.5 w-3.5"
                        />
                        Fullscreen
                      </Button>
                    ) : null}
                  </div>

                  <div className="relative flex h-[68vh] flex-col items-stretch overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                    {activeUrl ? (
                      <iframe
                        src={activeUrl}
                        title={`${activeLabels.name} preview`}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Rendering preview…
                      </div>
                    )}
                  </div>

                  {activeUrl ? (
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">
                        {activeLabels.sub}
                      </span>
                      <a
                        href={activeUrl}
                        download={`${activeLabels.file}-${data.meta.legalNameEn.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`}
                        className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        <HugeiconsIcon
                          icon={Download01Icon}
                          className="h-3.5 w-3.5"
                        />
                        Download {activeLabels.name}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {error && data ? (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DrawerFooter className="border-t border-border/60 px-6 py-3">
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {data
                  ? `${data.flags.length} item${data.flags.length === 1 ? "" : "s"} need verification before filing`
                  : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSheetOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {fullscreen && activeUrl && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[200] flex flex-col bg-background"
              style={{ pointerEvents: "auto" }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon
                    icon={FileVerifiedIcon}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">
                    {data?.meta.legalNameEn ?? "Filing"}
                  </span>
                  <span className="text-muted-foreground">
                    · {activeLabels.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setFullscreen(false)}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                  Close
                </Button>
              </div>
              <iframe
                src={activeUrl}
                title={`${activeLabels.name} (fullscreen)`}
                className="h-full w-full flex-1"
              />
            </div>,
            document.body
          )
        : null}
    </>
  )
}

function FilingChecklist({
  flags,
  submitted,
}: {
  flags: GeneratedFilingPack["flags"]
  submitted: SubmittedMap
}) {
  const submittedCount = FILABLE_DOCS.filter((k) => submitted[k]).length
  const allSubmitted = submittedCount === FILABLE_DOCS.length
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Pack readiness
      </h3>
      <div className="rounded-lg border border-border/60 bg-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">
              {allSubmitted
                ? "All forms submitted"
                : flags.length === 0
                  ? `Ready to file · ${submittedCount}/${FILABLE_DOCS.length} done`
                  : "Verification needed"}
            </div>
            <p className="text-xs text-muted-foreground">
              {allSubmitted
                ? "Compliance calendar updated."
                : flags.length === 0
                  ? "All required fields are populated from your profile and cap table."
                  : `${flags.length} field${flags.length === 1 ? "" : "s"} pulled from your settings need attention.`}
            </p>
          </div>
          <Badge
            className={
              allSubmitted
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : flags.length === 0
                  ? "bg-violet-100 text-violet-700 hover:bg-violet-100"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
            }
          >
            {allSubmitted ? "Done" : flags.length === 0 ? "Ready" : "Review"}
          </Badge>
        </div>
        {flags.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1.5 border-t border-border/60 pt-3">
            {flags.map((f) => (
              <li
                key={f.field}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={Alert02Icon}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600"
                />
                <span>{f.message}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function FilingDetails({ data }: { data: GeneratedFilingPack }) {
  const m = data.pack.meta
  const memberCount = data.pack.q15.members.length
  const uboCount = data.pack.ubo.beneficialOwners.length
  const activities = data.pack.q15.businessActivities.length
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">Pack contents</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-card p-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Legal name</dt>
          <dd className="font-medium">{m.legalNameEn}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">QFC #</dt>
          <dd className="font-medium tabular-nums">
            {m.qfcRegistrationNumber}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">AR period</dt>
          <dd className="font-medium">
            {m.arPeriodStart} → {m.arPeriodEnd}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tax regime</dt>
          <dd className="font-medium">{m.taxRegime ?? "QFC"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Members</dt>
          <dd className="font-medium tabular-nums">{memberCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Beneficial owners</dt>
          <dd className="font-medium tabular-nums">{uboCount}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Business activities</dt>
          <dd className="font-medium">
            {activities > 0
              ? data.pack.q15.businessActivities.join(" · ")
              : "—"}
          </dd>
        </div>
      </dl>
    </section>
  )
}

function FilingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-9 animate-pulse rounded bg-muted" />
        <div className="h-[68vh] animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}

function emptyUrls(): Record<DocKind, string | null> {
  return {
    pack: null,
    q15: null,
    ubo: null,
    moci: null,
    gta: null,
    qdb: null,
    invest_qatar: null,
  }
}

function blobUrl(b64: string): string {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" })
  return URL.createObjectURL(blob)
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  return d.toLocaleDateString()
}

