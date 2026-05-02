"use client"

import { Card } from "@/components/ui/card"

const COLS = 14
const ROWS = 8
const TOTAL = COLS * ROWS // 112
// Top 67% = ~75 dots are "successful" (chart-1), rest are "unsuccessful" (chart-3)
const SUCCESS_COUNT = Math.round(TOTAL * 0.67)

export function DotGridComparison() {
  return (
    <Card className="overflow-hidden bg-foreground text-background p-8 md:p-10">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-6">
          <h3 className="cn-font-heading text-4xl font-bold tracking-tight md:text-5xl">
            Creative
            <br />
            Strategy
          </h3>
          <p className="max-w-sm text-xs leading-relaxed text-background/70">
            Creative strategy is one of the core pillars of our design process —
            providing practical tools and methods for building strong,
            emotionally resonant visual identities.
          </p>
          <div>
            <p className="cn-font-heading text-6xl font-bold tracking-tight">
              <span style={{ color: "var(--chart-1)" }}>67</span>
              <span className="text-3xl align-top">%</span>
            </p>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-background/70">
              More than two-thirds of creative professionals notice a
              significant improvement in brand perception and audience
              engagement after applying structured creative strategy techniques.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex flex-col items-end gap-12 pt-1 text-[10px] tracking-[0.18em] text-background/60 uppercase">
            <span className="origin-bottom-right -rotate-90 whitespace-nowrap [writing-mode:vertical-rl]">
              Successful projects
            </span>
            <span className="origin-bottom-right -rotate-90 whitespace-nowrap [writing-mode:vertical-rl]">
              Unsuccessful projects
            </span>
          </div>
          <div
            className="grid flex-1 gap-1.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: TOTAL }).map((_, i) => {
              const isSuccess = i < SUCCESS_COUNT
              return (
                <span
                  key={i}
                  className="aspect-square rounded-full"
                  style={{
                    background: isSuccess
                      ? "var(--chart-1)"
                      : "var(--chart-3)",
                    opacity: isSuccess ? 0.95 : 0.85,
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
