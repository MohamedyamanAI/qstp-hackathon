type StripeStatePayload = {
  provider: "stripe"
  startupId: string
  userId: string
  nonce: string
  issuedAt: number
}

export async function createStripeOAuthState({
  startupId,
  userId,
  secret,
}: {
  startupId: string
  userId: string
  secret: string
}) {
  if (!secret) throw new Error("Missing OAuth state secret.")

  const payload: StripeStatePayload = {
    provider: "stripe",
    startupId,
    userId,
    nonce: crypto.randomUUID(),
    issuedAt: Date.now(),
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = await sign(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export async function verifyStripeOAuthState({
  state,
  secret,
  maxAgeMs = 10 * 60 * 1000,
}: {
  state: string
  secret: string
  maxAgeMs?: number
}) {
  if (!secret) throw new Error("Missing OAuth state secret.")

  const [encodedPayload, signature] = state.split(".")
  if (!encodedPayload || !signature) return null

  const expected = await sign(encodedPayload, secret)
  if (!timingSafeEqual(signature, expected)) return null

  const payload = JSON.parse(
    base64UrlDecode(encodedPayload)
  ) as StripeStatePayload
  if (payload.provider !== "stripe") return null
  if (Date.now() - payload.issuedAt > maxAgeMs) return null

  return payload
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  )
  return base64UrlEncodeBytes(new Uint8Array(signature))
}

function base64UrlEncode(value: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(value))
}

function base64UrlDecode(value: string): string {
  const padded = value.padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "="
  )
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"))
  return new TextDecoder().decode(
    Uint8Array.from(binary, (c) => c.charCodeAt(0))
  )
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
