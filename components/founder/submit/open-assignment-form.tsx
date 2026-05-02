"use client"

import {
  CreditCardIcon,
  GoogleDriveIcon,
  GoogleIcon,
  Mail01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

import { openAssignment } from "@/app/founder/submit/actions"
import { Button } from "@/components/ui/button"

type Provider = {
  id: string
  label: string
  icon: typeof GoogleIcon
  color: string
  status: string
  connected: boolean
}

const STAGES = [
  { id: "gmail", label: "Reading Gmail subjects & snippets" },
  { id: "drive", label: "Scanning Drive document titles" },
  { id: "stripe", label: "Pulling latest revenue & payouts" },
  { id: "match", label: "Matching deterministic fields" },
  { id: "ai", label: "Running AI extraction" },
] as const

export function OpenAssignmentForm({
  assignmentId,
  buttonLabel,
  googleConnected,
  stripeConnected,
}: {
  assignmentId: string
  buttonLabel: string
  googleConnected: boolean
  stripeConnected: boolean
}) {
  return (
    <form action={openAssignment}>
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <SubmitButton label={buttonLabel} />
      <PrefillOverlay
        googleConnected={googleConnected}
        stripeConnected={stripeConnected}
      />
    </form>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Preparing…" : label}
    </Button>
  )
}

function PrefillOverlay({
  googleConnected,
  stripeConnected,
}: {
  googleConnected: boolean
  stripeConnected: boolean
}) {
  const { pending } = useFormStatus()
  if (!pending) return null
  return (
    <PrefillOverlayBody
      googleConnected={googleConnected}
      stripeConnected={stripeConnected}
    />
  )
}

function PrefillOverlayBody({
  googleConnected,
  stripeConnected,
}: {
  googleConnected: boolean
  stripeConnected: boolean
}) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1))
    }, 1100)
    return () => clearInterval(interval)
  }, [])

  const providers: Provider[] = [
    {
      id: "gmail",
      label: "Gmail",
      icon: Mail01Icon,
      color: "#EA4335",
      status: googleConnected ? "Reading recent emails" : "Not connected",
      connected: googleConnected,
    },
    {
      id: "drive",
      label: "Google Drive",
      icon: GoogleDriveIcon,
      color: "#1FA463",
      status: googleConnected ? "Scanning document titles" : "Not connected",
      connected: googleConnected,
    },
    {
      id: "workspace",
      label: "Google Workspace",
      icon: GoogleIcon,
      color: "#4285F4",
      status: googleConnected ? "Pulling activity" : "Not connected",
      connected: googleConnected,
    },
    {
      id: "stripe",
      label: "Stripe",
      icon: CreditCardIcon,
      color: "#635BFF",
      status: stripeConnected ? "Fetching revenue" : "Not connected",
      connected: stripeConnected,
    },
    {
      id: "ai",
      label: "AI extractor",
      icon: SparklesIcon,
      color: "#A855F7",
      status: "Mapping evidence to fields",
      connected: true,
    },
  ]

  const currentStage = STAGES[stageIndex]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="size-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <HugeiconsIcon
                icon={SparklesIcon}
                className="size-6 text-primary"
              />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-base font-semibold">Preparing your form</p>
            <p className="text-sm text-muted-foreground">
              Pulling the latest data from your connected tools and
              auto-filling fields with evidence.
            </p>
          </div>

          <ul className="flex w-full flex-col gap-2">
            {providers.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 px-3 py-2"
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: `${p.color}1f`,
                  }}
                >
                  <HugeiconsIcon
                    icon={p.icon}
                    className="size-4"
                    style={{ color: p.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">
                    {p.label}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {p.status}
                  </div>
                </div>
                {p.connected ? (
                  <div className="flex size-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                ) : (
                  <div className="flex size-2 shrink-0 rounded-full bg-muted" />
                )}
              </li>
            ))}
          </ul>

          <div className="flex w-full items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex size-1.5 animate-pulse rounded-full bg-primary" />
            <span className="truncate">{currentStage.label}…</span>
          </div>
        </div>
      </div>
    </div>
  )
}
