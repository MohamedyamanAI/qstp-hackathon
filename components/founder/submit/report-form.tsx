"use client"

import Link from "next/link"
import { useActionState } from "react"

import {
  saveDraft,
  submitReport,
  type ActionState,
} from "@/app/founder/submit/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  groupQuestions,
  type ReportAnswerValue,
  type ReportQuestion,
} from "@/lib/reports/schema"

function answerToInputValue(value: ReportAnswerValue | undefined): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "true" : "false"
  return String(value)
}

function FieldInput({
  q,
  defaultValue,
}: {
  q: ReportQuestion
  defaultValue: ReportAnswerValue | undefined
}) {
  const name = `q_${q.id}`
  const value = answerToInputValue(defaultValue)

  if (q.type === "longtext") {
    return <Textarea id={name} name={name} defaultValue={value} rows={3} />
  }

  if (q.type === "boolean") {
    return (
      <select
        id={name}
        name={name}
        defaultValue={value || "false"}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    )
  }

  const inputType =
    q.type === "currency" || q.type === "number" || q.type === "percent"
      ? "number"
      : "text"

  return (
    <Input
      id={name}
      name={name}
      type={inputType}
      step={q.type === "percent" ? "0.01" : "any"}
      defaultValue={value}
    />
  )
}

export function ReportForm({
  assignmentId,
  questions,
  initialAnswers,
  alreadySubmitted,
}: {
  assignmentId: string
  questions: ReportQuestion[]
  initialAnswers: Record<string, ReportAnswerValue>
  alreadySubmitted: boolean
}) {
  const [draftState, draftAction, draftPending] = useActionState<
    ActionState,
    FormData
  >(saveDraft, undefined)
  const [submitState, submitActionFn, submitPending] = useActionState<
    ActionState,
    FormData
  >(submitReport, undefined)

  const groups = groupQuestions(questions)

  return (
    <form className="flex flex-col gap-6">
      <input type="hidden" name="assignment_id" value={assignmentId} />

      {groups.map((g) => (
        <div key={g.group} className="flex flex-col gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {g.group}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {g.items.map((q) => (
              <div key={q.id} className="grid gap-2">
                <Label htmlFor={`q_${q.id}`} className="flex gap-2">
                  <span>{q.label}</span>
                  {q.required ? (
                    <span className="text-destructive">*</span>
                  ) : null}
                  {q.unit ? (
                    <span className="text-muted-foreground">({q.unit})</span>
                  ) : null}
                </Label>
                <FieldInput q={q} defaultValue={initialAnswers[q.id]} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {draftState?.error || submitState?.error ? (
        <p className="text-sm text-destructive">
          {submitState?.error ?? draftState?.error}
        </p>
      ) : null}
      {draftState?.ok ? (
        <p className="text-sm text-muted-foreground">Draft saved.</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
        <Button asChild variant="ghost">
          <Link href="/founder/submit">Back</Link>
        </Button>
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={draftPending || alreadySubmitted}
            formAction={draftAction}
          >
            {draftPending ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="submit"
            disabled={submitPending || alreadySubmitted}
            formAction={submitActionFn}
          >
            {submitPending
              ? "Submitting…"
              : alreadySubmitted
                ? "Submitted"
                : "Submit"}
          </Button>
        </div>
      </div>
    </form>
  )
}
