"use client"

import {
  Cancel01Icon,
  Mail01Icon,
  MaximizeScreenIcon,
  SentIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useState, useTransition } from "react"
import { createPortal } from "react-dom"

import {
  generateInvestorEmail,
  sendInvestorEmail,
  type GeneratedInvestorEmail,
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
import { Textarea } from "@/components/ui/textarea"

type Phase = "generating" | "ready" | "sending" | "sent" | "error"

export function InvestorEmailSheet({
  assignmentId,
  open,
  onOpenChange,
  onSent,
}: {
  assignmentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSent?: (count: number) => void
}) {
  const [phase, setPhase] = useState<Phase>("generating")
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<GeneratedInvestorEmail | null>(null)
  const [subject, setSubject] = useState("")
  const [bodyText, setBodyText] = useState("")
  const [recipientsRaw, setRecipientsRaw] = useState("")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfFullscreen, setPdfFullscreen] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!pdfFullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPdfFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [pdfFullscreen])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    // Synchronization: when the parent opens the sheet, kick off generation.
    // setState here is intentional and limited to mount-of-open transition.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPhase("generating")
    setError(null)
    startTransition(async () => {
      const result = await generateInvestorEmail(assignmentId)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error)
        setPhase("error")
        return
      }
      const d = result.data
      setDraft(d)
      setSubject(d.subject)
      setBodyText(d.bodyText)
      const bytes = base64ToBytes(d.pdfBase64)
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPhase("ready")
    })
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      cancelled = true
    }
  }, [open, assignmentId])

  function handleSheetOpenChange(next: boolean) {
    if (!next) {
      // Reset on close, synchronously in the user event
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      setDraft(null)
      setSubject("")
      setBodyText("")
      setRecipientsRaw("")
      setPdfUrl(null)
      setPdfFullscreen(false)
      setError(null)
      setPhase("generating")
    }
    onOpenChange(next)
  }

  function handleSend() {
    if (!draft) return
    const recipients = recipientsRaw
      .split(/[,\n;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (recipients.length === 0) {
      setError("Add at least one investor email.")
      return
    }
    setError(null)
    setPhase("sending")
    startTransition(async () => {
      const result = await sendInvestorEmail({
        assignmentId,
        recipients,
        subject,
        bodyText,
      })
      if (!result.ok) {
        setError(result.error)
        setPhase("ready")
        return
      }
      setPhase("sent")
      onSent?.(result.sentTo)
      setTimeout(() => handleSheetOpenChange(false), 1400)
    })
  }

  const sending = phase === "sending"
  const sent = phase === "sent"

  return (
    <>
    <Drawer
      modal={!pdfFullscreen}
      open={open}
      onOpenChange={handleSheetOpenChange}
    >
      <DrawerContent className="mx-auto h-[100dvh] max-h-[100dvh] w-full md:h-[90vh] md:max-h-[90vh] md:max-w-3xl">
        <DrawerHeader className="border-b border-border/60 px-6 py-4">
          <DrawerTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5" />
            Investor update email
            {sent ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Sent
              </Badge>
            ) : phase === "generating" ? (
              <Badge variant="secondary">Drafting…</Badge>
            ) : null}
          </DrawerTitle>
          <DrawerDescription>
            AI-drafted from your latest submission. Edit anything below, attach
            your investor list, and send.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {phase === "generating" && !draft ? (
            <DraftingSkeleton />
          ) : phase === "error" && !draft ? (
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
          ) : draft ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="flex flex-col gap-5">
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Recipients
                  </h3>
                  <div className="grid gap-2">
                    <Label htmlFor="ie-to">
                      Investor emails
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (comma, space, or newline separated)
                      </span>
                    </Label>
                    <Textarea
                      id="ie-to"
                      rows={2}
                      placeholder="sarah@vc.com, omar@angel.co, board@earlyfund.com"
                      value={recipientsRaw}
                      onChange={(e) => setRecipientsRaw(e.target.value)}
                      disabled={sending || sent}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sender shows as <strong>{draft.meta.founderName}</strong>{" "}
                      via the platform · replies go to{" "}
                      <strong>{draft.meta.founderEmail}</strong>
                    </p>
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Message
                  </h3>
                  <div className="grid gap-2">
                    <Label htmlFor="ie-subject">Subject</Label>
                    <Input
                      id="ie-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={sending || sent}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ie-body">Body</Label>
                    <Textarea
                      id="ie-body"
                      rows={14}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      disabled={sending || sent}
                      className="text-sm leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your name and title are appended automatically as the
                      sign-off.
                    </p>
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    PDF attachment
                  </h3>
                  {pdfUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2 text-xs"
                      onClick={() => setPdfFullscreen(true)}
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
                  {pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      title="Investor update PDF"
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      Rendering preview…
                    </div>
                  )}
                </div>
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    download={`${draft.meta.startupName.replace(/\s+/g, "-")}-Update.pdf`}
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Download PDF
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {error && draft ? (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <DrawerFooter className="border-t border-border/60 px-6 py-4">
          <span className="mb-1 text-center text-xs text-muted-foreground">
            {draft
              ? `${recipientsRaw
                  .split(/[,\n;\s]+/)
                  .map((s) => s.trim())
                  .filter(Boolean).length} recipient(s)`
              : ""}
          </span>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!draft || sending || sent}
            className="h-12 w-full"
          >
            <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
            {sending ? "Sending…" : sent ? "Sent ✓" : "Send"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
    {pdfFullscreen && pdfUrl && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex flex-col bg-background"
            style={{ pointerEvents: "auto" }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
              <div className="flex items-center gap-2 text-sm">
                <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
                <span className="font-medium">
                  {draft?.meta.startupName ?? "Investor"} update
                </span>
                <span className="text-muted-foreground">· PDF preview</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setPdfFullscreen(false)}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                Close
              </Button>
            </div>
            <iframe
              src={pdfUrl}
              title="Investor update PDF (fullscreen)"
              className="h-full w-full flex-1"
            />
          </div>,
          document.body
        )
      : null}
    </>
  )
}

function DraftingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-[68vh] animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
