"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CubeIcon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"

const PROBLEMS = [
  "System Downtime",
  "Inefficient Processes",
  "Scaling Challenges",
  "Frequent Outages",
  "Slow Response to Issues",
  "Lack of Monitoring",
  "Poor Resource Utilization",
  "Fragmented Communication",
  "Inadequate Disaster Recovery Plans",
  "Compliance and Security Issues",
] as const

const SOLUTIONS = [
  "99.9% Uptime",
  "Scalable system",
  "Continuous analytics",
  "High availability",
] as const

const VIEW_W = 1000
const VIEW_H = 600
const HUB = { x: 720, y: 300 }

export function ProblemSolutionRadial() {
  return (
    <Card className="overflow-hidden bg-foreground p-8 text-background md:p-12">
      <div className="grid items-start gap-8 md:grid-cols-[1fr_auto] md:gap-4">
        <div className="cn-font-heading text-3xl leading-tight font-light tracking-tight md:text-5xl md:text-right">
          Stop problems
          <br />
          before they
          <br />
          start
        </div>
        <span className="cn-font-heading hidden text-xs tracking-[0.4em] text-background/60 md:block">
          PILLARS
        </span>
      </div>

      <div className="relative mt-6">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="prob-line" x1="0" x2="1" y1="0" y2="0">
              <stop
                offset="0%"
                stopColor="var(--destructive)"
                stopOpacity="0.1"
              />
              <stop
                offset="100%"
                stopColor="var(--destructive)"
                stopOpacity="0.7"
              />
            </linearGradient>
            <linearGradient id="sol-line" x1="0" x2="1" y1="0" y2="0">
              <stop
                offset="0%"
                stopColor="var(--chart-1)"
                stopOpacity="0.7"
              />
              <stop
                offset="100%"
                stopColor="var(--chart-1)"
                stopOpacity="0.1"
              />
            </linearGradient>
          </defs>

          {/* Problem curves: from left chips into the hub */}
          {PROBLEMS.map((_, i) => {
            const y = 60 + i * (480 / (PROBLEMS.length - 1))
            const c1x = 320
            const c1y = y
            const c2x = HUB.x - 220
            const c2y = HUB.y
            return (
              <path
                key={`p-${i}`}
                d={`M 280 ${y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${HUB.x} ${HUB.y}`}
                fill="none"
                stroke="url(#prob-line)"
                strokeWidth="1.2"
              />
            )
          })}

          {/* Solution curves: from hub out to right chips */}
          {SOLUTIONS.map((_, i) => {
            const y = 200 + i * (200 / (SOLUTIONS.length - 1))
            const c1x = HUB.x + 120
            const c1y = HUB.y
            const c2x = 880
            const c2y = y
            return (
              <path
                key={`s-${i}`}
                d={`M ${HUB.x} ${HUB.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, 940 ${y}`}
                fill="none"
                stroke="url(#sol-line)"
                strokeWidth="1.2"
              />
            )
          })}

          {/* Hub blob */}
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r="105"
            fill="color-mix(in oklch, var(--chart-3) 25%, var(--foreground))"
            opacity="0.9"
          />
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r="135"
            fill="none"
            stroke="var(--chart-3)"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        </svg>

        {/* Hub icon overlay */}
        <div
          className="absolute"
          style={{
            left: `${(HUB.x / VIEW_W) * 100}%`,
            top: `${(HUB.y / VIEW_H) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <HugeiconsIcon
            icon={CubeIcon}
            className="size-16 text-background"
            strokeWidth={1.4}
          />
        </div>

        {/* Problem chips overlay (left column) */}
        <div className="absolute inset-0 grid grid-rows-10 px-2 py-2">
          {PROBLEMS.map((p) => (
            <div key={p} className="flex items-center justify-start">
              <Chip dotColor="var(--destructive)" label={p} align="left" />
            </div>
          ))}
        </div>

        {/* Solution chips overlay (right column) */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateRows: `${(200 / VIEW_H) * 100}% repeat(${SOLUTIONS.length}, ${(200 / SOLUTIONS.length / VIEW_H) * 100}%) 1fr`,
          }}
        >
          <span />
          {SOLUTIONS.map((s) => (
            <div key={s} className="flex items-center justify-end pr-2">
              <Chip dotColor="var(--chart-1)" label={s} align="right" />
            </div>
          ))}
          <span />
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed text-background/70">
        <span className="block font-semibold text-background">SRE</span>
        SRE aims to proactively manage and mitigate these challenges, ensuring
        that the business&apos;s digital services remain reliable, efficient,
        and secure.
      </p>
    </Card>
  )
}

function Chip({
  dotColor,
  label,
  align,
}: {
  dotColor: string
  label: string
  align: "left" | "right"
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border bg-foreground/80 px-2.5 py-1 text-[10px] backdrop-blur"
      style={{
        borderColor: "color-mix(in oklch, var(--background) 18%, transparent)",
        color: "var(--background)",
        flexDirection: align === "left" ? "row" : "row-reverse",
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: dotColor }}
      />
      {label}
    </span>
  )
}
