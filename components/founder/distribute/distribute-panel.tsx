"use client"

import {
  AlertCircleIcon,
  ArrowUpRight01Icon,
  Building01Icon,
  CheckmarkCircle02Icon,
  FileVerifiedIcon,
  Linkedin01Icon,
  Mail01Icon,
  PresentationBarChart01Icon,
  SlackIcon,
  WhatsappBusinessIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { resyncDeck } from "@/app/founder/submit/actions"

import { GovernmentFilingSheet } from "./government-filing-modal"
import { InvestorEmailSheet } from "./investor-email-modal"

export type DeckSyncMeta = {
  syncedAt: string | null
  appliedCount: number
  skippedCount: number
  error: string | null
}

export type FilingSubmittedMap = Partial<
  Record<
    "pack" | "q15" | "ubo" | "moci" | "gta" | "qdb" | "invest_qatar",
    { at: string; reference: string | null }
  >
>

type ChannelStatus = "ready" | "sent" | "auto" | "soon"

type Channel = {
  id: string
  title: string
  description: string
  icon: IconSvgElement
  iconClassName: string
  status: ChannelStatus
  ctaLabel: string
  meta?: string
}

export function DistributePanel({
  assignmentId,
  initialEmailLastSentAt,
  initialEmailLastSentTo,
  initialFilingSubmitted,
  initialFilingGeneratedAt,
  initialDeckUrl,
  initialDeckSync,
}: {
  assignmentId: string
  initialEmailLastSentAt: string | null
  initialEmailLastSentTo: string[] | null
  initialFilingSubmitted?: FilingSubmittedMap
  initialFilingGeneratedAt?: string | null
  initialDeckUrl?: string | null
  initialDeckSync?: DeckSyncMeta | null
}) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [filingOpen, setFilingOpen] = useState(false)
  const [emailJustSent, setEmailJustSent] = useState<{
    count: number
    at: string
  } | null>(null)
  const [filingSubmitted, setFilingSubmitted] = useState<FilingSubmittedMap>(
    initialFilingSubmitted ?? {}
  )
  const [deckSync, setDeckSync] = useState<DeckSyncMeta | null>(
    initialDeckSync ?? null
  )
  const [deckPending, startDeckTransition] = useTransition()
  const deckUrl = initialDeckUrl ?? null

  const onResyncDeck = () => {
    startDeckTransition(async () => {
      const res = await resyncDeck(assignmentId)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      const data = res.data
      setDeckSync({
        syncedAt: data.syncedAt,
        appliedCount: data.appliedEdits.length,
        skippedCount: data.skippedEdits.length,
        error: data.error,
      })
      if (data.error) {
        toast.error(humanizeDeckError(data.error))
      } else if (data.appliedEdits.length === 0) {
        toast(
          "No matching numbers found in the deck. Make sure your slides include the old values in plain text."
        )
      } else {
        toast.success(
          `Deck synced — ${data.appliedEdits.length} update${data.appliedEdits.length === 1 ? "" : "s"}`
        )
      }
    })
  }

  const lastSentAt = emailJustSent?.at ?? initialEmailLastSentAt
  const lastSentCount =
    emailJustSent?.count ?? initialEmailLastSentTo?.length ?? 0
  const emailEverSent = Boolean(lastSentAt)

  const FILING_DOCS = ["q15", "ubo", "moci", "gta", "qdb", "invest_qatar"] as const
  const filingDoneCount = FILING_DOCS.filter(
    (k) => filingSubmitted[k as keyof typeof filingSubmitted]
  ).length
  const filingTouched =
    filingDoneCount > 0 || Boolean(initialFilingGeneratedAt)
  const filingAllDone = filingDoneCount === FILING_DOCS.length

  const channels: Channel[] = [
    {
      id: "qstp",
      title: "QSTP submission",
      description:
        "Your KPIs landed in the incubation team's worklist for review and feedback.",
      icon: Building01Icon,
      iconClassName: "text-emerald-600",
      status: "auto",
      ctaLabel: "Submitted",
      meta: "Auto",
    },
    {
      id: "email",
      title: "Investor update email",
      description: emailEverSent
        ? `Last sent ${formatRelative(lastSentAt!)}${
            lastSentCount ? ` to ${lastSentCount} recipient${lastSentCount === 1 ? "" : "s"}` : ""
          }.`
        : "AI-drafted email with a polished PDF attachment, sent to investors of your choice.",
      icon: Mail01Icon,
      iconClassName: "text-sky-600",
      status: emailEverSent ? "sent" : "ready",
      ctaLabel: emailEverSent ? "Send another" : "Generate & send",
    },
    {
      id: "slack",
      title: "Team Slack post",
      description: "Block-Kit summary posted to your team channel.",
      icon: SlackIcon,
      iconClassName: "text-purple-600",
      status: "soon",
      ctaLabel: "Coming soon",
    },
    {
      id: "filing",
      title: "Government filing pack",
      description: filingAllDone
        ? "All six filings logged as submitted for this period."
        : filingTouched
          ? `Pack drafted${filingDoneCount > 0 ? ` · ${filingDoneCount}/${FILING_DOCS.length} filed` : ""}.`
          : "Six pre-filled filings: QFC Q15, UBO, MoCI license, GTA tax, QDB grant, Invest Qatar.",
      icon: FileVerifiedIcon,
      iconClassName: "text-amber-600",
      status: filingAllDone ? "sent" : filingTouched ? "ready" : "ready",
      ctaLabel: filingAllDone
        ? "Open pack"
        : filingTouched
          ? "Resume pack"
          : "Generate pack",
    },
    {
      id: "whatsapp",
      title: "WhatsApp investor blast",
      description:
        "Short update + key metrics sent via WhatsApp Business to your list.",
      icon: WhatsappBusinessIcon,
      iconClassName: "text-emerald-600",
      status: "soon",
      ctaLabel: "Coming soon",
    },
    {
      id: "linkedin",
      title: "LinkedIn post draft",
      description:
        "Founder-voice post + branded image, ready to copy and publish.",
      icon: Linkedin01Icon,
      iconClassName: "text-blue-700",
      status: "soon",
      ctaLabel: "Coming soon",
    },
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((c, i) => (
          <div
            key={c.id}
            className="animate-[fadeSlideIn_0.4s_ease_both]"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <ChannelCard
              channel={c}
              onAction={
                c.id === "email"
                  ? () => setEmailOpen(true)
                  : c.id === "filing"
                    ? () => setFilingOpen(true)
                    : undefined
              }
            />
          </div>
        ))}
        <div
          className="animate-[fadeSlideIn_0.4s_ease_both]"
          style={{ animationDelay: `${channels.length * 150}ms` }}
        >
          <DeckChannelCard
            deckUrl={deckUrl}
            sync={deckSync}
            pending={deckPending}
            onResync={onResyncDeck}
          />
        </div>
      </div>

      <InvestorEmailSheet
        assignmentId={assignmentId}
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSent={(count) =>
          setEmailJustSent({ count, at: new Date().toISOString() })
        }
      />

      <GovernmentFilingSheet
        assignmentId={assignmentId}
        open={filingOpen}
        onOpenChange={setFilingOpen}
        initialSubmitted={filingSubmitted}
        onSubmittedChange={setFilingSubmitted}
      />
    </>
  )
}

function ChannelCard({
  channel,
  onAction,
}: {
  channel: Channel
  onAction?: () => void
}) {
  const isSoon = channel.status === "soon"
  const isAuto = channel.status === "auto"
  const isSent = channel.status === "sent"
  return (
    <Card className={isSoon ? "opacity-70" : ""}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon
              icon={channel.icon}
              className={`h-5 w-5 ${channel.iconClassName}`}
            />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-base">{channel.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-xs">
              {channel.description}
            </CardDescription>
          </div>
        </div>
        <StatusPill status={channel.status} />
      </CardHeader>
      <CardContent>
        <Button
          size="sm"
          variant={isSoon || isAuto ? "outline" : "default"}
          disabled={isSoon || isAuto}
          onClick={onAction}
          className="w-full"
        >
          {isSent ? <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" /> : null}
          {channel.ctaLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

function StatusPill({ status }: { status: ChannelStatus }) {
  if (status === "auto") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        ✓ Auto
      </Badge>
    )
  }
  if (status === "sent") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Sent
      </Badge>
    )
  }
  if (status === "ready") {
    return (
      <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Ready</Badge>
    )
  }
  return <Badge variant="secondary">Soon</Badge>
}

function DeckChannelCard({
  deckUrl,
  sync,
  pending,
  onResync,
}: {
  deckUrl: string | null
  sync: DeckSyncMeta | null
  pending: boolean
  onResync: () => void
}) {
  const hasDeck = Boolean(deckUrl)
  const ever = Boolean(sync?.syncedAt)
  const failed = Boolean(sync?.error)
  const succeeded = ever && !failed

  const status: ChannelStatus = !hasDeck
    ? "soon"
    : succeeded
      ? "sent"
      : "ready"

  const description = !hasDeck
    ? "Add your Google Slides URL in the data room to enable auto-sync."
    : failed
      ? `Last sync failed — ${humanizeDeckError(sync!.error!)}`
      : ever
        ? `Last synced ${formatRelative(sync!.syncedAt!)} · ${sync!.appliedCount} update${sync!.appliedCount === 1 ? "" : "s"}${sync!.skippedCount ? ` · ${sync!.skippedCount} skipped` : ""}.`
        : "Auto-syncs on submit. Re-run anytime to push the latest numbers."

  const ctaLabel = pending
    ? "Syncing…"
    : !hasDeck
      ? "Add deck URL"
      : ever
        ? "Re-sync now"
        : "Sync now"

  return (
    <Card className={!hasDeck ? "opacity-70" : ""}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon
              icon={PresentationBarChart01Icon}
              className="h-5 w-5 text-rose-600"
            />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-base">Board deck refresh</CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-xs">
              {description}
            </CardDescription>
          </div>
        </div>
        <StatusPill status={status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {hasDeck ? (
          <Button
            size="sm"
            variant="default"
            disabled={pending}
            onClick={onResync}
            className="w-full"
          >
            {failed ? (
              <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            ) : succeeded ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
            ) : null}
            {ctaLabel}
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline" className="w-full">
            <a href="/founder/data-room">{ctaLabel}</a>
          </Button>
        )}
        {hasDeck && deckUrl ? (
          <a
            href={deckUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 self-start text-[11px] text-muted-foreground hover:text-foreground"
          >
            Open deck
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
          </a>
        ) : null}
      </CardContent>
    </Card>
  )
}

function humanizeDeckError(reason: string): string {
  switch (reason) {
    case "google_not_connected":
      return "connect Google Workspace first"
    case "needs_reauth":
      return "reconnect Google to grant Slides access"
    case "invalid_deck_url":
      return "deck URL is invalid"
    case "deck_fetch_failed":
      return "couldn't open the deck (check sharing permissions)"
    case "deck_update_failed":
      return "Slides rejected the update"
    default:
      return reason
  }
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
