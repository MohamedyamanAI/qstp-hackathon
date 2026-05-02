"use client"

import { useActionState, useMemo, useState } from "react"

import { publishReport, type ActionState } from "@/app/team/reports/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { groupQuestions, type ReportQuestion } from "@/lib/reports/schema"

type StartupOption = {
  id: string
  name: string
  sector: string
  stage: string
  tier: string
  cohort: string | null
  founderEmail: string | null
}

const STAGE_LABEL: Record<string, string> = {
  idea: "Idea",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  growth: "Growth",
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function plusDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function firstOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

function lastOfMonth() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 0)
  return d.toISOString().slice(0, 10)
}

export function PublishSheet({
  templateId,
  defaultTitle,
  templateQuestions,
  startups,
}: {
  templateId: string
  defaultTitle: string
  templateQuestions: ReportQuestion[]
  startups: StartupOption[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedStartups, setSelectedStartups] = useState<Set<string>>(
    new Set()
  )
  const [includedQuestions, setIncludedQuestions] = useState<Set<string>>(
    new Set(templateQuestions.map((q) => q.id))
  )
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [cohortFilter, setCohortFilter] = useState<string | null>(null)
  const [silent, setSilent] = useState(false)

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    publishReport,
    undefined
  )

  const stages = useMemo(() => {
    const set = new Set<string>()
    for (const s of startups) set.add(s.stage)
    return Array.from(set)
  }, [startups])

  const cohorts = useMemo(() => {
    const set = new Set<string>()
    for (const s of startups) if (s.cohort) set.add(s.cohort)
    return Array.from(set).sort()
  }, [startups])

  const filteredStartups = useMemo(() => {
    const q = search.trim().toLowerCase()
    return startups.filter((s) => {
      if (stageFilter && s.stage !== stageFilter) return false
      if (cohortFilter && s.cohort !== cohortFilter) return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        (s.founderEmail ?? "").toLowerCase().includes(q) ||
        (s.cohort ?? "").toLowerCase().includes(q)
      )
    })
  }, [startups, stageFilter, cohortFilter, search])

  const groups = useMemo(
    () => groupQuestions(templateQuestions),
    [templateQuestions]
  )

  function toggleStartup(id: string) {
    setSelectedStartups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllVisible() {
    setSelectedStartups((prev) => {
      const next = new Set(prev)
      for (const s of filteredStartups) next.add(s.id)
      return next
    })
  }

  function clearAllVisible() {
    setSelectedStartups((prev) => {
      const next = new Set(prev)
      for (const s of filteredStartups) next.delete(s.id)
      return next
    })
  }

  function toggleQuestion(id: string) {
    setIncludedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(groupName: string, items: ReportQuestion[]) {
    const allOn = items.every((q) => includedQuestions.has(q.id))
    setIncludedQuestions((prev) => {
      const next = new Set(prev)
      for (const q of items) {
        if (allOn) next.delete(q.id)
        else next.add(q.id)
      }
      return next
    })
  }

  function resetQuestions() {
    setIncludedQuestions(new Set(templateQuestions.map((q) => q.id)))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Publish report</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-[66vw]! data-[side=right]:w-[66vw]"
      >
        <SheetHeader className="border-b border-border/60 px-6 py-4">
          <SheetTitle>Publish KPI report</SheetTitle>
          <SheetDescription>
            Snapshots the current default template and assigns it to the
            startups you select. Changes here only affect this publication.
          </SheetDescription>
        </SheetHeader>

        <form
          action={formAction}
          className="flex min-h-0 flex-1 flex-col"
        >
          <input type="hidden" name="template_id" value={templateId} />
          {Array.from(selectedStartups).map((id) => (
            <input key={id} type="hidden" name="startup_id" value={id} />
          ))}
          {Array.from(includedQuestions).map((id) => (
            <input key={id} type="hidden" name="question_id" value={id} />
          ))}
          <input type="hidden" name="silent" value={silent ? "true" : "false"} />

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-8">
              <section className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Basics
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="pub-title">Title</Label>
                  <Input
                    id="pub-title"
                    name="title"
                    defaultValue={defaultTitle}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pub-description">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="pub-description"
                    name="description"
                    rows={2}
                    placeholder="Shown on the founder's submit page."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pub-note">
                    Note to founders (optional)
                  </Label>
                  <Textarea
                    id="pub-note"
                    name="custom_note"
                    rows={3}
                    placeholder="Appended to the email + push notification body."
                  />
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Period &amp; due date
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="period-start">Period start</Label>
                    <Input
                      id="period-start"
                      name="period_start"
                      type="date"
                      defaultValue={firstOfMonth()}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="period-end">Period end</Label>
                    <Input
                      id="period-end"
                      name="period_end"
                      type="date"
                      defaultValue={lastOfMonth()}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due-date">Due date</Label>
                    <Input
                      id="due-date"
                      name="due_date"
                      type="date"
                      defaultValue={plusDays(7)}
                      min={todayStr()}
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Questions
                  </h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      {includedQuestions.size} of {templateQuestions.length}
                    </span>
                    <button
                      type="button"
                      onClick={resetQuestions}
                      className="underline-offset-4 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Toggle individual questions off to skip them this round
                  without changing the default template.
                </p>
                <div className="flex flex-col gap-3">
                  {groups.map((g) => {
                    const allOn = g.items.every((q) =>
                      includedQuestions.has(q.id)
                    )
                    return (
                      <div
                        key={g.group}
                        className="rounded-md border border-border/60"
                      >
                        <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
                          <span className="text-sm font-medium">
                            {g.group}
                          </span>
                          <button
                            type="button"
                            className="text-xs underline-offset-4 hover:underline"
                            onClick={() => toggleGroup(g.group, g.items)}
                          >
                            {allOn ? "Disable all" : "Enable all"}
                          </button>
                        </div>
                        <ul>
                          {g.items.map((q) => (
                            <li
                              key={q.id}
                              className="flex items-center justify-between border-b border-border/30 px-3 py-2 last:border-b-0"
                            >
                              <Label
                                htmlFor={`q-${q.id}`}
                                className="flex flex-1 items-center gap-2 font-normal"
                              >
                                <span>{q.label}</span>
                                {q.required ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Required
                                  </Badge>
                                ) : null}
                                {q.unit ? (
                                  <span className="text-xs text-muted-foreground">
                                    ({q.unit})
                                  </span>
                                ) : null}
                              </Label>
                              <Checkbox
                                id={`q-${q.id}`}
                                checked={includedQuestions.has(q.id)}
                                onCheckedChange={() => toggleQuestion(q.id)}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Recipients
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {selectedStartups.size} selected ·{" "}
                    {filteredStartups.length} visible
                  </span>
                </div>

                <div className="grid gap-2">
                  <Input
                    placeholder="Search by name, sector, cohort, or founder email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {(stages.length > 0 || cohorts.length > 0) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {stages.map((s) => {
                        const active = stageFilter === s
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() =>
                              setStageFilter(active ? null : s)
                            }
                            className={`rounded-full border px-2 py-0.5 ${
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/60 hover:border-foreground/40"
                            }`}
                          >
                            {STAGE_LABEL[s] ?? s}
                          </button>
                        )
                      })}
                      {cohorts.map((c) => {
                        const active = cohortFilter === c
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() =>
                              setCohortFilter(active ? null : c)
                            }
                            className={`rounded-full border px-2 py-0.5 ${
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/60 hover:border-foreground/40"
                            }`}
                          >
                            {c}
                          </button>
                        )
                      })}
                      {stageFilter || cohortFilter ? (
                        <button
                          type="button"
                          onClick={() => {
                            setStageFilter(null)
                            setCohortFilter(null)
                          }}
                          className="text-muted-foreground underline-offset-4 hover:underline"
                        >
                          Clear filters
                        </button>
                      ) : null}
                    </div>
                  )}
                  <div className="flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={selectAllVisible}
                      className="underline-offset-4 hover:underline"
                    >
                      Select all visible
                    </button>
                    <button
                      type="button"
                      onClick={clearAllVisible}
                      className="underline-offset-4 hover:underline text-muted-foreground"
                    >
                      Clear visible
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStartups(new Set())}
                      className="underline-offset-4 hover:underline text-muted-foreground"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                {filteredStartups.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                    {startups.length === 0
                      ? "No startups in the database yet."
                      : "No startups match these filters."}
                  </p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto rounded-md border border-border/60">
                    {filteredStartups.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-3 border-b border-border/40 px-3 py-2 last:border-b-0"
                      >
                        <Checkbox
                          id={`s-${s.id}`}
                          checked={selectedStartups.has(s.id)}
                          onCheckedChange={() => toggleStartup(s.id)}
                        />
                        <Label
                          htmlFor={`s-${s.id}`}
                          className="flex flex-1 items-center justify-between gap-3 font-normal"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{s.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {s.sector}
                              {s.cohort ? ` · ${s.cohort}` : ""}
                              {s.founderEmail ? ` · ${s.founderEmail}` : ""}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {STAGE_LABEL[s.stage] ?? s.stage}
                          </Badge>
                        </Label>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Delivery
                </h3>
                <Label className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2 font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm">Skip notifications</span>
                    <span className="text-xs text-muted-foreground">
                      Assign quietly without sending in-app, email, or push.
                    </span>
                  </div>
                  <Switch checked={silent} onCheckedChange={setSilent} />
                </Label>
              </section>

              {state?.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
              ) : null}
            </div>
          </div>

          <SheetFooter className="border-t border-border/60 px-6 py-3">
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {selectedStartups.size} startup
                {selectedStartups.size === 1 ? "" : "s"} ·{" "}
                {includedQuestions.size} question
                {includedQuestions.size === 1 ? "" : "s"}
                {silent ? " · silent" : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    pending ||
                    selectedStartups.size === 0 ||
                    includedQuestions.size === 0
                  }
                >
                  {pending ? "Publishing…" : "Publish"}
                </Button>
              </div>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
