"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CalendarIcon,
  GlobeIcon,
  Leaf01Icon,
  RecycleIcon,
  TruckIcon,
  UserGroupIcon,
  WaterEnergyIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"

type Stat = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  number: string
  unit?: string
  body: React.ReactNode
}

const STATS: Stat[] = [
  {
    icon: RecycleIcon,
    number: "80",
    unit: "%",
    body: (
      <>
        <span className="font-semibold">Over 80 percent</span> of items buried
        in landfills could be{" "}
        <span className="font-semibold">recycled instead.</span>
      </>
    ),
  },
  {
    icon: CalendarIcon,
    number: "75,000",
    body: (
      <>
        Recycling a single run of the Sunday paper saves{" "}
        <span className="font-semibold">75,000 trees</span>.
      </>
    ),
  },
  {
    icon: GlobeIcon,
    number: "1 ton",
    body: (
      <>
        The average family in North America, Europe, and Australia throws away
        more than{" "}
        <span className="font-semibold">one ton of garbage</span> each year.
      </>
    ),
  },
  {
    icon: TruckIcon,
    number: "14B",
    unit: "lbs",
    body: (
      <>
        <span className="font-semibold">14 billion pounds</span> of garbage,
        mostly plastic, is{" "}
        <span className="font-semibold">dumped into the ocean</span> every year.
      </>
    ),
  },
  {
    icon: WaterEnergyIcon,
    number: "30-50",
    unit: "%",
    body: (
      <>
        Compost use has been proven to{" "}
        <span className="font-semibold">reduce water consumption</span> by 30-50%
        because as soil organic matter goes up, water use goes down.
      </>
    ),
  },
  {
    icon: WorkflowSquare01Icon,
    number: "360",
    unit: "lbs",
    body: (
      <>
        The average office employee{" "}
        <span className="font-semibold">throws away 360 pounds</span> of
        recyclable paper each year.
      </>
    ),
  },
  {
    icon: Leaf01Icon,
    number: "50M",
    body: (
      <>
        The amount of wood and paper we throw away each year is{" "}
        <span className="font-semibold">enough to heat 50 million homes</span>{" "}
        for 20 years.
      </>
    ),
  },
  {
    icon: UserGroupIcon,
    number: "2/3",
    body: (
      <>
        Two-thirds of consumers are willing to pay more for products from
        companies committed to{" "}
        <span className="font-semibold">positive environmental impact</span>.
      </>
    ),
  },
]

export function EcoCirclesGrid() {
  return (
    <Card className="overflow-hidden p-8 md:p-12">
      <h3 className="cn-font-heading mb-10 text-3xl leading-tight font-bold tracking-tight md:text-4xl">
        A smarter planet
        <br />
        is a sustainable planet
      </h3>

      <div className="relative grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:gap-x-10 md:gap-y-16">
        {STATS.map((s, i) => {
          const offset = i % 2 === 0 ? "md:translate-y-0" : "md:translate-y-12"
          return (
            <div
              key={i}
              className={`relative flex flex-col items-center text-center ${offset}`}
            >
              <span
                className="absolute inset-0 -z-10 mx-auto aspect-square w-[110%] max-w-[300px] place-self-center rounded-full"
                style={{
                  background:
                    "color-mix(in oklch, var(--chart-3) 14%, transparent)",
                  border:
                    "1px solid color-mix(in oklch, var(--chart-3) 25%, transparent)",
                }}
              />
              <HugeiconsIcon
                icon={s.icon}
                className="size-10"
                style={{ color: "var(--chart-3)" }}
                strokeWidth={1.6}
              />
              <p
                className="cn-font-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl"
                style={{ color: "var(--chart-3)" }}
              >
                {s.number}
                {s.unit && <span className="text-xl">{s.unit}</span>}
              </p>
              <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-foreground/85">
                {s.body}
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-10 border-t pt-4 text-[10px] text-muted-foreground">
        For more information on how to build a smarter, sustainable, greener
        planet — talk to your team.
      </p>
    </Card>
  )
}
