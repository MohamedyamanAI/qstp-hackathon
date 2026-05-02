"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  User03Icon,
  UserGroupIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"

export function CohortFunnel() {
  return (
    <Card className="overflow-hidden bg-foreground p-8 text-background md:p-10">
      <div className="grid items-start gap-6 md:grid-cols-3 md:gap-4">
        <CohortColumn
          title={["Traditional", "Segmentation"]}
          tag="Millions"
          description="More or less static geographic, device-based, engagement levels."
        >
          <div className="relative grid place-items-center">
            <div
              className="grid size-44 place-items-center rounded-full border"
              style={{
                borderColor: "color-mix(in oklch, var(--background) 25%, transparent)",
              }}
            >
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="size-14"
                style={{ color: "var(--chart-1)" }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </CohortColumn>

        <ConnectorArrow />

        <CohortColumn
          title={["Medium to", "Micro-Cohorts"]}
          tag="500K – 10K"
          description="Dynamic, subscription status, high-value customers, cart abandoners, niche behaviours."
        >
          <div className="relative mx-auto grid w-44 grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => {
              const center = i === 4
              return (
                <span
                  key={i}
                  className="grid aspect-square place-items-center rounded-full border"
                  style={{
                    borderColor: center
                      ? "var(--chart-1)"
                      : "color-mix(in oklch, var(--background) 22%, transparent)",
                    background: center
                      ? "color-mix(in oklch, var(--chart-1) 18%, transparent)"
                      : "transparent",
                  }}
                >
                  <HugeiconsIcon
                    icon={UserMultipleIcon}
                    className="size-4"
                    style={{
                      color: center
                        ? "var(--chart-1)"
                        : "color-mix(in oklch, var(--background) 50%, transparent)",
                    }}
                    strokeWidth={1.6}
                  />
                </span>
              )
            })}
          </div>
        </CohortColumn>

        {/* Last cohort uses 4 cols of 6 rows */}
        <div className="md:col-span-3">
          <div className="grid items-start gap-6 md:grid-cols-3">
            <div className="hidden md:block" />
            <ConnectorArrow className="hidden md:flex" />
            <CohortColumn
              title={["Cohort of", "One"]}
              tag="100 – 1"
              description="Real-time personalization, no static segments, 1:1 unique experiences."
            >
              <div className="mx-auto grid w-full max-w-[320px] grid-cols-8 gap-1.5">
                {Array.from({ length: 48 }).map((_, i) => {
                  const featured = i === 18
                  return (
                    <span
                      key={i}
                      className="grid aspect-square place-items-center rounded-full border"
                      style={{
                        borderColor: featured
                          ? "var(--chart-1)"
                          : "color-mix(in oklch, var(--background) 18%, transparent)",
                        background: featured
                          ? "var(--chart-1)"
                          : "transparent",
                      }}
                    >
                      <HugeiconsIcon
                        icon={User03Icon}
                        className="size-2.5"
                        style={{
                          color: featured
                            ? "var(--foreground)"
                            : "color-mix(in oklch, var(--background) 45%, transparent)",
                        }}
                        strokeWidth={2}
                      />
                    </span>
                  )
                })}
              </div>
            </CohortColumn>
          </div>
        </div>
      </div>
    </Card>
  )
}

function CohortColumn({
  title,
  tag,
  description,
  children,
}: {
  title: [string, string]
  tag: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h4 className="cn-font-heading text-xl font-light leading-tight tracking-tight md:text-2xl">
        {title[0]}
        <br />
        {title[1]}
      </h4>
      <p
        className="inline-flex items-center gap-1 text-sm font-semibold"
        style={{ color: "var(--chart-1)" }}
      >
        <HugeiconsIcon
          icon={UserMultipleIcon}
          className="size-3.5"
          strokeWidth={2}
        />
        {tag}
      </p>
      <p className="max-w-[260px] text-xs leading-relaxed text-background/65">
        {description}
      </p>
      <div className="mt-4 w-full">{children}</div>
    </div>
  )
}

function ConnectorArrow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center pt-12 text-background/40 ${className}`}
    >
      <span className="hidden md:inline-flex">
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className="size-6"
          strokeWidth={1.5}
        />
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className="size-6 -ml-3"
          strokeWidth={1.5}
        />
      </span>
    </div>
  )
}
