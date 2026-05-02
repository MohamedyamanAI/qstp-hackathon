"use client"

import { useState, useTransition } from "react"

import {
  generateInvestorEmail,
  sendInvestorEmail,
  type GeneratedInvestorEmail,
} from "@/app/founder/submit/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Phase = "idle" | "generating" | "ready" | "sending" | "sent" | "error"

export function InvestorEmailCard({
  assignmentId,
  lastSentAt,
  lastSentTo,
}: {
  assignmentId: string
  lastSentAt?: string | null
  lastSentTo?: string[] | null
}) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<GeneratedInvestorEmail | null>(null)
  const [subject, setSubject] = useState("")
  const [bodyText, setBodyText] = useState("")
  const [recipientsRaw, setRecipientsRaw] = useState("")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [sentInfo, setSentInfo] = useState<{ count: number; at: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setPhase("idle")
    setError(null)
    setDraft(null)
    setSubject("")
    setBodyText("")
    setRecipientsRaw("")
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Don't reset sentInfo — it's the success indicator on the card
      reset()
    }
  }

  function startGenerate() {
    setOpen(true)
    setPhase("generating")
    setError(null)
    startTransition(async () => {
      const result = await generateInvestorEmail(assignmentId)
      if (!result.ok) {
        setError(result.error)
        setPhase("error")
        return
      }
      const d = result.data
      setDraft(d)
      setSubject(d.subject)
      setBodyText(d.bodyText)
      // Build a blob URL for preview
      const bytes = base64ToBytes(d.pdfBase64)
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPhase("ready")
    })
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
      setSentInfo({ count: result.sentTo, at: new Date().toISOString() })
      setPhase("sent")
      setTimeout(() => handleOpenChange(false), 1500)
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Email investors
            {sentInfo || lastSentAt ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Sent
              </span>
            ) : null}
          </CardTitle>
          <CardDescription>
            {sentInfo
              ? `Sent to ${sentInfo.count} investor${sentInfo.count === 1 ? "" : "s"} just now.`
              : lastSentAt
                ? `Last sent ${formatRelative(lastSentAt)}${lastSentTo?.length ? ` to ${lastSentTo.length} recipient${lastSentTo.length === 1 ? "" : "s"}` : ""}.`
                : "Generate an investor update with PDF attachment from this submission."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startGenerate} disabled={isPending}>
            {sentInfo || lastSentAt ? "Send another" : "Generate investor email"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Investor update</DialogTitle>
            <DialogDescription>
              {phase === "generating"
                ? "Drafting your update and rendering PDF…"
                : phase === "sent"
                  ? "Sent ✓"
                  : "Edit anything below, add investor emails, and send."}
            </DialogDescription>
          </DialogHeader>

          {phase === "generating" ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              <span className="animate-pulse">Generating…</span>
            </div>
          ) : phase === "error" && !draft ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={startGenerate}>Try again</Button>
            </div>
          ) : draft ? (
            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="ie-to">To (comma-separated)</Label>
                  <Input
                    id="ie-to"
                    placeholder="sarah@vc.com, omar@angel.co"
                    value={recipientsRaw}
                    onChange={(e) => setRecipientsRaw(e.target.value)}
                    disabled={phase === "sending" || phase === "sent"}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ie-subject">Subject</Label>
                  <Input
                    id="ie-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={phase === "sending" || phase === "sent"}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ie-body">Body</Label>
                  <Textarea
                    id="ie-body"
                    rows={12}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    disabled={phase === "sending" || phase === "sent"}
                    className="font-mono text-xs"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sender: {draft.meta.founderName} via platform · Reply-To: {draft.meta.founderEmail}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Attachment preview</Label>
                <div className="flex h-72 flex-col items-stretch overflow-hidden rounded-md border">
                  {pdfUrl ? (
                    <iframe src={pdfUrl} title="PDF preview" className="h-full w-full bg-muted" />
                  ) : null}
                </div>
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    download={`${draft.meta.startupName.replace(/\s+/g, "-")}-Update.pdf`}
                    className="text-xs text-muted-foreground underline"
                  >
                    Download PDF
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {error && draft ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={phase === "sending"}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!draft || phase === "sending" || phase === "sent" || isPending}>
              {phase === "sending" ? "Sending…" : phase === "sent" ? "Sent ✓" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
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
