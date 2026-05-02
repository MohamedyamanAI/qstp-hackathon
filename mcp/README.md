# Founder Reports MCP

Local MCP server that lets a founder list, fill, and submit pending KPI reports
from Claude Desktop or Claude Code.

Mirrors the logic in `app/founder/submit/actions.ts`.

## Tools

- `list_pending_reports` — pending + in-progress assignments for the founder.
- `get_report(assignment_id)` — questions + current draft answers + verified source per field. Creates a draft `kpi_submissions` row on first call.
- `save_draft(assignment_id, answers)` — merge partial answers into the draft. Coerces values by question type. Drops `verified_fields` entries for any value the founder changed.
- `submit_report(assignment_id, answers?)` — optional final merge + submit. Rejects with the list of missing required labels. Idempotent if already submitted.

## Required env

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — service-role key (the server scopes all queries to the founder identified below; service role is only used to bypass RLS for the lookup).
- `FOUNDER_EMAIL` (or `FOUNDER_ID`) — identifies which founder this MCP instance acts as.

## Run standalone

```bash
pnpm mcp:founder-reports
```

It speaks JSON-RPC over stdio. Useful for debugging only — Claude is the real client.

## Wire into Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qstp-founder-reports": {
      "command": "node",
      "args": [
        "/Users/o/Documents/CLIENTS/QSTP-HACKATHON/qstp-hackathon/mcp/founder-reports.mjs"
      ],
      "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "https://<project-ref>.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "<service-role-key>",
        "FOUNDER_EMAIL": "<founder-email-in-profiles-table>"
      }
    }
  }
}
```

Restart Claude Desktop. The tools appear in the connector menu.

Try:

- "What KPI reports do I have pending?"
- "Open the May report and show me what's still blank."
- "Submit it with ARR 120000, MRR 10000, runway months 14."

## Wire into Claude Code

```bash
claude mcp add qstp-founder-reports \
  node /Users/o/Documents/CLIENTS/QSTP-HACKATHON/qstp-hackathon/mcp/founder-reports.mjs \
  --env NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co \
  --env SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
  --env FOUNDER_EMAIL=<founder-email>
```

## Known gaps vs the web flow

These exist in `app/founder/submit/actions.ts` but are not in the MCP yet. Extract into a shared `lib/reports/founder-actions.ts` if you want parity.

- **Integration sync on open** — `syncConnectedIntegrationsForAssignment` pulls Stripe + Google snapshots when the founder opens an assignment.
- **AI prefill on open** — `applyReportPrefillToSubmission` runs deterministic prefill + Gemini extract from Gmail/Drive snapshots.
- **Team notification on submit** — `dispatchToUsers` notifies team members. The MCP skips this.

## Production path (not built)

This is a local stdio server using the service-role key — fine for a hackathon demo where the founder runs it on their own machine. To ship as a product:

1. Build a remote MCP at `app/api/mcp/route.ts` using `StreamableHTTPServerTransport`.
2. Add OAuth 2.1 + Dynamic Client Registration so Claude.ai can connect via "Add custom connector". Delegate the actual login to Supabase Auth.
3. Resolve the founder from the OAuth token instead of `FOUNDER_EMAIL` env, and use the user's Supabase JWT (not service role) so RLS does the scoping.
