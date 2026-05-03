import type { SupabaseClient } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Database, Json } from "@/lib/supabase/database.types"

type AdminClient = SupabaseClient<Database>
type JsonObject = Record<string, Json | undefined>

const GOOGLE_PROVIDER = "google_workspace"
const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/presentations",
]

type GoogleTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
  id_token?: string
  error?: string
  error_description?: string
}

type GoogleUserInfo = {
  sub?: string
  email?: string
  name?: string
  hd?: string
}

type DriveFile = {
  id: string
  name: string
  mimeType: string
  createdTime: string
  modifiedTime?: string
  owners?: { emailAddress?: string; displayName?: string }[]
}

type GmailMessageRef = { id: string; threadId: string }

type GmailMessageMeta = {
  id: string
  threadId: string
  subject: string
  from: string
  date: string
  snippet: string
}

const GMAIL_METADATA_LIMIT = 40
const DRIVE_TITLE_LIMIT = 30

export function googleEnv() {
  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
    stateSecret:
      process.env.GOOGLE_OAUTH_STATE_SECRET ??
      process.env.GOOGLE_OAUTH_CLIENT_SECRET ??
      "",
    scopes: SCOPES,
  }
}

export function googleAuthUrl({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string
  redirectUri: string
  state: string
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", SCOPES.join(" "))
  url.searchParams.set("access_type", "offline")
  url.searchParams.set("include_granted_scopes", "true")
  url.searchParams.set("prompt", "consent")
  url.searchParams.set("state", state)
  return url
}

export async function exchangeGoogleOAuthCode({
  code,
  redirectUri,
}: {
  code: string
  redirectUri: string
}) {
  const { clientId, clientSecret } = googleEnv()
  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials.")
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  })
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  const json = (await res.json()) as GoogleTokenResponse
  if (!res.ok || json.error) {
    throw new Error(
      json.error_description ?? json.error ?? "Google OAuth failed."
    )
  }
  if (!json.access_token) {
    throw new Error("Google OAuth response was missing access_token.")
  }
  return json
}

async function refreshGoogleAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = googleEnv()
  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials.")
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  })
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  const json = (await res.json()) as GoogleTokenResponse
  if (!res.ok || json.error) {
    throw new Error(
      json.error_description ?? json.error ?? "Google token refresh failed."
    )
  }
  if (!json.access_token) {
    throw new Error("Google refresh response missing access_token.")
  }
  return json
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return {}
  return (await res.json()) as GoogleUserInfo
}

export async function upsertGoogleConnection({
  startupId,
  token,
  profile,
}: {
  startupId: string
  token: GoogleTokenResponse
  profile: GoogleUserInfo
}) {
  const admin = createAdminClient()
  const scopes = token.scope?.split(/\s+/).filter(Boolean) ?? SCOPES
  const expiresAt =
    typeof token.expires_in === "number"
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null

  const { error } = await admin
    .from("startup_integration_connections")
    .upsert(
      {
        startup_id: startupId,
        provider: GOOGLE_PROVIDER,
        status: "connected",
        access_token: token.access_token ?? null,
        refresh_token: token.refresh_token ?? null,
        external_account_id: profile.sub ?? profile.email ?? null,
        livemode: true,
        scopes,
        token_expires_at: expiresAt,
        last_sync_error: null,
        metadata: {
          token_type: token.token_type ?? "Bearer",
          email: profile.email ?? null,
          name: profile.name ?? null,
          hd: profile.hd ?? null,
        },
      },
      { onConflict: "startup_id,provider" }
    )
  if (error) throw new Error(error.message)

  await updateStartupIntegrationFlag(admin, startupId, "google_workspace", true)
  await updateStartupIntegrationFlag(admin, startupId, "google_drive", true)
}

async function ensureFreshAccessToken(admin: AdminClient, connectionId: string) {
  const { data: connection, error } = await admin
    .from("startup_integration_connections")
    .select("access_token, refresh_token, token_expires_at")
    .eq("id", connectionId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!connection || !connection.access_token) {
    throw new Error("Google connection is missing tokens.")
  }

  const expiresAt = connection.token_expires_at
    ? Date.parse(connection.token_expires_at)
    : 0
  const needsRefresh =
    !expiresAt || expiresAt - Date.now() < 60 * 1000

  if (!needsRefresh) return connection.access_token
  if (!connection.refresh_token) return connection.access_token

  const refreshed = await refreshGoogleAccessToken(connection.refresh_token)
  const expiresIn = refreshed.expires_in ?? 3600
  const nextExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  await admin
    .from("startup_integration_connections")
    .update({
      access_token: refreshed.access_token,
      token_expires_at: nextExpiresAt,
    })
    .eq("id", connectionId)

  return refreshed.access_token as string
}

export async function fetchGoogleProfile(accessToken: string) {
  return fetchGoogleUserInfo(accessToken)
}

export async function getGoogleAccessTokenForStartup(
  startupId: string
): Promise<{ ok: true; accessToken: string } | { ok: false; reason: string }> {
  const admin = createAdminClient()
  const { data: connection, error } = await admin
    .from("startup_integration_connections")
    .select("id, status, access_token, scopes")
    .eq("startup_id", startupId)
    .eq("provider", GOOGLE_PROVIDER)
    .maybeSingle()
  if (error) return { ok: false, reason: error.message }
  if (!connection || connection.status !== "connected" || !connection.access_token) {
    return { ok: false, reason: "google_not_connected" }
  }
  const scopes = Array.isArray(connection.scopes) ? connection.scopes : []
  if (!scopes.includes("https://www.googleapis.com/auth/presentations")) {
    return { ok: false, reason: "needs_reauth" }
  }
  try {
    const accessToken = await ensureFreshAccessToken(admin, connection.id)
    return { ok: true, accessToken }
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "token_refresh_failed" }
  }
}

export async function syncGoogleForStartup({
  startupId,
  periodStart,
  periodEnd,
}: {
  startupId: string
  periodStart: string
  periodEnd: string
}) {
  const admin = createAdminClient()
  const { data: connection, error: connectionError } = await admin
    .from("startup_integration_connections")
    .select("id, status, access_token, refresh_token, metadata")
    .eq("startup_id", startupId)
    .eq("provider", GOOGLE_PROVIDER)
    .maybeSingle()

  if (connectionError) throw new Error(connectionError.message)
  if (
    !connection ||
    connection.status !== "connected" ||
    !connection.access_token
  ) {
    return { ok: false as const, error: "Google Workspace is not connected." }
  }

  try {
    const accessToken = await ensureFreshAccessToken(admin, connection.id)
    const [driveSnapshot, gmailSnapshot] = await Promise.all([
      fetchDriveSnapshot({ accessToken, periodStart, periodEnd }),
      fetchGmailSnapshot({ accessToken, periodStart, periodEnd }),
    ])

    const { data: startup, error: startupError } = await admin
      .from("startups")
      .select("extended_profile")
      .eq("id", startupId)
      .maybeSingle()
    if (startupError) throw new Error(startupError.message)

    const extended = asObject(startup?.extended_profile)
    const integrationSnapshots = asObject(extended.integration_snapshots)
    integrationSnapshots.google_drive = driveSnapshot as unknown as Json
    integrationSnapshots.google_workspace = gmailSnapshot as unknown as Json
    extended.integration_snapshots = integrationSnapshots

    const { error: updateError } = await admin
      .from("startups")
      .update({ extended_profile: extended as unknown as Json })
      .eq("id", startupId)
    if (updateError) throw new Error(updateError.message)

    await admin
      .from("startup_integration_connections")
      .update({ last_synced_at: new Date().toISOString(), last_sync_error: null })
      .eq("id", connection.id)

    return {
      ok: true as const,
      drive: driveSnapshot,
      gmail: gmailSnapshot,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google sync failed."
    await admin
      .from("startup_integration_connections")
      .update({ status: "error", last_sync_error: message })
      .eq("id", connection.id)
    throw error
  }
}

async function fetchDriveSnapshot({
  accessToken,
  periodStart,
  periodEnd,
}: {
  accessToken: string
  periodStart: string
  periodEnd: string
}) {
  const startIso = `${periodStart}T00:00:00`
  const endIso = `${periodEnd}T23:59:59`

  const created = await listDriveFiles({
    accessToken,
    q: `createdTime >= '${startIso}' and createdTime <= '${endIso}' and trashed = false`,
  })
  const modified = await listDriveFiles({
    accessToken,
    q: `modifiedTime >= '${startIso}' and modifiedTime <= '${endIso}' and trashed = false`,
  })

  const docTypes = new Map<string, number>()
  for (const file of created) {
    const key = simplifyMime(file.mimeType)
    docTypes.set(key, (docTypes.get(key) ?? 0) + 1)
  }

  const recent = created
    .slice(0, 5)
    .map((file) => ({ name: file.name, mime: simplifyMime(file.mimeType) }))
  const headline = recent[0]?.name ?? null

  const titlePool = [...created, ...modified].slice(0, DRIVE_TITLE_LIMIT)
  const titles = titlePool.map((file) => ({
    name: file.name,
    mime: simplifyMime(file.mimeType),
    created_at: file.createdTime,
    modified_at: file.modifiedTime ?? file.createdTime,
  }))

  return {
    files_created: created.length,
    product_updates: created.length,
    docs_created: created.length,
    files_modified: modified.length,
    biggest_win: headline,
    recent_files: recent,
    titles,
    by_type: Object.fromEntries(docTypes),
    period_start: periodStart,
    period_end: periodEnd,
    synced_at: new Date().toISOString(),
  }
}

async function listDriveFiles({
  accessToken,
  q,
}: {
  accessToken: string
  q: string
}): Promise<DriveFile[]> {
  const out: DriveFile[] = []
  let pageToken: string | undefined

  for (let page = 0; page < 5; page++) {
    const search = new URLSearchParams({
      q,
      pageSize: "100",
      orderBy: "createdTime desc",
      fields:
        "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,owners(emailAddress,displayName))",
    })
    if (pageToken) search.set("pageToken", pageToken)
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${search}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const json = (await res.json()) as {
      files?: DriveFile[]
      nextPageToken?: string
      error?: { message?: string }
    }
    if (!res.ok) {
      throw new Error(json.error?.message ?? "Google Drive request failed.")
    }
    out.push(...(json.files ?? []))
    if (!json.nextPageToken) break
    pageToken = json.nextPageToken
  }

  return out
}

async function fetchGmailSnapshot({
  accessToken,
  periodStart,
  periodEnd,
}: {
  accessToken: string
  periodStart: string
  periodEnd: string
}) {
  const after = periodStart.replace(/-/g, "/")
  const end = new Date(`${periodEnd}T00:00:00Z`)
  end.setUTCDate(end.getUTCDate() + 1)
  const before = end.toISOString().slice(0, 10).replace(/-/g, "/")

  const sent = await listGmailMessages({
    accessToken,
    q: `in:sent after:${after} before:${before}`,
  })
  const received = await listGmailMessages({
    accessToken,
    q: `in:inbox after:${after} before:${before}`,
  })

  const sentThreads = new Set(sent.map((m) => m.threadId)).size
  const receivedThreads = new Set(received.map((m) => m.threadId)).size

  const metadataPool = [
    ...sent.slice(0, Math.ceil(GMAIL_METADATA_LIMIT / 2)),
    ...received.slice(0, Math.ceil(GMAIL_METADATA_LIMIT / 2)),
  ].slice(0, GMAIL_METADATA_LIMIT)
  const messages = await fetchGmailMetadata({
    accessToken,
    refs: metadataPool,
  })

  return {
    emails_sent: sent.length,
    emails_received: received.length,
    sent_threads: sentThreads,
    received_threads: receivedThreads,
    active_users: 1,
    messages,
    period_start: periodStart,
    period_end: periodEnd,
    synced_at: new Date().toISOString(),
  }
}

async function fetchGmailMetadata({
  accessToken,
  refs,
}: {
  accessToken: string
  refs: GmailMessageRef[]
}): Promise<GmailMessageMeta[]> {
  const fields = "id,threadId,snippet,payload(headers)"
  const settled = await Promise.allSettled(
    refs.map(async (ref) => {
      const url = new URL(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(ref.id)}`
      )
      url.searchParams.set("format", "metadata")
      url.searchParams.append("metadataHeaders", "Subject")
      url.searchParams.append("metadataHeaders", "From")
      url.searchParams.append("metadataHeaders", "Date")
      url.searchParams.set("fields", fields)
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) return null
      const json = (await res.json()) as {
        id?: string
        threadId?: string
        snippet?: string
        payload?: { headers?: { name?: string; value?: string }[] }
      }
      const headers = json.payload?.headers ?? []
      const headerValue = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value ?? ""
      return {
        id: json.id ?? ref.id,
        threadId: json.threadId ?? ref.threadId,
        subject: headerValue("Subject"),
        from: headerValue("From"),
        date: headerValue("Date"),
        snippet: typeof json.snippet === "string" ? json.snippet : "",
      } satisfies GmailMessageMeta
    })
  )
  return settled
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((m): m is GmailMessageMeta => m !== null)
}

async function listGmailMessages({
  accessToken,
  q,
}: {
  accessToken: string
  q: string
}): Promise<GmailMessageRef[]> {
  const out: GmailMessageRef[] = []
  let pageToken: string | undefined

  for (let page = 0; page < 5; page++) {
    const search = new URLSearchParams({ q, maxResults: "200" })
    if (pageToken) search.set("pageToken", pageToken)
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${search}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const json = (await res.json()) as {
      messages?: GmailMessageRef[]
      nextPageToken?: string
      resultSizeEstimate?: number
      error?: { message?: string }
    }
    if (!res.ok) {
      throw new Error(json.error?.message ?? "Gmail request failed.")
    }
    out.push(...(json.messages ?? []))
    if (!json.nextPageToken) break
    pageToken = json.nextPageToken
  }

  return out
}

async function updateStartupIntegrationFlag(
  admin: AdminClient,
  startupId: string,
  provider: string,
  connected: boolean
) {
  const { data: startup, error } = await admin
    .from("startups")
    .select("connected_integrations")
    .eq("id", startupId)
    .maybeSingle()
  if (error) throw new Error(error.message)

  const integrations = asObject(startup?.connected_integrations)
  integrations[provider] = connected

  const { error: updateError } = await admin
    .from("startups")
    .update({ connected_integrations: integrations as unknown as Json })
    .eq("id", startupId)
  if (updateError) throw new Error(updateError.message)
}

function asObject(value: Json | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject
  }
  return {}
}

function simplifyMime(mime: string): string {
  if (mime === "application/vnd.google-apps.document") return "doc"
  if (mime === "application/vnd.google-apps.spreadsheet") return "sheet"
  if (mime === "application/vnd.google-apps.presentation") return "slide"
  if (mime === "application/vnd.google-apps.folder") return "folder"
  if (mime === "application/pdf") return "pdf"
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  return mime.split("/").pop() ?? mime
}
