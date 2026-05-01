#!/usr/bin/env node
/**
 * Sync supabase/templates/*.html to a hosted Supabase project's
 * auth email templates via the Management API.
 *
 * Source of truth: supabase/config.toml [auth.email.template.*] blocks.
 * The script reads the same subjects + content_paths used for local dev,
 * so prod and local stay in lockstep.
 *
 * Usage:
 *   SUPABASE_PROJECT_REF=abcd1234 \
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx \
 *   node scripts/sync-email-templates.mjs [--dry-run]
 *
 * Get a personal access token: https://supabase.com/dashboard/account/tokens
 * Find your project ref:        https://supabase.com/dashboard/project/_/settings/general
 */

import { readFile } from "node:fs/promises"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CONFIG_PATH = resolve(ROOT, "supabase/config.toml")
const DRY_RUN = process.argv.includes("--dry-run")

// Maps the [auth.email.template.<key>] section in config.toml to the
// Management API field names on PATCH /v1/projects/{ref}/config/auth.
const FIELD_MAP = {
  confirmation: {
    subject: "mailer_subjects_confirmation",
    content: "mailer_templates_confirmation_content",
  },
  recovery: {
    subject: "mailer_subjects_recovery",
    content: "mailer_templates_recovery_content",
  },
  magic_link: {
    subject: "mailer_subjects_magic_link",
    content: "mailer_templates_magic_link_content",
  },
  invite: {
    subject: "mailer_subjects_invite",
    content: "mailer_templates_invite_content",
  },
  email_change: {
    subject: "mailer_subjects_email_change",
    content: "mailer_templates_email_change_content",
  },
}

function parseTemplateBlocks(toml) {
  // Match [auth.email.template.<key>] ... up to the next [section] or EOF.
  const blockRe =
    /^\[auth\.email\.template\.([a-z_]+)\]\s*\n([\s\S]*?)(?=^\[|\Z)/gm
  const out = {}
  for (const m of toml.matchAll(blockRe)) {
    const key = m[1]
    const body = m[2]
    const subject = body.match(/^\s*subject\s*=\s*"([^"]*)"/m)?.[1]
    const contentPath = body.match(/^\s*content_path\s*=\s*"([^"]*)"/m)?.[1]
    if (subject && contentPath) {
      out[key] = { subject, contentPath }
    }
  }
  return out
}

async function main() {
  const ref = process.env.SUPABASE_PROJECT_REF
  const token = process.env.SUPABASE_ACCESS_TOKEN

  if (!DRY_RUN && (!ref || !token)) {
    console.error(
      "Missing SUPABASE_PROJECT_REF or SUPABASE_ACCESS_TOKEN. " +
        "Run with --dry-run to preview without sending."
    )
    process.exit(1)
  }

  const toml = await readFile(CONFIG_PATH, "utf8")
  const blocks = parseTemplateBlocks(toml)
  const keys = Object.keys(blocks)

  if (keys.length === 0) {
    console.error("No [auth.email.template.*] blocks found in config.toml")
    process.exit(1)
  }

  const body = {}
  for (const key of keys) {
    const fields = FIELD_MAP[key]
    if (!fields) {
      console.warn(`Skipping unknown template '${key}' — not in FIELD_MAP`)
      continue
    }
    const { subject, contentPath } = blocks[key]
    const html = await readFile(resolve(ROOT, contentPath), "utf8")
    body[fields.subject] = subject
    body[fields.content] = html
    console.log(
      `  ${key.padEnd(14)} ${subject.padEnd(30)} ${contentPath} (${html.length} bytes)`
    )
  }

  if (DRY_RUN) {
    console.log("\nDry run — would PATCH the following fields:")
    console.log(Object.keys(body).sort().join("\n"))
    return
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error(`\nManagement API error ${res.status}: ${text}`)
    process.exit(1)
  }

  console.log(`\nSynced ${keys.length} template(s) to project ${ref}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
