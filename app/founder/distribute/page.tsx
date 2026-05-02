import {
  AddCircleIcon,
  ArrowRight01Icon,
  Building01Icon,
  CheckmarkCircle02Icon,
  Edit02Icon,
  EyeIcon,
  FileVerifiedIcon,
  Linkedin01Icon,
  Mail01Icon,
  MailEdit01Icon,
  MegaphoneIcon,
  PencilEdit02Icon,
  PresentationBarChart01Icon,
  RobotIcon,
  SlackIcon,
  SparklesIcon,
  UserAdd01Icon,
  UserGroup03Icon,
  WhatsappBusinessIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/require"
import type { Json } from "@/lib/supabase/database.types"

type Recipient = {
  id?: string
  name?: string
  email?: string
  channel?: "email" | "whatsapp" | "slack" | string
  frequency?: "weekly" | "monthly" | "quarterly" | string
  visibility?: "full" | "summary" | "metrics_only" | string
  last_opened_at?: string | null
  opens?: number
  replies?: number
  type?: "investor" | "board" | "advisor" | "family" | string
  avatar_url?: string | null
}

type GeneratedOutputs = {
  investor_email?: {
    subject?: string
    preview?: string
    lastSentAt?: string | null
    recipients?: number
    opens?: number
    replies?: number
    body?: string
  }
  board_deck?: {
    slides_changed?: number
    last_pushed_at?: string | null
  }
  pitch_deck?: { last_updated_at?: string | null }
  linkedin_post?: {
    body?: string
    image_url?: string | null
    impressions?: number
    reactions?: number
  }
  slack_post?: { body?: string }
  family_update?: { body?: string }
  filings?: Record<string, { at?: string; reference?: string | null }>
  [k: string]: Json | undefined
}

function dicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—"
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return "scheduled"
  const m = Math.floor(ms / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  return `${w}w ago`
}

const DEFAULT_RECIPIENTS: Recipient[] = [
  {
    name: "Doha Tech Angels",
    email: "partners@dohatech.qa",
    channel: "email",
    frequency: "monthly",
    visibility: "full",
    type: "investor",
    opens: 12,
    replies: 3,
  },
  {
    name: "QSTP Innovation Board",
    email: "board@qstp.org.qa",
    channel: "email",
    frequency: "monthly",
    visibility: "full",
    type: "board",
    opens: 8,
    replies: 2,
  },
  {
    name: "Sara K. — Mentor",
    email: "sara.k@advisors.qa",
    channel: "whatsapp",
    frequency: "monthly",
    visibility: "summary",
    type: "advisor",
    opens: 6,
    replies: 4,
  },
  {
    name: "Family update list",
    email: "family-list",
    channel: "whatsapp",
    frequency: "quarterly",
    visibility: "metrics_only",
    type: "family",
    opens: 14,
    replies: 1,
  },
]

const TEMPLATES = [
  {
    id: "tpl-investor",
    title: "Investor email",
    description:
      "Founder voice samples + structured fields. AI uses these to draft each month's email.",
    icon: Mail01Icon,
    tint: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    samples: 8,
    lastEdited: "3 days ago",
  },
  {
    id: "tpl-deck",
    title: "Board deck",
    description:
      "Slide layout, brand colours, KPI ordering. Drives the auto-updated Google Slides export.",
    icon: PresentationBarChart01Icon,
    tint: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    samples: 14,
    lastEdited: "Last week",
  },
  {
    id: "tpl-linkedin",
    title: "LinkedIn post",
    description:
      "Hook style, hashtags, CTA preferences. The AI writes in your voice when wins come up.",
    icon: Linkedin01Icon,
    tint: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    samples: 6,
    lastEdited: "Yesterday",
  },
  {
    id: "tpl-newsletter",
    title: "Newsletter blurb",
    description:
      "Tone profile for the QSTP audience newsletter — concise wins + one ask.",
    icon: MegaphoneIcon,
    tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    samples: 4,
    lastEdited: "2 weeks ago",
  },
]

export default async function FounderDistributePage() {
  const { supabase, userId } = await requireRole("founder")

  const { data: startup } = await supabase
    .from("startups")
    .select("id, name, recipients")
    .eq("founder_id", userId)
    .maybeSingle()

  const startupId = startup?.id ?? null

  const { data: subs } = startupId
    ? await supabase
        .from("kpi_submissions")
        .select(
          "id, status, submitted_at, period_start, period_end, generated_outputs, metrics"
        )
        .eq("startup_id", startupId)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(12)
    : { data: [] as never[] }

  const submissions = subs ?? []
  const latest = submissions.find((s) => s.status === "submitted") ?? null
  const sent = submissions.filter((s) => s.status === "submitted").slice(0, 8)
  const outputs = (latest?.generated_outputs as GeneratedOutputs | null) ?? {}

  const recipients: Recipient[] = Array.isArray(startup?.recipients)
    ? (startup.recipients as Recipient[])
    : []
  const recipientList: Recipient[] =
    recipients.length > 0 ? recipients : DEFAULT_RECIPIENTS

  const investorRecipients = recipientList.filter((r) => r.type === "investor")
  const boardRecipients = recipientList.filter((r) => r.type === "board")
  const advisorRecipients = recipientList.filter((r) => r.type === "advisor")
  const familyRecipients = recipientList.filter((r) => r.type === "family")

  const draftsCount =
    (outputs.investor_email ? 1 : 0) +
    (outputs.board_deck ? 1 : 0) +
    (outputs.pitch_deck ? 1 : 0) +
    (outputs.linkedin_post ? 1 : 0) +
    (outputs.slack_post ? 1 : 0) +
    (outputs.family_update ? 1 : 0) +
    1 // placeholder always-on grant filing channel
  const sentInPeriodCount = outputs.investor_email?.lastSentAt ? 1 : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Distribute
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Outputs control center
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            One submission, many destinations. Every channel below was drafted
            by AI from your latest report — review, tweak, then approve.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/founder/submit">
              <HugeiconsIcon icon={MailEdit01Icon} data-icon="inline-start" />
              Refresh from latest submission
            </Link>
          </Button>
          <Button>
            <HugeiconsIcon icon={SparklesIcon} data-icon="inline-start" />
            Approve all
          </Button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryTile
          icon={MailEdit01Icon}
          label="Awaiting your approval"
          value={`${draftsCount}`}
          tint="bg-sky-500/15 text-sky-600 dark:text-sky-400"
          sub={
            latest?.submitted_at
              ? `Drafted ${timeAgo(latest.submitted_at)}`
              : "Submit a report to start"
          }
        />
        <SummaryTile
          icon={CheckmarkCircle02Icon}
          label="Sent this period"
          value={`${sentInPeriodCount}`}
          tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          sub={
            outputs.investor_email?.lastSentAt
              ? `Last send ${timeAgo(outputs.investor_email.lastSentAt)}`
              : "Nothing pushed yet"
          }
        />
        <SummaryTile
          icon={EyeIcon}
          label="Investor open rate"
          value={
            outputs.investor_email?.recipients
              ? `${Math.round(
                  ((outputs.investor_email.opens ??
                    Math.round(outputs.investor_email.recipients * 0.78)) /
                    Math.max(outputs.investor_email.recipients, 1)) *
                    100
                )}%`
              : "—"
          }
          tint="bg-purple-500/15 text-purple-600 dark:text-purple-400"
          sub="Across last 3 sends"
        />
        <SummaryTile
          icon={UserGroup03Icon}
          label="Recipients"
          value={`${recipientList.length}`}
          tint="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          sub={`${investorRecipients.length} investors · ${boardRecipients.length} board`}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2 font-normal">
              {draftsCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent
            <Badge variant="secondary" className="ml-2 font-normal">
              {sent.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="recipients">
            Recipients
            <Badge variant="secondary" className="ml-2 font-normal">
              {recipientList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* ACTIVE */}
        <TabsContent value="active" className="mt-5 flex flex-col gap-6">
          {/* INVESTOR UPDATES */}
          <DraftSection
            icon={Mail01Icon}
            title="Investor updates"
            description="Per-investor cards. Each can be approved or edited individually."
            tint="text-sky-600 dark:text-sky-400"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {(investorRecipients.length > 0
                ? investorRecipients
                : DEFAULT_RECIPIENTS.filter((r) => r.type === "investor")
              )
                .slice(0, 4)
                .map((r, i) => (
                  <InvestorDraftCard
                    key={r.email ?? i}
                    recipient={r}
                    subject={outputs.investor_email?.subject}
                    preview={
                      outputs.investor_email?.preview ??
                      outputs.investor_email?.body?.slice(0, 160) ??
                      "Quick October update — MRR up 18%, two new pilot signups, and a clear ask: warm intros into healthcare buyers in Doha."
                    }
                  />
                ))}
            </div>
          </DraftSection>

          {/* BOARD DECK + PITCH DECK */}
          <div className="grid gap-3 md:grid-cols-2">
            <DraftCard
              icon={PresentationBarChart01Icon}
              tint="bg-rose-500/15 text-rose-600 dark:text-rose-400"
              title="Board deck"
              status={
                outputs.board_deck
                  ? { label: "Updated", tone: "ready" }
                  : { label: "Awaiting refresh", tone: "draft" }
              }
              description={
                outputs.board_deck?.slides_changed
                  ? `${outputs.board_deck.slides_changed} slides changed since last export.`
                  : "Traction, financials, and pipeline slides will refresh from your latest numbers."
              }
              meta={
                outputs.board_deck?.last_pushed_at
                  ? `Last push ${timeAgo(outputs.board_deck.last_pushed_at)}`
                  : "Never pushed"
              }
              primaryLabel="Push to Google Slides"
              secondaryLabel="Preview slides"
            />
            <DraftCard
              icon={PencilEdit02Icon}
              tint="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
              title="Pitch deck — traction slide"
              status={{ label: "Ready", tone: "ready" }}
              description="Investor-ready traction slide refreshed with new MRR, customer count and pilot wins."
              meta={
                outputs.pitch_deck?.last_updated_at
                  ? `Last refreshed ${timeAgo(outputs.pitch_deck.last_updated_at)}`
                  : "Refreshed minutes ago"
              }
              primaryLabel="Update working deck"
              secondaryLabel="Download PNG"
            />
          </div>

          {/* GOVERNMENT FILINGS */}
          <DraftSection
            icon={FileVerifiedIcon}
            title="Government filings"
            description="Six pre-filled filings — QFC Q15, UBO, MoCI license, GTA tax, QDB grant, Invest Qatar."
            tint="text-amber-600 dark:text-amber-400"
          >
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {[
                "QFC Q15",
                "UBO",
                "MoCI License",
                "GTA Tax",
                "QDB Grant",
                "Invest Qatar",
              ].map((name) => {
                const key = name.toLowerCase().replace(/[^a-z]/g, "")
                const filed = outputs.filings?.[key]?.at
                return (
                  <FilingRow
                    key={name}
                    name={name}
                    submittedAt={filed ?? null}
                  />
                )
              })}
            </div>
          </DraftSection>

          {/* SOCIAL & PUBLIC + INTERNAL/FAMILY */}
          <div className="grid gap-3 md:grid-cols-2">
            <SocialDraftCard
              icon={Linkedin01Icon}
              tint="bg-blue-500/15 text-blue-700 dark:text-blue-400"
              title="LinkedIn post"
              body={
                outputs.linkedin_post?.body ??
                "Excited to share October's milestone — we crossed 50K MRR and welcomed two healthcare pilot partners in Doha. Huge thanks to @QSTP, @MoCI, and our advisors. The mission continues. 🇶🇦"
              }
              imageUrl={
                outputs.linkedin_post?.image_url ??
                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&h=420&q=70"
              }
              meta={
                outputs.linkedin_post
                  ? `${outputs.linkedin_post.impressions ?? "0"} forecast impressions · founder voice`
                  : "Awaiting your approval"
              }
              primaryLabel="Approve & post"
            />
            <DraftCard
              icon={SlackIcon}
              tint="bg-purple-500/15 text-purple-600 dark:text-purple-400"
              title="Internal team Slack post"
              status={{ label: "Draft ready", tone: "draft" }}
              description={
                outputs.slack_post?.body ??
                "October numbers are in: MRR $52K (+18%), 2 healthcare pilots signed, runway 14mo. Big thanks to the team. Full report in the data room."
              }
              meta="To #team-updates"
              primaryLabel="Send to #team"
              secondaryLabel="Edit"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DraftCard
              icon={WhatsappBusinessIcon}
              tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              title="Family & advisors"
              status={{ label: "Plain language", tone: "draft" }}
              description={
                outputs.family_update?.body ??
                "Quick monthly update: business is up 18% from last month, the team grew by one, and we're working with two new healthcare partners in Qatar. Runway is healthy. Love you all — talk soon."
              }
              meta={`${familyRecipients.length || 1} recipient${
                (familyRecipients.length || 1) === 1 ? "" : "s"
              } via WhatsApp / Email`}
              primaryLabel="Send"
              secondaryLabel="Edit"
            />
            <DraftCard
              icon={Building01Icon}
              tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              title="QSTP submission"
              status={{ label: "Filed automatically", tone: "auto" }}
              description={
                latest
                  ? `Your submission for ${latest.period_start} → ${latest.period_end} landed in the incubation team's worklist.`
                  : "Your next submission will land here automatically."
              }
              meta={
                latest?.submitted_at
                  ? `Auto-submitted ${timeAgo(latest.submitted_at)}`
                  : "Auto · no action needed"
              }
              primaryLabel="View team feedback"
            />
          </div>
        </TabsContent>

        {/* SENT */}
        <TabsContent value="sent" className="mt-5 flex flex-col gap-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Distribution archive</CardTitle>
              <CardDescription className="text-xs">
                Everything you&rsquo;ve sent, with engagement signals when
                available.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-0">
              <div className="grid grid-cols-12 gap-2 border-b border-border/60 px-6 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <div className="col-span-4">Channel · subject</div>
                <div className="col-span-2">Period</div>
                <div className="col-span-2">Recipients</div>
                <div className="col-span-2">Engagement</div>
                <div className="col-span-2 text-right">Sent</div>
              </div>
              {sent.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon
                      icon={MailEdit01Icon}
                      className="size-5 text-muted-foreground"
                    />
                  </div>
                  <p className="text-sm font-medium">Nothing sent yet</p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Submit a monthly report and your investor updates,
                    LinkedIn posts, and team announcements will appear here
                    once approved.
                  </p>
                </div>
              ) : (
                sent.map((s) => {
                  const out =
                    (s.generated_outputs as GeneratedOutputs | null) ?? {}
                  const ie = out.investor_email
                  const recipientCount = ie?.recipients ?? recipientList.length
                  const opens =
                    ie?.opens ?? Math.round(recipientCount * 0.74)
                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-12 items-center gap-2 px-6 py-3 text-sm hover:bg-muted/40"
                    >
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400">
                          <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {ie?.subject ??
                              `${new Date(s.period_start).toLocaleString(undefined, {
                                month: "long",
                              })} investor update`}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Investor email
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 text-xs text-muted-foreground">
                        {new Date(s.period_start).toLocaleString(undefined, {
                          month: "short",
                        })}{" "}
                        →{" "}
                        {new Date(s.period_end).toLocaleString(undefined, {
                          month: "short",
                        })}
                      </div>
                      <div className="col-span-2 text-xs">
                        {recipientCount}
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(opens / Math.max(recipientCount, 1)) * 100}
                            className="h-1.5 w-20"
                          />
                          <span className="text-xs text-muted-foreground">
                            {opens}/{recipientCount}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 text-right text-xs text-muted-foreground">
                        {timeAgo(s.submitted_at)}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECIPIENTS */}
        <TabsContent value="recipients" className="mt-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Manage who receives what — channel, frequency, and visibility.
            </p>
            <Button>
              <HugeiconsIcon icon={UserAdd01Icon} data-icon="inline-start" />
              Add recipient
            </Button>
          </div>

          <RecipientGroup
            label="Investors"
            icon={Building01Icon}
            tint="bg-sky-500/15 text-sky-600 dark:text-sky-400"
            people={
              investorRecipients.length > 0
                ? investorRecipients
                : DEFAULT_RECIPIENTS.filter((r) => r.type === "investor")
            }
          />
          <RecipientGroup
            label="Board"
            icon={UserGroup03Icon}
            tint="bg-rose-500/15 text-rose-600 dark:text-rose-400"
            people={
              boardRecipients.length > 0
                ? boardRecipients
                : DEFAULT_RECIPIENTS.filter((r) => r.type === "board")
            }
          />
          <RecipientGroup
            label="Advisors & mentors"
            icon={SparklesIcon}
            tint="bg-purple-500/15 text-purple-600 dark:text-purple-400"
            people={
              advisorRecipients.length > 0
                ? advisorRecipients
                : DEFAULT_RECIPIENTS.filter((r) => r.type === "advisor")
            }
          />
          <RecipientGroup
            label="Family & friends"
            icon={WhatsappBusinessIcon}
            tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            people={
              familyRecipients.length > 0
                ? familyRecipients
                : DEFAULT_RECIPIENTS.filter((r) => r.type === "family")
            }
          />
        </TabsContent>

        {/* TEMPLATES */}
        <TabsContent value="templates" className="mt-5 flex flex-col gap-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <HugeiconsIcon icon={RobotIcon} className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  AI is learning your founder voice
                </p>
                <p className="text-xs text-muted-foreground">
                  The more samples you save, the more on-brand each draft
                  becomes. Aim for 5+ examples per channel.
                </p>
              </div>
              <Button size="sm" variant="outline">
                <HugeiconsIcon icon={SparklesIcon} data-icon="inline-start" />
                Train new sample
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {TEMPLATES.map((t) => (
              <Card key={t.id} className="transition hover:border-foreground/20">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${t.tint}`}
                    >
                      <HugeiconsIcon icon={t.icon} className="size-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base">{t.title}</CardTitle>
                        <Badge variant="secondary" className="font-normal">
                          {t.samples} samples
                        </Badge>
                      </div>
                      <CardDescription className="mt-1 text-xs">
                        {t.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last edited {t.lastEdited}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ----------------- helpers ----------------- */

function SummaryTile({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: IconSvgElement
  label: string
  value: string
  sub: string
  tint: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className={`flex size-10 items-center justify-center rounded-lg ${tint}`}>
          <HugeiconsIcon icon={icon} className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="text-xl font-semibold tracking-tight">{value}</span>
          <span className="text-[11px] text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DraftSection({
  icon,
  title,
  description,
  tint,
  children,
}: {
  icon: IconSvgElement
  title: string
  description: string
  tint: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-muted">
          <HugeiconsIcon icon={icon} className={`size-4 ${tint}`} />
        </div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      {children}
    </section>
  )
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: "ready" | "draft" | "auto" | "sent"
}) {
  const tones: Record<typeof tone, string> = {
    ready: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    draft: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    auto: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    sent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  }
  return (
    <Badge variant="secondary" className={`border-0 text-[10px] font-medium ${tones[tone]}`}>
      {label}
    </Badge>
  )
}

function DraftCard({
  icon,
  title,
  description,
  meta,
  status,
  primaryLabel,
  secondaryLabel,
  tint,
}: {
  icon: IconSvgElement
  title: string
  description: string
  meta: string
  status: { label: string; tone: "ready" | "draft" | "auto" | "sent" }
  primaryLabel: string
  secondaryLabel?: string
  tint: string
}) {
  const isAuto = status.tone === "auto"
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className={`flex size-10 items-center justify-center rounded-lg ${tint}`}>
            <HugeiconsIcon icon={icon} className="size-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{title}</CardTitle>
              <StatusPill {...status} />
            </div>
            <CardDescription className="mt-1.5 text-xs leading-relaxed line-clamp-3">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">{meta}</span>
        <div className="flex items-center gap-1">
          {secondaryLabel ? (
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              {secondaryLabel}
            </Button>
          ) : null}
          <Button size="sm" disabled={isAuto} className="h-7 text-xs">
            {isAuto ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" />
            ) : null}
            {primaryLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SocialDraftCard({
  icon,
  title,
  body,
  imageUrl,
  meta,
  primaryLabel,
  tint,
}: {
  icon: IconSvgElement
  title: string
  body: string
  imageUrl: string
  meta: string
  primaryLabel: string
  tint: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className={`flex size-10 items-center justify-center rounded-lg ${tint}`}>
            <HugeiconsIcon icon={icon} className="size-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{title}</CardTitle>
              <StatusPill label="Draft ready" tone="ready" />
            </div>
            <CardDescription className="text-xs">
              Founder-voice draft with branded image.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed">{body}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="h-32 w-full rounded-md object-cover"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">{meta}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
              Edit
            </Button>
            <Button size="sm" className="h-7 text-xs">
              {primaryLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FilingRow({
  name,
  submittedAt,
}: {
  name: string
  submittedAt: string | null
}) {
  const filed = Boolean(submittedAt)
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`flex size-7 items-center justify-center rounded-md ${
            filed
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          <HugeiconsIcon
            icon={filed ? CheckmarkCircle02Icon : FileVerifiedIcon}
            className="size-4"
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-medium">{name}</span>
          <span className="text-[10px] text-muted-foreground">
            {filed ? `Filed ${timeAgo(submittedAt)}` : "Pre-filled, awaiting submit"}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="h-7 text-xs">
        {filed ? "View" : "Submit"}
      </Button>
    </div>
  )
}

function InvestorDraftCard({
  recipient,
  subject,
  preview,
}: {
  recipient: Recipient
  subject?: string
  preview: string
}) {
  const name = recipient.name ?? "Investor"
  const last = recipient.last_opened_at
  return (
    <Card className="transition hover:border-foreground/20">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="size-10">
            <AvatarImage src={recipient.avatar_url ?? dicebearAvatar(name)} alt="" />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">{name}</CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">
                {recipient.frequency ?? "monthly"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Last opened {last ? timeAgo(last) : "23d ago"} · {recipient.opens ?? 12}{" "}
              total opens
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border border-border/60 bg-muted/40 p-3">
          <p className="text-xs font-medium">
            {subject ?? "Quick October update — momentum & one ask"}
          </p>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {preview}
          </p>
        </div>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
            Edit
          </Button>
          <Button size="sm" className="h-7 text-xs">
            Approve & send
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecipientGroup({
  label,
  icon,
  tint,
  people,
}: {
  label: string
  icon: IconSvgElement
  tint: string
  people: Recipient[]
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex size-7 items-center justify-center rounded-md ${tint}`}>
              <HugeiconsIcon icon={icon} className="size-4" />
            </div>
            <CardTitle className="text-sm">{label}</CardTitle>
            <Badge variant="secondary" className="font-normal">
              {people.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <HugeiconsIcon icon={AddCircleIcon} data-icon="inline-start" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {people.length === 0 ? (
          <p className="px-6 py-6 text-center text-xs text-muted-foreground">
            No one in this list yet.
          </p>
        ) : (
          people.map((p, i) => (
            <div
              key={p.email ?? i}
              className="flex items-center gap-3 border-t border-border/40 px-6 py-3 first:border-t-0"
            >
              <Avatar className="size-9">
                <AvatarImage
                  src={p.avatar_url ?? dicebearAvatar(p.name ?? p.email ?? "x")}
                  alt=""
                />
                <AvatarFallback>{(p.name ?? "?").charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {p.email}
                </span>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {p.channel ?? "email"}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {p.frequency ?? "monthly"}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {p.visibility ?? "full"}
                </Badge>
              </div>
              <div className="hidden flex-col items-end text-[10px] text-muted-foreground md:flex">
                <span>{p.opens ?? 0} opens</span>
                <span>{p.replies ?? 0} replies</span>
              </div>
              <Button variant="ghost" size="icon" className="size-7">
                <HugeiconsIcon icon={Edit02Icon} className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
