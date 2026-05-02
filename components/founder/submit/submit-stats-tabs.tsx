"use client"

import {
  AlertCircleIcon,
  CheckmarkSquare01Icon,
  FileEditIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SubmitStatsTabs({
  openCount,
  overdueCount,
  submittedCount,
}: {
  openCount: number
  overdueCount: number
  submittedCount: number
}) {
  return (
    <Tabs defaultValue="open">
      <TabsList variant="line" className="h-auto justify-start">
        <TabsTrigger value="open">
          <HugeiconsIcon icon={FileEditIcon} className="size-4" />
          Open
          <span className="ml-0.5 tabular-nums text-muted-foreground">
            {openCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="overdue">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className={`size-4 ${overdueCount > 0 ? "text-red-500" : ""}`}
          />
          Overdue
          <span
            className={`ml-0.5 tabular-nums ${overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
          >
            {overdueCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="submitted">
          <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4" />
          Submitted
          <span className="ml-0.5 tabular-nums text-muted-foreground">
            {submittedCount}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
