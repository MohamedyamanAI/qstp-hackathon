"use client"

import { useActionState, useState } from "react"

import {
  updateDefaultTemplate,
  type ActionState,
} from "@/app/team/reports/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ReportQuestion, ReportQuestionType } from "@/lib/reports/schema"

type Draft = ReportQuestion & { _key: string }

const TYPE_OPTIONS: { value: ReportQuestionType; label: string }[] = [
  { value: "currency", label: "Currency" },
  { value: "number", label: "Number" },
  { value: "percent", label: "Percent" },
  { value: "text", label: "Short text" },
  { value: "longtext", label: "Long text" },
  { value: "boolean", label: "Yes / No" },
]

let keySeq = 0
const nextKey = () => `q-${++keySeq}`

export function TemplateEditor({
  templateId,
  initialTitle,
  initialDescription,
  initialQuestions,
}: {
  templateId: string
  initialTitle: string
  initialDescription: string
  initialQuestions: ReportQuestion[]
}) {
  const [questions, setQuestions] = useState<Draft[]>(() =>
    initialQuestions.map((q) => ({ ...q, _key: nextKey() }))
  )

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateDefaultTemplate,
    undefined
  )

  function update(key: string, patch: Partial<Draft>) {
    setQuestions((prev) =>
      prev.map((q) => (q._key === key ? { ...q, ...patch } : q))
    )
  }

  function remove(key: string) {
    setQuestions((prev) => prev.filter((q) => q._key !== key))
  }

  function add() {
    setQuestions((prev) => [
      ...prev,
      { _key: nextKey(), id: "", label: "", type: "number" },
    ])
  }

  function move(key: string, dir: -1 | 1) {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q._key === key)
      if (idx < 0) return prev
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[next]] = [copy[next], copy[idx]]
      return copy
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default KPI template</CardTitle>
        <CardDescription>
          Edit the questions every founder is asked. Changes apply to future
          publications only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6">
          <input type="hidden" name="template_id" value={templateId} />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tpl-title">Title</Label>
              <Input
                id="tpl-title"
                name="title"
                defaultValue={initialTitle}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-description">Description</Label>
              <Input
                id="tpl-description"
                name="description"
                defaultValue={initialDescription}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Questions</h3>
              <Button type="button" variant="outline" size="sm" onClick={add}>
                Add question
              </Button>
            </div>

            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions yet. Click &ldquo;Add question&rdquo; to create
                one.
              </p>
            ) : null}

            <ul className="flex flex-col gap-3">
              {questions.map((q, idx) => (
                <li
                  key={q._key}
                  className="rounded-md border border-border/60 bg-card p-3"
                >
                  <input
                    type="hidden"
                    name="question_id"
                    value={q.id ?? ""}
                  />
                  <div className="grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-5 grid gap-1.5">
                      <Label htmlFor={`label-${q._key}`}>Label</Label>
                      <Input
                        id={`label-${q._key}`}
                        name="question_label"
                        value={q.label}
                        onChange={(e) =>
                          update(q._key, { label: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="md:col-span-2 grid gap-1.5">
                      <Label>Type</Label>
                      <Select
                        value={q.type}
                        onValueChange={(v) =>
                          update(q._key, { type: v as ReportQuestionType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="hidden"
                        name="question_type"
                        value={q.type}
                      />
                    </div>
                    <div className="md:col-span-2 grid gap-1.5">
                      <Label htmlFor={`unit-${q._key}`}>Unit</Label>
                      <Input
                        id={`unit-${q._key}`}
                        name="question_unit"
                        value={q.unit ?? ""}
                        onChange={(e) =>
                          update(q._key, { unit: e.target.value })
                        }
                        placeholder="USD, %, …"
                      />
                    </div>
                    <div className="md:col-span-2 grid gap-1.5">
                      <Label htmlFor={`group-${q._key}`}>Group</Label>
                      <Input
                        id={`group-${q._key}`}
                        name="question_group"
                        value={q.group ?? ""}
                        onChange={(e) =>
                          update(q._key, { group: e.target.value })
                        }
                        placeholder="Financials"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center gap-2 pt-6">
                      <input
                        id={`req-${q._key}`}
                        type="checkbox"
                        checked={!!q.required}
                        onChange={(e) =>
                          update(q._key, { required: e.target.checked })
                        }
                        className="size-4"
                      />
                      <Label
                        htmlFor={`req-${q._key}`}
                        className="text-xs"
                      >
                        Req.
                      </Label>
                      <input
                        type="hidden"
                        name="question_required"
                        value={q.required ? "true" : "false"}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(q._key, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(q._key, 1)}
                      disabled={idx === questions.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(q._key)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {state?.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          {state?.ok ? (
            <p className="text-sm text-muted-foreground">Saved.</p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save template"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
