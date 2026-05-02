"use client"

import { Card } from "@/components/ui/card"

function PlaneIcon({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2 14 10 22 12 14 13.5 12 22 10 13.5 2 12 10 10 Z" />
    </svg>
  )
}

const ROWS = 5
const COLS = 12
const TOTAL = ROWS * COLS // 60

export function PictogramComparison() {
  const left = Math.round(TOTAL * 0.58)
  const right = Math.round(TOTAL * 0.42)

  return (
    <Card className="overflow-hidden bg-foreground p-8 text-background md:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-[10px] tracking-widest text-background/55">
        <span>2025</span>
        <span>«TravelExpo» Forum</span>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-start">
        {/* Title */}
        <div>
          <p className="cn-font-heading mb-3 text-xs tracking-widest text-background/55 uppercase">
            /Travel destinations/
          </p>
          <h3 className="cn-font-heading text-2xl leading-snug font-light tracking-tight md:text-3xl">
            Which destinations
            <br />
            travelers chose
            <br />
            in 2025
          </h3>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-10">
          <StatBlock
            percent={58}
            tone="primary"
            description="travel domestically"
          />
          <StatBlock
            percent={42}
            tone="muted"
            description="choose to travel abroad"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <PlaneGrid count={left} total={TOTAL} cols={COLS} tone="primary" />
        <PlaneGrid count={right} total={TOTAL} cols={COLS} tone="muted" />
      </div>
    </Card>
  )
}

function StatBlock({
  percent,
  tone,
  description,
}: {
  percent: number
  tone: "primary" | "muted"
  description: string
}) {
  const color = tone === "primary" ? "var(--chart-3)" : "var(--background)"
  return (
    <div className="text-center md:text-left">
      <p className="cn-font-heading text-6xl font-bold tracking-tight md:text-7xl">
        <span style={{ color }}>{percent}</span>
        <span className="text-3xl align-top text-background/65">%</span>
      </p>
      <p className="mt-2 max-w-[200px] text-[11px] text-background/60">
        {description}
      </p>
    </div>
  )
}

function PlaneGrid({
  count,
  total,
  cols,
  tone,
}: {
  count: number
  total: number
  cols: number
  tone: "primary" | "muted"
}) {
  const filled = tone === "primary" ? "var(--chart-3)" : "var(--background)"
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const lit = i < count
        return (
          <PlaneIcon
            key={i}
            className="size-5"
            style={{
              color: lit ? filled : "transparent",
              stroke: lit ? "transparent" : "var(--background)",
              strokeWidth: lit ? 0 : 0.5,
              strokeOpacity: lit ? 0 : 0.5,
              opacity: lit ? 1 : 0.6,
            }}
          />
        )
      })}
    </div>
  )
}
