"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Award01Icon,
  Building03Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  Coins02Icon,
  Copy01Icon,
  Crown02Icon,
  Database01Icon,
  Diamond02Icon,
  EyeIcon,
  FileSecurityIcon,
  IdeaIcon,
  Linkedin02Icon,
  LockPasswordIcon,
  Mail01Icon,
  MoneyBag02Icon,
  PieChart03Icon,
  ReceiptDollarIcon,
  Rocket01Icon,
  Share05Icon,
  SparklesIcon,
  StarsIcon,
  UserGroup02Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const COMPANY = {
  name: "Lumin Robotics",
  legalName: "Lumin Robotics Trading W.L.L.",
  stage: "Seed",
  sector: "Industrial AI",
  geography: "Doha, Qatar",
  founded: "Mar 2023",
  team: 14,
}

const KPI_CARDS = [
  {
    label: "MRR",
    value: "$184,200",
    delta: "+12.4%",
    deltaPositive: true,
    icon: ReceiptDollarIcon,
    spark: [110, 118, 124, 132, 138, 142, 151, 158, 162, 170, 176, 184],
    note: "vs. last month",
  },
  {
    label: "Customers",
    value: "62",
    delta: "+7",
    deltaPositive: true,
    icon: UserGroup02Icon,
    spark: [22, 28, 31, 35, 38, 42, 46, 49, 52, 55, 58, 62],
    note: "8 new logos this quarter",
  },
  {
    label: "Runway",
    value: "17.2 mo",
    delta: "+2.1 mo",
    deltaPositive: true,
    icon: MoneyBag02Icon,
    spark: [9, 10, 11, 12, 13, 14, 14, 15, 15, 16, 16, 17.2],
    note: "Burn down 18%",
  },
  {
    label: "Headcount",
    value: "14",
    delta: "+3 QoQ",
    deltaPositive: true,
    icon: Building03Icon,
    spark: [6, 7, 8, 8, 9, 10, 11, 11, 12, 13, 14, 14],
    note: "2 senior eng hires in Oct",
  },
  {
    label: "Health Score",
    value: "84",
    delta: "Top 18%",
    deltaPositive: true,
    icon: SparklesIcon,
    spark: [62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84],
    note: "QSTP cohort percentile",
  },
] as const

const REVENUE_DATA = [
  { month: "May", mrr: 92 },
  { month: "Jun", mrr: 110 },
  { month: "Jul", mrr: 124 },
  { month: "Aug", mrr: 138 },
  { month: "Sep", mrr: 151 },
  { month: "Oct", mrr: 158 },
  { month: "Nov", mrr: 170 },
  { month: "Dec", mrr: 176 },
  { month: "Jan", mrr: 184 },
]

const CUSTOMER_DATA = [
  { month: "May", customers: 22, churn: 1 },
  { month: "Jun", customers: 28, churn: 1 },
  { month: "Jul", customers: 35, churn: 0 },
  { month: "Aug", customers: 42, churn: 2 },
  { month: "Sep", customers: 49, churn: 1 },
  { month: "Oct", customers: 52, churn: 1 },
  { month: "Nov", customers: 58, churn: 0 },
  { month: "Dec", customers: 60, churn: 1 },
  { month: "Jan", customers: 62, churn: 0 },
]

const BURN_DATA = [
  { month: "May", burn: 92, balance: 980 },
  { month: "Jun", burn: 95, balance: 885 },
  { month: "Jul", burn: 88, balance: 797 },
  { month: "Aug", burn: 84, balance: 713 },
  { month: "Sep", burn: 81, balance: 632 },
  { month: "Oct", burn: 76, balance: 556 },
  { month: "Nov", burn: 74, balance: 482 },
  { month: "Dec", burn: 71, balance: 411 },
  { month: "Jan", burn: 68, balance: 343 },
]

const HEADCOUNT_DATA = [
  { month: "May", eng: 4, gtm: 2, ops: 1 },
  { month: "Jun", eng: 5, gtm: 2, ops: 1 },
  { month: "Jul", eng: 5, gtm: 2, ops: 1 },
  { month: "Aug", eng: 5, gtm: 3, ops: 1 },
  { month: "Sep", eng: 6, gtm: 3, ops: 1 },
  { month: "Oct", eng: 7, gtm: 3, ops: 1 },
  { month: "Nov", eng: 7, gtm: 4, ops: 1 },
  { month: "Dec", eng: 8, gtm: 4, ops: 2 },
  { month: "Jan", eng: 9, gtm: 4, ops: 1 },
]

const COMMITMENTS = [
  {
    label: "Close 5 enterprise pilots",
    actual: 6,
    target: 5,
    status: "hit" as const,
  },
  {
    label: "Reach $150k MRR",
    actual: 184,
    target: 150,
    suffix: "k",
    status: "hit" as const,
  },
  {
    label: "Hire 2 senior engineers",
    actual: 2,
    target: 2,
    status: "hit" as const,
  },
  {
    label: "Ship safety-critical control loop v2",
    actual: 80,
    target: 100,
    suffix: "%",
    status: "partial" as const,
  },
  {
    label: "Submit ISO 27001 stage-1",
    actual: 60,
    target: 100,
    suffix: "%",
    status: "behind" as const,
  },
]

const MILESTONES = [
  {
    when: "Apr 2026",
    title: "Pilot signed with Qatar Energy",
    icon: Rocket01Icon,
  },
  {
    when: "Mar 2026",
    title: "Hired Director of Engineering (ex-Boston Dynamics)",
    icon: UserGroup02Icon,
  },
  {
    when: "Feb 2026",
    title: "Awarded QSTP Industry Innovation Grant",
    icon: Award01Icon,
  },
  {
    when: "Jan 2026",
    title: "Crossed 60 paying customers",
    icon: StarsIcon,
  },
  {
    when: "Nov 2025",
    title: "Closed $1.2M seed round",
    icon: MoneyBag02Icon,
  },
]

const CUSTOMER_LOGOS = [
  { name: "Qatar Energy", segment: "Enterprise", acv: "$82k", since: "Jan 2025" },
  { name: "Ooredoo", segment: "Enterprise", acv: "$64k", since: "Mar 2025" },
  { name: "Mannai Corp", segment: "Enterprise", acv: "$48k", since: "Apr 2025" },
  { name: "Al Faisal", segment: "Mid-market", acv: "$28k", since: "Jun 2025" },
  { name: "Vodafone Qatar", segment: "Enterprise", acv: "$56k", since: "Jul 2025" },
  { name: "Qatar Steel", segment: "Enterprise", acv: "$72k", since: "Aug 2025" },
  { name: "QatarGas", segment: "Enterprise", acv: "$90k", since: "Oct 2025" },
  { name: "Aspire Zone", segment: "Mid-market", acv: "$22k", since: "Dec 2025" },
] as const

const TESTIMONIALS = [
  {
    quote:
      "Lumin replaced two contractors and gave us 24/7 visibility on rotating equipment. ROI in under five months.",
    author: "Yasmin Al-Kuwari",
    role: "VP Operations, Mannai Corp",
    rating: 5,
  },
  {
    quote:
      "The integration was painless. Their team works like an extension of our reliability group.",
    author: "Hassan Mahmoud",
    role: "Head of Maintenance, Qatar Steel",
    rating: 5,
  },
] as const

const TEAM = [
  {
    name: "Layla Hassan",
    role: "Co-founder & CEO",
    bio: "Ex-McKinsey energy practice. Led $40M digital transformation at Qatar Energy.",
    initials: "LH",
    color: "--chart-1",
    stats: [
      { label: "Deals closed", value: "12" },
      { label: "Revenue driven", value: "$1.8M" },
    ],
    skills: [
      { label: "Strategy", percent: 92 },
      { label: "Fundraising", percent: 85 },
    ],
    activity: [28, 34, 42, 38, 45, 52, 48, 56, 62, 58, 64, 70],
  },
  {
    name: "Omar Yamani",
    role: "Co-founder & CTO",
    bio: "PhD CMU Robotics. Two patents in industrial perception. Built control systems at Tesla.",
    initials: "OY",
    color: "--chart-3",
    stats: [
      { label: "Patents", value: "2" },
      { label: "Commits (90d)", value: "847" },
    ],
    skills: [
      { label: "Architecture", percent: 95 },
      { label: "ML / Vision", percent: 88 },
    ],
    activity: [40, 52, 48, 60, 55, 68, 72, 65, 78, 82, 75, 88],
  },
  {
    name: "Maya Patel",
    role: "Director of Engineering",
    bio: "Ex-Boston Dynamics. Shipped 4 production robotics systems for tier-1 industrial customers.",
    initials: "MP",
    color: "--chart-5",
    stats: [
      { label: "Systems shipped", value: "4" },
      { label: "Team managed", value: "9" },
    ],
    skills: [
      { label: "Robotics", percent: 90 },
      { label: "Leadership", percent: 82 },
    ],
    activity: [18, 24, 30, 36, 32, 40, 44, 48, 52, 56, 50, 58],
  },
] as const

const CAP_TABLE = [
  { holder: "Founders (Hassan, Yamani)", percent: 64.0 },
  { holder: "QSTP Seed Fund", percent: 12.5 },
  { holder: "Wamda Capital", percent: 10.0 },
  { holder: "Angel pool (5)", percent: 6.5 },
  { holder: "Employee option pool", percent: 7.0 },
] as const

const COMPLIANCE = [
  { label: "QFC Registered", since: "Apr 2023", icon: FileSecurityIcon },
  { label: "QSTP Portfolio", since: "Cohort 2023-B", icon: Crown02Icon },
  { label: "Audit: KPMG Qatar", since: "FY2025 clean", icon: CheckmarkBadge01Icon },
  {
    label: "Six Qatar filings — current",
    since: "Last: Apr 2026",
    icon: CheckmarkCircle02Icon,
  },
] as const

const DOCUMENTS = [
  { name: "Pitch Deck — Series A.pdf", size: "8.4 MB", updated: "2 days ago", restricted: false },
  { name: "Financial Model — FY2026.xlsx", size: "1.2 MB", updated: "1 week ago", restricted: false },
  { name: "Cap Table — Detailed.xlsx", size: "320 KB", updated: "3 weeks ago", restricted: true },
  { name: "Customer References.pdf", size: "640 KB", updated: "1 week ago", restricted: false },
  { name: "Articles of Association.pdf", size: "2.1 MB", updated: "2 months ago", restricted: true },
  { name: "FY2025 Audit Report — KPMG.pdf", size: "3.7 MB", updated: "Apr 2026", restricted: true },
] as const

const REVENUE_CHART_CONFIG: ChartConfig = {
  mrr: { label: "MRR (k)", color: "var(--chart-1)" },
}
const CUSTOMER_CHART_CONFIG: ChartConfig = {
  customers: { label: "Customers", color: "var(--chart-1)" },
  churn: { label: "Churned", color: "var(--chart-3)" },
}
const BURN_CHART_CONFIG: ChartConfig = {
  burn: { label: "Net burn (k)", color: "var(--chart-3)" },
  balance: { label: "Balance (k)", color: "var(--chart-1)" },
}
const HEADCOUNT_CHART_CONFIG: ChartConfig = {
  eng: { label: "Engineering", color: "var(--chart-1)" },
  gtm: { label: "Go-to-market", color: "var(--chart-2)" },
  ops: { label: "Operations", color: "var(--chart-4)" },
}

export default function FounderDataRoomPage() {
  const [shareable, setShareable] = React.useState(false)

  return (
    <div className="flex flex-col gap-8">
      <Header shareable={shareable} onToggle={() => {}} />
      <div className="grid grid-cols-[1fr_320px] items-start gap-6">
        <Trends />
        <div className="flex flex-col gap-3">
          <PrivateShareToggle shareable={shareable} onToggle={setShareable} />
          {shareable ? <LiveLinkBannerCompact /> : <PrivateModeBannerCompact />}
          {!shareable ? <ThisWeekCard /> : null}
        </div>
      </div>
      <AtAGlance />
      <div className="grid grid-cols-2 items-stretch gap-6">
        <GoalsSection />
        <MilestonesSection />
      </div>
      <TractionSection />
      <TeamSection />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CapTableCard shareable={shareable} />
        <ComplianceCard />
      </div>
      <DocumentsSection shareable={shareable} />
    </div>
  )
}

function Header({}: {
  shareable: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="cn-font-heading text-xl font-semibold tracking-tight">
            How we&apos;re growing
          </h2>
          <p className="text-sm text-muted-foreground">
            Twelve months of momentum — toggle each chart to hide it from the
            shareable view.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <HugeiconsIcon icon={Copy01Icon} className="size-4" />
            Copy link
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <HugeiconsIcon icon={Mail01Icon} className="size-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <HugeiconsIcon icon={WhatsappIcon} className="size-4" />
            WhatsApp
          </Button>
          <Button size="sm" className="gap-2">
            <HugeiconsIcon icon={Share05Icon} className="size-4" />
            Share
          </Button>
        </div>
      </div>

    </div>
  )
}


function PrivateShareToggle({
  shareable,
  onToggle,
}: {
  shareable: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full"
            style={{
              background: shareable
                ? "color-mix(in oklch, var(--chart-1) 18%, transparent)"
                : "var(--muted)",
              color: shareable ? "var(--chart-1)" : "var(--muted-foreground)",
            }}
          >
            <HugeiconsIcon
              icon={shareable ? EyeIcon : LockPasswordIcon}
              className="size-4"
              strokeWidth={2}
            />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {shareable ? "Shareable view" : "Private view"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {shareable
                ? "Anyone with the link can view."
                : "Only you and your team see this."}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-muted-foreground">Private</span>
          <Switch checked={shareable} onCheckedChange={onToggle} />
          <span className="text-xs text-muted-foreground">Shareable</span>
        </div>
      </CardContent>
    </Card>
  )
}

function PrivateModeBannerCompact() {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-foreground text-background">
            <HugeiconsIcon icon={IdeaIcon} className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Investor-ready</span>
            <span className="text-[11px] text-muted-foreground">
              Refreshed 2h ago · {COMPANY.stage} · {COMPANY.sector}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-[10px]">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
            12 / 12 complete
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            Ready to share
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function LiveLinkBannerCompact() {
  return (
    <Card size="sm" className="overflow-hidden border-primary/30 bg-primary/[0.04]">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={EyeIcon} className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Live link active</span>
            <span className="text-[11px] text-muted-foreground">
              3 viewers this week · 2 returning
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
            <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
            Copy
          </Button>
          <Button size="sm" className="h-7 gap-1.5 text-xs">
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            Open as visitor
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AtAGlance() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="At a glance"
        title="How we're doing this month"
        description={`${COMPANY.name} · ${COMPANY.stage} · ${COMPANY.sector} · ${COMPANY.geography} · Founded ${COMPANY.founded}`}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {KPI_CARDS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </section>
  )
}

function KpiCard({ kpi }: { kpi: (typeof KPI_CARDS)[number] }) {
  const data = kpi.spark.map((value, i) => ({ i, value }))
  const gradId = `spark-${kpi.label.replace(/\s+/g, "-")}`
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-xs uppercase tracking-wide">
            {kpi.label}
          </CardDescription>
          <span className="grid size-7 place-items-center rounded-md bg-muted text-foreground/70">
            <HugeiconsIcon icon={kpi.icon} className="size-4" />
          </span>
        </div>
        <CardTitle className="cn-font-heading text-3xl font-semibold tracking-tight">
          {kpi.value}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center gap-1.5 text-xs">
          <Badge
            variant={kpi.deltaPositive ? "secondary" : "outline"}
            className="gap-1 font-medium"
          >
            <HugeiconsIcon
              icon={kpi.deltaPositive ? ArrowUp01Icon : ArrowDown01Icon}
              className="size-3"
              strokeWidth={2.5}
            />
            {kpi.delta}
          </Badge>
          <span className="text-muted-foreground">{kpi.note}</span>
        </div>
        <ChartContainer
          config={{ value: { color: "var(--chart-1)" } }}
          className="aspect-[4/1] h-12 w-full"
        >
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function Trends() {
  return (
    <section className="flex h-full flex-col">
      <Tabs defaultValue="revenue" className="flex w-full flex-1 flex-col">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="revenue">Revenue / MRR</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="burn">Burn vs runway</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4 flex-1">
          <ChartCard
            title="MRR — last 9 months"
            subtitle="Compounding ~12% MoM. ARR run-rate $2.2M."
            badge="Verified · Stripe"
          >
            <ChartContainer
              config={REVENUE_CHART_CONFIG}
              className="h-[200px] w-full"
            >
              <AreaChart
                data={REVENUE_DATA}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="mrr-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#mrr-grad)"
                />
              </AreaChart>
            </ChartContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <ChartCard
            title="Customer growth — last 9 months"
            subtitle="62 paying customers. Logo churn under 2% monthly."
            badge="Verified · HubSpot"
          >
            <ChartContainer
              config={CUSTOMER_CHART_CONFIG}
              className="h-[200px] w-full"
            >
              <BarChart
                data={CUSTOMER_DATA}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="customers" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churn" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="burn" className="mt-4">
          <ChartCard
            title="Net burn vs cash balance"
            subtitle="Burn down 18% from January. 17.2 months runway at current rate."
            badge="Verified · Bank API"
          >
            <ChartContainer
              config={BURN_CHART_CONFIG}
              className="h-[200px] w-full"
            >
              <LineChart
                data={BURN_DATA}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="burn"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="headcount" className="mt-4">
          <ChartCard
            title="Headcount by function"
            subtitle="From 7 to 14 in nine months. Engineering-heavy build phase."
            badge="Verified · HRIS"
          >
            <ChartContainer
              config={HEADCOUNT_CHART_CONFIG}
              className="h-[200px] w-full"
            >
              <BarChart
                data={HEADCOUNT_DATA}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="eng" stackId="a" fill="var(--chart-1)" />
                <Bar dataKey="gtm" stackId="a" fill="var(--chart-2)" />
                <Bar
                  dataKey="ops"
                  stackId="a"
                  fill="var(--chart-4)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </section>
  )
}

function ChartCard({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string
  subtitle: string
  badge: string
  children: React.ReactNode
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <Badge variant="outline" className="gap-1.5 whitespace-nowrap">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
          {badge}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

function GoalsSection() {
  const hits = COMMITMENTS.filter((c) => c.status === "hit").length
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="Goals & commitments"
        title="What we said we'd do — and what we did"
        description={`${hits} of ${COMMITMENTS.length} stated quarterly commitments hit. Investors weight this heavily.`}
      />
      <Card className="flex-1">
        <CardContent className="space-y-5 py-6">
          {COMMITMENTS.map((c) => {
            const pct = Math.min(
              100,
              Math.round((Number(c.actual) / Number(c.target)) * 100)
            )
            const tone =
              c.status === "hit"
                ? "var(--chart-1)"
                : c.status === "partial"
                  ? "var(--chart-4)"
                  : "var(--chart-3)"
            return (
              <div key={c.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: tone }}
                    />
                    <span className="text-sm font-medium">{c.label}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.actual}
                    {c.suffix ?? ""} / {c.target}
                    {c.suffix ?? ""}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            )
          })}
        </CardContent>
        <CardFooter className="border-t bg-muted/30 py-3 text-xs text-muted-foreground">
          <HugeiconsIcon icon={SparklesIcon} className="mr-2 size-3.5" />
          You&apos;ve hit 4 of the last 5 quarterly commitment sets — top
          decile in your QSTP cohort.
        </CardFooter>
      </Card>
    </section>
  )
}

function MilestonesSection() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="Milestones"
        title="Wins that compound"
        description="Auto-pulled from your monthly submissions, press monitoring and team approvals."
      />
      <Card className="flex-1">
        <CardContent className="py-6">
          <ol className="relative ml-3 space-y-6 border-l border-border/70">
            {MILESTONES.map((m) => (
              <li key={m.title} className="ml-6">
                <span className="absolute -left-3.5 grid size-7 place-items-center rounded-full border border-border bg-background text-foreground/80 shadow-sm">
                  <HugeiconsIcon icon={m.icon} className="size-3.5" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {m.when}
                  </span>
                  <span className="text-sm font-medium">{m.title}</span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  )
}

function TractionSection() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="Traction proof"
        title="Customers, in their words"
        description="Logos pulled from connected billing. Quotes approved by each customer."
      />
      <Card className="overflow-hidden bg-gradient-to-br from-card via-muted/40 to-card p-0">
        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[1.5fr_1fr] md:p-6">
          {/* Customer list */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Active customers</h4>
              <Badge variant="outline" className="gap-1.5 text-[10px]">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-3"
                />
                Verified · Stripe
              </Badge>
            </div>
            <div className="flex flex-col gap-1.5">
              {CUSTOMER_LOGOS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card/70 px-3 py-2.5 text-xs backdrop-blur"
                >
                  <span className="font-medium">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="h-4 border-transparent text-[9px]"
                      style={{
                        background:
                          c.segment === "Enterprise"
                            ? "color-mix(in oklch, var(--chart-1) 15%, transparent)"
                            : "color-mix(in oklch, var(--chart-5) 15%, transparent)",
                        color:
                          c.segment === "Enterprise"
                            ? "var(--chart-1)"
                            : "var(--chart-5)",
                      }}
                    >
                      {c.segment}
                    </Badge>
                    <span className="font-semibold tabular-nums">{c.acv}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <HugeiconsIcon icon={Database01Icon} className="size-3" />
              Synced 4 hours ago via Stripe + HubSpot
            </div>
          </div>

          {/* Testimonials */}
          <div className="flex flex-col gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="flex flex-1 flex-col gap-3 rounded-xl border bg-card/70 p-4 backdrop-blur"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <HugeiconsIcon
                      key={i}
                      icon={StarsIcon}
                      className="size-3.5"
                      style={{ color: "var(--chart-5)" }}
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
                      style={{
                        background:
                          "color-mix(in oklch, var(--chart-3) 20%, var(--card))",
                        color: "var(--chart-3)",
                      }}
                    >
                      {t.author
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{t.author}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {t.role}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <HugeiconsIcon icon={Linkedin02Icon} className="size-3" />
                    Verified
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  )
}

function TeamSection() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="Team"
        title="Who's building this"
        description={`${COMPANY.team} people, distributed across Doha and Cambridge.`}
      />
      <Card className="overflow-hidden bg-gradient-to-br from-card via-muted/40 to-card p-0">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
          {TEAM.map((p) => {
            const sparkData = p.activity.map((v, i) => ({ i, v }))
            const gradId = `team-spark-${p.initials}`
            return (
              <div
                key={p.name}
                className="flex flex-col gap-3 rounded-xl border bg-card/70 p-4 backdrop-blur"
              >
                {/* Header: avatar + name */}
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-sm font-semibold"
                    style={{
                      background: `color-mix(in oklch, var(${p.color}) 20%, var(--card))`,
                      color: `var(${p.color})`,
                    }}
                  >
                    {p.initials}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {p.role}
                    </span>
                  </div>
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-2 gap-2">
                  {p.stats.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col gap-0.5 rounded-lg border bg-card/50 p-2"
                    >
                      <span className="text-[10px] text-muted-foreground">
                        {s.label}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Skill donut badges */}
                <div className="flex items-center gap-4">
                  {p.skills.map((sk) => {
                    const size = 36
                    const sw = 3
                    const r = (size - sw) / 2
                    const C = 2 * Math.PI * r
                    const dash = (sk.percent / 100) * C
                    return (
                      <div key={sk.label} className="flex items-center gap-2">
                        <div className="relative grid place-items-center" style={{ width: size, height: size }}>
                          <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={r}
                              fill="none"
                              stroke="var(--border)"
                              strokeWidth={sw}
                            />
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={r}
                              fill="none"
                              stroke={`var(${p.color})`}
                              strokeWidth={sw}
                              strokeLinecap="round"
                              strokeDasharray={`${dash} ${C}`}
                            />
                          </svg>
                          <span className="absolute text-[8px] font-semibold tabular-nums">
                            {sk.percent}%
                          </span>
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-[10px] font-medium">
                            {sk.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Activity sparkline */}
                <div className="rounded-lg border bg-card/50 p-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Activity
                    </span>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <HugeiconsIcon icon={Linkedin02Icon} className="size-3" />
                      LinkedIn
                    </Badge>
                  </div>
                  <ChartContainer
                    config={{ v: { color: `var(${p.color})` } }}
                    className="h-10 w-full"
                  >
                    <AreaChart
                      data={sparkData}
                      margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={`var(${p.color})`}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="100%"
                            stopColor={`var(${p.color})`}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={`var(${p.color})`}
                        strokeWidth={1.5}
                        fill={`url(#${gradId})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}

function CapTableCard({ shareable }: { shareable: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={PieChart03Icon} className="size-4" />
              Cap table
            </CardTitle>
            <CardDescription>
              Total raised $1.2M · Last round Nov 2025 · Lead: QSTP Seed Fund
            </CardDescription>
          </div>
          {shareable ? (
            <Badge variant="outline" className="gap-1.5">
              <HugeiconsIcon icon={LockPasswordIcon} className="size-3" />
              Approval required
            </Badge>
          ) : (
            <Badge variant="secondary">Founder view</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {CAP_TABLE.map((row) => (
          <div key={row.holder} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/90">{row.holder}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {row.percent.toFixed(1)}%
              </span>
            </div>
            <Progress value={row.percent * 1.5} className="h-1.5" />
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t py-3 text-xs text-muted-foreground">
        <HugeiconsIcon icon={Coins02Icon} className="mr-2 size-3.5" />
        Use of funds: 60% engineering, 25% GTM, 15% operations
      </CardFooter>
    </Card>
  )
}

function ComplianceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-4" />
          Compliance & legitimacy
        </CardTitle>
        <CardDescription>
          {COMPANY.legalName} · QFC license · Audited annually
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COMPLIANCE.map((b) => (
          <div
            key={b.label}
            className="flex items-start gap-3 rounded-md border bg-muted/30 p-3"
          >
            <span className="grid size-9 place-items-center rounded-md bg-background text-foreground">
              <HugeiconsIcon icon={b.icon} className="size-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-medium">{b.label}</span>
              <span className="text-[11px] text-muted-foreground">{b.since}</span>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t py-3 text-xs text-muted-foreground">
        <HugeiconsIcon icon={Diamond02Icon} className="mr-2 size-3.5" />
        Next filing due: Q2 2026 VAT return — drafted, awaiting review
      </CardFooter>
    </Card>
  )
}

function DocumentsSection({ shareable }: { shareable: boolean }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="Documents"
        title="The deeper read"
        description={
          shareable
            ? "Visitors can request access to restricted docs. You'll be pinged when a request comes in."
            : "Toggle which documents appear in the shareable view. Restricted docs require explicit approval each time."
        }
      />
      <Card className="overflow-hidden bg-gradient-to-br from-card via-muted/40 to-card p-0">
        <div className="flex flex-col gap-3 p-5 md:p-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DOCUMENTS.map((d) => (
              <div
                key={d.name}
                className="flex flex-col gap-3 rounded-xl border bg-card/70 p-4 backdrop-blur transition hover:ring-1 hover:ring-foreground/10"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg"
                    style={{
                      background: d.restricted
                        ? "color-mix(in oklch, var(--chart-3) 15%, var(--card))"
                        : "color-mix(in oklch, var(--chart-1) 15%, var(--card))",
                      color: d.restricted
                        ? "var(--chart-3)"
                        : "var(--chart-1)",
                    }}
                  >
                    <HugeiconsIcon
                      icon={d.restricted ? LockPasswordIcon : FileSecurityIcon}
                      className="size-4"
                    />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-xs font-medium">
                      {d.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-mono">{d.size}</span>
                      <span>·</span>
                      <span>{d.updated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="gap-1 border-transparent text-[10px]"
                    style={{
                      background: d.restricted
                        ? "color-mix(in oklch, var(--chart-3) 12%, transparent)"
                        : "color-mix(in oklch, var(--chart-1) 12%, transparent)",
                      color: d.restricted
                        ? "var(--chart-3)"
                        : "var(--chart-1)",
                    }}
                  >
                    <HugeiconsIcon
                      icon={d.restricted ? LockPasswordIcon : EyeIcon}
                      className="size-3"
                    />
                    {d.restricted ? "Restricted" : "Visible"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]">
                    {d.restricted ? "Manage access" : "Preview"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  )
}


function ThisWeekCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm">This week</CardTitle>
        <CardDescription className="text-[10px]">
          3 viewers · 2 returning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ViewerStat label="Unique viewers" value="11" delta="+4 WoW" />
        <ViewerStat label="Returning" value="3" delta="+2 WoW" />
        <ViewerStat label="Avg. time" value="6m 42s" delta="+1m 12s" />
        <ViewerStat label="Doc requests" value="2" delta="0 pending" />
      </CardContent>
    </Card>
  )
}

function ViewerStat({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        <Badge variant="outline" className="h-4 text-[9px] font-normal">
          {delta}
        </Badge>
      </div>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className="cn-font-heading text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
