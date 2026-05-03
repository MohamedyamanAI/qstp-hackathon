"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SubmissionDay = {
  day: string
  metrics: number
  wins: number
  asks: number
}

const SUBMISSION_DAYS: SubmissionDay[] = [
  { day: "Mon", metrics: 22, wins: 11, asks: 6 },
  { day: "Tue", metrics: 28, wins: 14, asks: 8 },
  { day: "Wed", metrics: 41, wins: 23, asks: 12 },
  { day: "Thu", metrics: 38, wins: 19, asks: 9 },
  { day: "Fri", metrics: 32, wins: 16, asks: 7 },
  { day: "Sat", metrics: 18, wins: 8, asks: 4 },
  { day: "Sun", metrics: 24, wins: 10, asks: 5 },
]

const CAPITAL_TREND = [
  { i: 0, v: 18 },
  { i: 1, v: 26 },
  { i: 2, v: 30 },
  { i: 3, v: 22 },
  { i: 4, v: 16 },
  { i: 5, v: 24 },
  { i: 6, v: 30 },
]

const PORTAL_TREND = Array.from({ length: 26 }).map((_, i) => ({
  i,
  v:
    52 +
    Math.sin(i * 0.45) * 22 +
    Math.cos(i * 0.18) * 12 +
    (i > 18 ? -10 : 0),
}))

export function InsightsChartRow() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SubmissionCycleCard />
      <CapitalActivityCard />
      <FounderPortalCard />
    </div>
  )
}

function SubmissionCycleCard() {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-700">
      <CardHeader>
        <CardTitle className="text-[15px]">Submission cycle</CardTitle>
        <p className="text-xs text-muted-foreground">
          This week · 412 founder submissions
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SUBMISSION_DAYS}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              barCategoryGap="22%"
            >
              <Bar
                dataKey="asks"
                stackId="a"
                fill="var(--chart-2)"
                animationDuration={900}
              />
              <Bar
                dataKey="wins"
                stackId="a"
                fill="var(--chart-1)"
                animationDuration={900}
                animationBegin={120}
              />
              <Bar
                dataKey="metrics"
                stackId="a"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
                animationDuration={900}
                animationBegin={240}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <CycleStat label="Metrics" value="183" />
          <CycleStat label="Wins" value="101" />
          <CycleStat label="Asks" value="51" />
          <CycleStat label="Score" value="84" />
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Badge
            variant="outline"
            className="border-transparent bg-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400"
          >
            Healthy cycle
          </Badge>
          <Button variant="outline" size="sm" className="h-7 text-[11px]">
            Details
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CycleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="cn-font-heading text-base font-semibold tabular-nums">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

function CapitalActivityCard() {
  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-2 duration-700"
      style={{ animationDelay: "80ms", animationFillMode: "both" }}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-[15px]">Capital activity</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">
                  $48.2M
                </span>{" "}
                raised T12M
              </span>
              <Badge
                variant="outline"
                className="h-5 border-transparent bg-emerald-500/15 px-1.5 text-[10px] text-emerald-600 dark:text-emerald-400"
              >
                +10%
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[11px]">
            View
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={CAPITAL_TREND}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="capital-fill"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="linear"
                dataKey="v"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#capital-fill)"
                isAnimationActive
                animationDuration={1100}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function FounderPortalCard() {
  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-2 duration-700 md:col-span-2 xl:col-span-1"
      style={{ animationDelay: "160ms", animationFillMode: "both" }}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-[15px]">Founder portal traffic</CardTitle>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </div>
          <Badge
            variant="outline"
            className="h-5 border-transparent bg-emerald-500/15 px-1.5 text-[10px] text-emerald-600 dark:text-emerald-400"
          >
            +2% vs last month
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={PORTAL_TREND}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="portal-fill"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
                opacity={0}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#portal-fill)"
                isAnimationActive
                animationDuration={1300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
