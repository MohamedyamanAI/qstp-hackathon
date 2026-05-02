"use client"

import {
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Github01Icon,
  GoogleIcon,
  Linkedin01Icon,
  Mail01Icon,
  PieChartIcon,
  PlusSignIcon,
  SmartPhone01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useActionState } from "react"

import {
  type ActionState,
  addShareholder,
  removeShareholder,
  syncGoogleIntegration,
  syncStripeIntegration,
  updateCompliance,
  updateIntegrations,
  updatePreferences,
  updatePrivacy,
  updateProfile,
} from "@/app/founder/settings/actions"
import { PushSubscribeButton } from "@/components/notifications/push-subscribe-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type Shareholder = {
  name?: string
  ownership_percentage?: number
  nationality?: string | null
}

export type IntegrationStatus = {
  status: string
  last_synced_at: string | null
  last_sync_error: string | null
  external_account_id: string | null
  has_access_token: boolean
}

export type FounderSettingsData = {
  profile: {
    full_name: string
    email: string
    avatar_url: string | null
    language_preference: "en" | "ar"
    preferences: {
      theme?: string
      digest_frequency?: string
      quiet_hours?: boolean
      notifications?: { email?: boolean; push?: boolean; whatsapp?: boolean }
    }
  }
  startup: {
    id: string
    name: string
    sector: string
    stage: string
    cohort: string | null
    team_size: number | null
    extended_profile: {
      legal_name_en?: string
      legal_name_ar?: string
      cr_number?: string
      incorporation_date?: string
      registered_address?: string
      tax_regime?: string
      auditor_name?: string
      auditor_contact?: string
      active_grants?: string
      financial_year_end?: string
      cap_table?: Shareholder[]
    }
    connected_integrations: Record<string, boolean>
    integration_status?: {
      stripe?: IntegrationStatus | null
      google_workspace?: IntegrationStatus | null
    }
    privacy_settings: {
      cohort_benchmarking?: boolean
      public_wins?: boolean
      portfolio_visibility?: string
      mood_visibility?: string
    }
  } | null
}

const INTEGRATION_DEFS = [
  {
    key: "stripe",
    label: "Stripe",
    desc: "Revenue, MRR, customers — auto-pulled.",
    icon: CreditCardIcon,
    available: true,
  },
  {
    key: "google_workspace",
    label: "Google Workspace",
    desc: "Gmail volume + Drive activity for product updates.",
    icon: GoogleIcon,
    available: true,
  },
  {
    key: "github",
    label: "GitHub",
    desc: "Commit activity, releases, issue velocity.",
    icon: Github01Icon,
    available: false,
  },
  {
    key: "hubspot",
    label: "HubSpot",
    desc: "Pipeline, deals, customer count.",
    icon: PieChartIcon,
    available: false,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    desc: "Headcount, hires, departures.",
    icon: Linkedin01Icon,
    available: false,
  },
  {
    key: "google_analytics",
    label: "Google Analytics",
    desc: "Active users, conversion, sessions.",
    icon: GoogleIcon,
    available: false,
  },
] as const

function StatusBanner({ state }: { state: ActionState }) {
  if (!state) return null
  if (state.error) {
    return (
      <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
        {state.error}
      </p>
    )
  }
  if (state.ok) {
    return (
      <p className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
        Saved.
      </p>
    )
  }
  return null
}

export function FounderSettings({ data }: { data: FounderSettingsData }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList variant="line" className="h-auto flex-wrap justify-start">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="cap-table">Cap Table</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab data={data} />
      </TabsContent>
      <TabsContent value="integrations">
        <IntegrationsTab data={data} />
      </TabsContent>
      <TabsContent value="cap-table">
        <CapTableTab data={data} />
      </TabsContent>
      <TabsContent value="compliance">
        <ComplianceTab data={data} />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab data={data} />
      </TabsContent>
      <TabsContent value="privacy">
        <PrivacyTab data={data} />
      </TabsContent>
      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  )
}

function ProfileTab({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateProfile,
    undefined
  )
  const ext = data.startup?.extended_profile ?? {}

  return (
    <form action={action} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal</CardTitle>
          <CardDescription>How you appear across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 border-b border-border/60 pb-4">
          {data.profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.profile.avatar_url}
              alt=""
              className="size-16 rounded-full bg-muted ring-1 ring-border"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              {(data.profile.full_name || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-base font-medium">
              {data.profile.full_name || "Unnamed founder"}
            </div>
            <div className="text-xs text-muted-foreground">
              {data.profile.email}
            </div>
          </div>
        </CardContent>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field id="full_name" label="Full name" required>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={data.profile.full_name}
              required
            />
          </Field>
          <Field id="email" label="Email">
            <Input
              id="email"
              value={data.profile.email}
              disabled
              className="opacity-70"
            />
          </Field>
          <Field id="avatar_url" label="Avatar URL">
            <Input
              id="avatar_url"
              name="avatar_url"
              defaultValue={data.profile.avatar_url ?? ""}
              placeholder="https://…"
            />
          </Field>
          <Field id="language_preference" label="Language">
            <Select
              name="language_preference"
              defaultValue={data.profile.language_preference}
            >
              <SelectTrigger id="language_preference">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      {data.startup ? (
        <Card>
          <CardHeader>
            <CardTitle>Startup</CardTitle>
            <CardDescription>
              Legal identity and incorporation. Used for filings and reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field id="startup_name" label="Display name" required>
              <Input
                id="startup_name"
                name="startup_name"
                defaultValue={data.startup.name}
                required
              />
            </Field>
            <Field id="sector" label="Sector">
              <Input
                id="sector"
                name="sector"
                defaultValue={data.startup.sector}
              />
            </Field>
            <Field id="legal_name_en" label="Legal name (English)">
              <Input
                id="legal_name_en"
                name="legal_name_en"
                defaultValue={ext.legal_name_en ?? ""}
              />
            </Field>
            <Field id="legal_name_ar" label="Legal name (Arabic)">
              <Input
                id="legal_name_ar"
                name="legal_name_ar"
                defaultValue={ext.legal_name_ar ?? ""}
                dir="rtl"
              />
            </Field>
            <Field id="cr_number" label="CR / QFC #">
              <Input
                id="cr_number"
                name="cr_number"
                defaultValue={ext.cr_number ?? ""}
              />
            </Field>
            <Field id="incorporation_date" label="Incorporation date">
              <Input
                id="incorporation_date"
                name="incorporation_date"
                type="date"
                defaultValue={ext.incorporation_date ?? ""}
              />
            </Field>
            <Field id="team_size" label="Team size">
              <Input
                id="team_size"
                name="team_size"
                type="number"
                min={0}
                defaultValue={data.startup.team_size ?? ""}
              />
            </Field>
            <Field id="stage" label="Stage">
              <Input
                id="stage"
                value={data.startup.stage}
                disabled
                className="opacity-70"
              />
            </Field>
            <div className="md:col-span-2">
              <Field id="registered_address" label="Registered office address">
                <Input
                  id="registered_address"
                  name="registered_address"
                  defaultValue={ext.registered_address ?? ""}
                  placeholder="Street, city, postal code"
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <SubmitRow state={state} pending={pending} />
    </form>
  )
}

function IntegrationsTab({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateIntegrations,
    undefined
  )
  const connected = data.startup?.connected_integrations ?? {}
  const enabledCount = INTEGRATION_DEFS.filter((d) => connected[d.key]).length
  const stripe = data.startup?.integration_status?.stripe
  const stripeConnected =
    stripe?.status === "connected" && stripe.has_access_token
  const google = data.startup?.integration_status?.google_workspace
  const googleConnected =
    google?.status === "connected" && google.has_access_token

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Enable data sources for prefill. Provider connections are
                  managed below.
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {enabledCount} of {INTEGRATION_DEFS.length} enabled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {INTEGRATION_DEFS.map((def) => {
              const isOn = !!connected[def.key]
              const providerConnected =
                (def.key === "stripe" && stripeConnected) ||
                (def.key === "google_workspace" && googleConnected)
              return (
                <label
                  key={def.key}
                  htmlFor={`int_${def.key}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30 has-disabled:cursor-not-allowed has-disabled:opacity-60"
                >
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                    <HugeiconsIcon icon={def.icon} className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{def.label}</span>
                      {providerConnected ? (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          Connected
                        </Badge>
                      ) : isOn ? (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          Enabled
                        </Badge>
                      ) : null}
                      {!def.available ? (
                        <Badge variant="secondary" className="h-5 text-[10px]">
                          Coming soon
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{def.desc}</p>
                  </div>
                  <Switch
                    id={`int_${def.key}`}
                    name={`int_${def.key}`}
                    defaultChecked={isOn}
                    disabled={!def.available}
                  />
                </label>
              )
            })}
          </CardContent>
        </Card>
        <SubmitRow state={state} pending={pending} label="Save integrations" />
      </form>

      <StripeConnectionPanel data={data} />
      <GoogleConnectionPanel data={data} />
    </div>
  )
}

function StripeConnectionPanel({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    syncStripeIntegration,
    undefined
  )
  const stripe = data.startup?.integration_status?.stripe
  const connected = stripe?.status === "connected" && stripe.has_access_token
  const enabled = data.startup?.connected_integrations.stripe === true
  const lastSynced = stripe?.last_synced_at
    ? new Date(stripe.last_synced_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Stripe data sync</CardTitle>
            <CardDescription>
              Pull revenue, MRR, and customer metrics into report prefill.
            </CardDescription>
          </div>
          <Badge variant={connected ? "secondary" : "outline"}>
            {connected ? "Connected" : enabled ? "Enabled" : "Not connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {stripe?.external_account_id ? (
          <p className="text-xs text-muted-foreground">
            Account {stripe.external_account_id}
            {lastSynced ? ` · last synced ${lastSynced}` : ""}
          </p>
        ) : enabled ? (
          <p className="text-xs text-muted-foreground">
            Stripe prefill is enabled, but no OAuth account is connected yet.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Connect Stripe to auto-fill financial fields when opening a report.
          </p>
        )}
        {stripe?.last_sync_error ? (
          <p className="text-xs text-destructive">{stripe.last_sync_error}</p>
        ) : null}
        <StatusBanner state={state} />
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href="/api/integrations/stripe/connect">
              {connected ? "Reconnect Stripe" : "Connect Stripe"}
            </a>
          </Button>
          {connected ? (
            <form action={action}>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={pending}
              >
                {pending ? "Syncing…" : "Sync now"}
              </Button>
            </form>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function GoogleConnectionPanel({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    syncGoogleIntegration,
    undefined
  )
  const google = data.startup?.integration_status?.google_workspace
  const connected = google?.status === "connected" && google.has_access_token
  const enabled = data.startup?.connected_integrations.google_workspace === true
  const lastSynced = google?.last_synced_at
    ? new Date(google.last_synced_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Google Workspace data sync</CardTitle>
            <CardDescription>
              Pull Gmail volume and Drive activity into report prefill.
            </CardDescription>
          </div>
          <Badge variant={connected ? "secondary" : "outline"}>
            {connected ? "Connected" : enabled ? "Enabled" : "Not connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {google?.external_account_id ? (
          <p className="text-xs text-muted-foreground">
            Account {google.external_account_id}
            {lastSynced ? ` · last synced ${lastSynced}` : ""}
          </p>
        ) : enabled ? (
          <p className="text-xs text-muted-foreground">
            Google prefill is enabled, but no account is connected yet.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Connect Google to auto-fill product update and activity fields.
          </p>
        )}
        {google?.last_sync_error ? (
          <p className="text-xs text-destructive">{google.last_sync_error}</p>
        ) : null}
        <StatusBanner state={state} />
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href="/api/integrations/google/connect">
              {connected ? "Reconnect Google" : "Connect Google"}
            </a>
          </Button>
          {connected ? (
            <form action={action}>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={pending}
              >
                {pending ? "Syncing…" : "Sync now"}
              </Button>
            </form>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function CapTableTab({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addShareholder,
    undefined
  )
  const cap = data.startup?.extended_profile?.cap_table ?? []
  const total = cap.reduce(
    (sum, sh) => sum + (Number(sh.ownership_percentage) || 0),
    0
  )

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Cap table</CardTitle>
              <CardDescription>
                Used to auto-fill UBO reports and compliance filings.
              </CardDescription>
            </div>
            <Badge
              variant={total === 100 ? "secondary" : "outline"}
              className="tabular-nums"
            >
              {total.toFixed(2)}% allocated
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {cap.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
              No shareholders yet. Add the first one below.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {cap.map((sh, idx) => (
                <li
                  key={`${sh.name}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {(sh.name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{sh.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {sh.nationality || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums">
                      {Number(sh.ownership_percentage).toFixed(2)}%
                    </span>
                    <form action={removeShareholder}>
                      <input type="hidden" name="idx" value={idx} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground"
                      >
                        Remove
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add shareholder</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <Field id="sh_name" label="Name" required>
                <Input id="sh_name" name="name" required />
              </Field>
            </div>
            <div className="md:col-span-3">
              <Field id="sh_pct" label="Ownership %" required>
                <Input
                  id="sh_pct"
                  name="ownership_percentage"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  required
                />
              </Field>
            </div>
            <div className="md:col-span-3">
              <Field id="sh_nat" label="Nationality">
                <Input id="sh_nat" name="nationality" />
              </Field>
            </div>
            <div className="flex items-end md:col-span-1">
              <Button type="submit" disabled={pending} className="w-full">
                <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                Add
              </Button>
            </div>
            {state?.error ? (
              <p className="text-xs text-destructive md:col-span-12">
                {state.error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ComplianceTab({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateCompliance,
    undefined
  )
  const ext = data.startup?.extended_profile ?? {}

  return (
    <form action={action} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance profile</CardTitle>
          <CardDescription>
            Powers tax filings, audit packs, and grant applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field id="tax_regime" label="Tax regime">
            <Select name="tax_regime" defaultValue={ext.tax_regime ?? "QFC"}>
              <SelectTrigger id="tax_regime">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QFC">QFC</SelectItem>
                <SelectItem value="Mainland">Mainland</SelectItem>
                <SelectItem value="Free Zone">Free Zone</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="financial_year_end" label="Financial year end">
            <Input
              id="financial_year_end"
              name="financial_year_end"
              type="date"
              defaultValue={ext.financial_year_end ?? ""}
            />
          </Field>
          <Field id="auditor_name" label="Auditor">
            <Input
              id="auditor_name"
              name="auditor_name"
              defaultValue={ext.auditor_name ?? ""}
              placeholder="e.g. KPMG Qatar"
            />
          </Field>
          <Field id="auditor_contact" label="Auditor contact">
            <Input
              id="auditor_contact"
              name="auditor_contact"
              defaultValue={ext.auditor_contact ?? ""}
              placeholder="email@auditor.com"
            />
          </Field>
          <div className="md:col-span-2">
            <Field id="active_grants" label="Active grants & incentives">
              <Input
                id="active_grants"
                name="active_grants"
                defaultValue={ext.active_grants ?? ""}
                placeholder="QDB R&D grant, Invest Qatar incentive…"
              />
            </Field>
          </div>
        </CardContent>
      </Card>
      <SubmitRow state={state} pending={pending} />
    </form>
  )
}

function NotificationsTab({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updatePreferences,
    undefined
  )
  const prefs = data.profile.preferences ?? {}
  const notifs = prefs.notifications ?? {}

  return (
    <form action={action} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>Where we reach you for updates.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <ChannelRow
            id="notif_email"
            label="Email"
            desc="Daily digest, mentions, action items."
            icon={Mail01Icon}
            defaultOn={notifs.email !== false}
          />
          <Separator />
          <ChannelRow
            id="notif_push"
            label="Push"
            desc="Real-time alerts on your devices."
            icon={SmartPhone01Icon}
            defaultOn={notifs.push !== false}
          />
          <div className="ms-12 -mt-1 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Browser permission:
            </span>
            <PushSubscribeButton />
          </div>
          <Separator />
          <ChannelRow
            id="notif_whatsapp"
            label="WhatsApp"
            desc="High-signal messages only."
            icon={WhatsappIcon}
            defaultOn={!!notifs.whatsapp}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cadence & quiet hours</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field id="digest_frequency" label="Digest frequency">
            <Select
              name="digest_frequency"
              defaultValue={prefs.digest_frequency ?? "weekly"}
            >
              <SelectTrigger id="digest_frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="theme" label="Theme">
            <Select name="theme" defaultValue={prefs.theme ?? "system"}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2.5 md:col-span-2">
            <div>
              <div className="text-sm font-medium">Quiet hours</div>
              <p className="text-xs text-muted-foreground">
                Pause non-critical alerts 10pm–7am, weekends off.
              </p>
            </div>
            <Switch
              id="quiet_hours"
              name="quiet_hours"
              defaultChecked={!!prefs.quiet_hours}
            />
          </div>
        </CardContent>
      </Card>
      <SubmitRow state={state} pending={pending} />
    </form>
  )
}

function ChannelRow({
  id,
  label,
  desc,
  icon,
  defaultOn,
}: {
  id: string
  label: string
  desc: string
  icon: typeof Mail01Icon
  defaultOn: boolean
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2"
    >
      <div className="flex size-9 items-center justify-center rounded-md bg-muted">
        <HugeiconsIcon icon={icon} className="size-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch id={id} name={id} defaultChecked={defaultOn} />
    </label>
  )
}

function PrivacyTab({ data }: { data: FounderSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updatePrivacy,
    undefined
  )
  const ps = data.startup?.privacy_settings ?? {}

  return (
    <form action={action} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy & sharing</CardTitle>
          <CardDescription>
            Decide what the rest of the portfolio and the public can see.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <ToggleRow
            id="cohort_benchmarking"
            label="Cohort benchmarking"
            desc="Include anonymized metrics in peer comparisons."
            defaultOn={ps.cohort_benchmarking !== false}
          />
          <Separator />
          <ToggleRow
            id="public_wins"
            label="Public wins"
            desc="Allow the QSTP comms team to draft LinkedIn posts about your milestones."
            defaultOn={!!ps.public_wins}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field id="portfolio_visibility" label="Portfolio profile">
            <Select
              name="portfolio_visibility"
              defaultValue={ps.portfolio_visibility ?? "team_only"}
            >
              <SelectTrigger id="portfolio_visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="team_only">Team only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="mood_visibility" label="Mood data">
            <Select
              name="mood_visibility"
              defaultValue={ps.mood_visibility ?? "private"}
            >
              <SelectTrigger id="mood_visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">Visible to team</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>
      <SubmitRow state={state} pending={pending} />
    </form>
  )
}

function ToggleRow({
  id,
  label,
  desc,
  defaultOn,
}: {
  id: string
  label: string
  desc: string
  defaultOn: boolean
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-3 rounded-md px-1 py-2"
    >
      <div>
        <div className="text-sm font-medium">{label}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch id={id} name={id} defaultChecked={defaultOn} />
    </label>
  )
}

function SecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Use a unique password you don&apos;t reuse anywhere else.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/auth/forgot-password">Send password reset email</a>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Add a second step at sign-in. Coming soon — managed by your QSTP
            workspace admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Not enabled</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            You&apos;re signed in on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Use the sign-out button in the sidebar to end this session.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs">
        <span>{label}</span>
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

function SubmitRow({
  state,
  pending,
  label = "Save changes",
}: {
  state: ActionState
  pending: boolean
  label?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <StatusBanner state={state} />
      <Button type="submit" disabled={pending} className="ml-auto">
        {pending ? "Saving…" : label}
      </Button>
    </div>
  )
}
