"use client"

import {
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
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { InvestorEmailSheet } from "./investor-email-modal"

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
}: {
  assignmentId: string
  initialEmailLastSentAt: string | null
  initialEmailLastSentTo: string[] | null
}) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailJustSent, setEmailJustSent] = useState<{
    count: number
    at: string
  } | null>(null)

  const lastSentAt = emailJustSent?.at ?? initialEmailLastSentAt
  const lastSentCount =
    emailJustSent?.count ?? initialEmailLastSentTo?.length ?? 0
  const emailEverSent = Boolean(lastSentAt)

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
      description:
        "Pre-filled QFC, MoCI, and GTA forms ready to paste into the portals.",
      icon: FileVerifiedIcon,
      iconClassName: "text-amber-600",
      status: "soon",
      ctaLabel: "Coming soon",
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
    {
      id: "deck",
      title: "Board deck refresh",
      description:
        "Auto-update your Google Slides board deck with this period's numbers.",
      icon: PresentationBarChart01Icon,
      iconClassName: "text-rose-600",
      status: "soon",
      ctaLabel: "Coming soon",
    },
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((c) => (
          <ChannelCard
            key={c.id}
            channel={c}
            onAction={c.id === "email" ? () => setEmailOpen(true) : undefined}
          />
        ))}
      </div>

      <InvestorEmailSheet
        assignmentId={assignmentId}
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSent={(count) =>
          setEmailJustSent({ count, at: new Date().toISOString() })
        }
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
