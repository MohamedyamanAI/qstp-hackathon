"use client"

import {
  CreditCardIcon,
  GoogleDriveIcon,
  GoogleIcon,
  Mail01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Lottie from "lottie-react"
import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

import { openAssignment } from "@/app/founder/submit/actions"
import { Button } from "@/components/ui/button"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loaderAnimation = require("@/public/animations/Loader.json")

type Provider = {
  id: string
  label: string
  icon: typeof GoogleIcon
  color: string
  status: string
  connected: boolean
}

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

function PrefillOverlayBody(_props: {
  googleConnected: boolean
  stripeConnected: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  const providers: Provider[] = [
    {
      id: "gmail",
      label: "Gmail",
      icon: Mail01Icon,
      color: "#EA4335",
      status: "Reading recent emails",
      connected: true,
    },
    {
      id: "drive",
      label: "Google Drive",
      icon: GoogleDriveIcon,
      color: "#1FA463",
      status: "Scanning document titles",
      connected: true,
    },
    {
      id: "workspace",
      label: "Google Workspace",
      icon: GoogleIcon,
      color: "#4285F4",
      status: "Pulling activity",
      connected: true,
    },
    {
      id: "stripe",
      label: "Stripe",
      icon: CreditCardIcon,
      color: "#635BFF",
      status: "Fetching revenue",
      connected: true,
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= providers.length - 1) return prev
        return prev + 1
      })
    }, 600)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        {providers.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-3"
            style={{
              opacity: i <= activeIndex ? 1 : 0,
              transform: i <= activeIndex ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            <HugeiconsIcon
              icon={p.icon}
              className="size-5 shrink-0"
              style={{ color: p.color }}
            />
            <span className="text-sm text-foreground/80">{p.status}</span>
            {i === activeIndex && (
              <Lottie
                animationData={loaderAnimation}
                loop
                className="size-5 shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
