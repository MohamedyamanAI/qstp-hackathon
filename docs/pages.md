# Pages — Implementation Spec

Per-page checklist of what to build. Routes already scaffolded in
`app/founder/*` and `app/team/*`. Sidebars in `components/founder/` and
`components/team/`.

## Build priority for the demo

1. Founder **Submit** — the magic moment
2. Founder **Home** — active feed (proves the loop)
3. Founder **Distribute** — proof of one-input-many-outputs
4. Team **Today** — worklist + inline feedback
5. Founder **Opportunities** — Unfair Advantage Finder
6. Team **Portfolio** — filterable grid
7. Founder **Metrics** + Investor-Ready Mode
8. Founder **Rewards** — points wallet animation

Tier 3 (mock with screenshots in slides if time-pressed): Team Health, Insights,
Reports; both Settings pages.

---

## Cross-cutting (every authenticated page)

**Top bar**
- Logo → role home (`/founder/home` or `/team/today`)
- Global search (startups, submissions, opportunities, wins)
- Notifications bell + unread badge
- AI assistant icon (opens role-aware chat sidebar)
- User avatar menu (profile, settings, sign out)

**Notifications panel** (slides out from bell)
- Unified inbox with filters: All / Mentions / Feedback / System
- Per item: source, time, snippet, [Mark read] [Open]
- Backed by `public.notifications`

**AI assistant** (floating sidebar, role-aware)
- Founder prompts: "How am I doing this month?", "Draft me an investor update",
  "Show me grants I qualify for"
- Team prompts: "Which startups are at risk?", "Generate a board summary",
  "Draft outreach to Acme Co."

---

# FOUNDER

## `/founder/home` — Active Feed

Reinforces the Passive → Active shift on every login.

**Status strip**
- Greeting (founder name, current month)
- Submission status: "Next submission due in N days" + streak (🔥 N-month)
- Tier progress: "Catalyst — 340 points to Trailblazer"
- Quick actions: [Submit Now] [Share Investor Link]

**Main feed** (chronological, mixed content types)
- Team feedback card with [Reply]
- Opportunity card with [View Match]
- Distribution outcome card ("Opened by 9 of 12 investors") with [See replies]
- Mention card ("3 mentors viewed your last submission")
- System card (points earned, tier change) — confetti
- Win-amplified card ("QSTP published your announcement — 1.2K impressions")

**Right rail (desktop) / bottom (mobile)**
- This month at a glance: revenue trend, headcount delta, runway
- Health Score with sparkline
- Optional mood prompt (single emoji + 1 line)

**Data**
- `kpi_submissions` (last submitted), `submission_feedback`, `opportunities`,
  `notifications`, `startups.health_score`, `startups.points_balance`,
  `startups.tier`

---

## `/founder/submit` — Unified Monthly Submission

Goal: 90 seconds to done.

**Pre-submission state**
- Big CTA: "Submit October Report" with deadline countdown
- "What we already know" preview: Stripe revenue, GitHub commits, LinkedIn
  team count — pre-filled from connected integrations with verified-data badges
- Submission options: [Standard form] [Voice mode] [Submit via AI assistant]

**During submission** (swipeable card sequence, each with progress bar, [Skip],
[Save & Continue], voice icon, photo upload icon)
1. Financials — revenue, MRR, burn, runway (Stripe pre-fill)
2. Team — headcount, hires, departures (LinkedIn pre-fill)
3. Product — active users, key product metric (Analytics pre-fill)
4. Pipeline — customers, deals closed, partnerships (HubSpot pre-fill)
5. Wins & milestones — free-text or voice
6. Goals for next month — forward commitments
7. Optional mood check — emoji + 1 line

**Confirmation screen — the magic moment**
- "Here's what's about to happen" preview:
  - ✓ Investor email drafted for N recipients (preview thumbnail)
  - ✓ Board deck updated (preview thumbnail)
  - ✓ Pitch deck traction slide refreshed
  - ✓ QFC Filing Pack updated
  - ✓ Internal team Slack post drafted
  - ✓ LinkedIn post drafted (awaiting approval)
  - ✓ QSTP submission filed
- [Approve All] [Review Each]
- Points-earned animation

**Data**
- Writes to `kpi_submissions` (status `draft` → `submitted`)
- `metrics` JSONB stores answers; `verified_fields` JSONB tracks pre-filled
  vs manual; `generated_outputs` JSONB stores drafted distributions

---

## `/founder/distribute` — Outputs Control Center

Tabs: **Active** | **Sent** | **Recipients** | **Templates**

**Active** (default)
Drafts awaiting approval, grouped by destination:
- Investor Updates (per-investor cards: name, last sent, draft preview,
  [Approve & Send] [Edit])
- Board Deck — preview of changed slides, [Push to Google Slides]
- Pitch Deck — traction slide preview, [Update Working Deck]
- Government Filings (e.g., QFC Filing Pack) — [Download] [Mark as Submitted]
- Social/Public — LinkedIn preview with image, [Approve & Post] [Edit]
- Internal/Team — Slack draft, [Send to #team]
- Family/Advisors — plain-language draft, [Send via Email/WhatsApp]

**Sent**
- Historical archive, searchable, with engagement metrics (opens, replies,
  reactions)

**Recipients**
- All distribution targets (investors, board, advisors, family)
- Per recipient: name, channel preference (email/WhatsApp), format preference,
  frequency, granular visibility toggles, open/reply history
- [Add Recipient]

**Templates**
- Investor email template editor (founder voice training)
- Board deck slide template
- LinkedIn post style preferences
- AI voice samples to refine

**Data**
- `kpi_submissions.generated_outputs`, `templates`, `startups.recipients`

---

## `/founder/opportunities` — Unfair Advantage Finder

**Top filter bar**
- Tabs: All | Grants & Competitions | Investors | Customers | Talent |
  Resources | Insights

**Headline card** (most urgent / highest-fit, expanded)
- Title, source, fit score, deadline
- Why it matches (3 bullet points)
- [Make it Happen] (pre-filled application) | [Save for Later] | [Dismiss]

**Grid of opportunity cards** below
Each card: category icon + label, title, source, fit score / urgency badge,
one-line description, deadline if applicable, primary action button.
Examples:
- Grant: "MoCI Innovation Grant — up to QAR 500,000 — deadline in 12 days"
- Investor: "Doha Tech Angels actively investing in your sector — warm intro
  via QSTP"
- Customer: "Acme Co. (also QSTP) needs your exact infrastructure — intro"
- Talent: "3 QSTP startups hiring full-stack engineers — share candidate?"
- Resource: "AWS Activate $100K credits — you qualify"
- Insight: "Founders at your stage who hit 50K MRR took these 3 actions next"

**Right rail — Saved & Applied**
- Saved opportunities
- Applications in progress (Drafted / Submitted / Pending / Won / Lost)
- "What I've earned" — total grants won, intros made, deals closed

**Data**
- `opportunities` (filter `startup_id IS NULL` for global, `= startup.id` for
  matched). `status` enum drives pipeline state.

---

## `/founder/metrics` — Startup Command Center

**Summary cards row** (4-5)
- Revenue (current + MoM trend)
- Customers / users
- Runway
- Headcount
- Health Score with sparkline

**Trend charts**
- Revenue / MRR over 12 months (line)
- Headcount over time
- Burn rate vs. runway projection
- Customer acquisition trend
- Engagement / DAU if applicable

**Goal tracking**
- Committed goals from previous submission vs actual
- Visual progress bars (green/yellow/red)
- Streak: "You've hit 3 of last 4 monthly goals"

**Peer benchmarking** (privacy-preserved)
- "Top 25% for revenue growth among seed-stage SaaS in QSTP"
- Anonymized cohort percentile bars (gated by `privacy_settings.cohort_benchmarking`)

**Investor-Ready Mode card**
- Toggle: ON / OFF (writes `startups.investor_mode_enabled`)
- Generated link, copyable, with view stats
- "Last viewed by 2 unknown viewers, 4 hours ago"
- Settings: password protection (`investor_mode_password_hash`), expiry,
  what to show
- [Share via Email] [Share via WhatsApp] [Copy Link]

**Mood history**
- Small chart of past mood emojis with dates
- Optional notes timeline

---

## `/founder/rewards` — Points Wallet & Marketplace

**Wallet card**
- Current points balance (large)
- Tier badge (Spark / Catalyst / Trailblazer / Pioneer / Legend)
- Tier progress bar to next tier
- Streak counter (🔥 N months)
- This month's earnings breakdown

**Leaderboard**
- Tabs: Monthly Movers | Streak Masters | Data Champions | Community Heroes |
  Rising Stars | All-Time
- Founder's current rank highlighted
- Top 10 startups (anonymized or named based on opt-in)
- Movement indicator (↑3 from last week)

**Recent activity** (transaction log)
- "+150 points — On-time submission for October"
- "+50 points — Verified data bonus (GitHub connected)"
- "+25 points — Helped Acme Co. with intro"
- "−200 points — Redeemed: Priority mentor slot with John Smith"

**Redemption marketplace** (grouped grids)
- Resources — mentor slots, lab equipment, cloud credits, legal hours
- Visibility — newsletter feature, LinkedIn shoutout, lobby TV, event speaker
- Network & Capital — investor intro, exec 1:1, demo day priority,
  Startup of the Month
- Tangible — café credits, conference tickets, travel stipend
- Each item: image, point cost, availability, [Redeem] (disabled if short)

**Data**
- `startups.points_balance`, `startups.tier`. Transaction log + marketplace
  schema not yet defined — ledger table TBD.

---

## `/founder/settings`

Collapsible/tabbed sections:

**Profile**
- Personal: name, photo, role, contact
- Startup: legal name (Arabic + English), CR/QFC #, sector, stage, cohort,
  incorporation date, financial year end
- Registered office address
- Team roster (officers, directors, secretary)
  → stored in `startups.extended_profile` JSONB

**Integrations**
- Connected services with status: Stripe ✓, GitHub ✓, HubSpot, LinkedIn ✓,
  Google Calendar
- [Connect] / [Disconnect] / [Sync now] per integration; last sync timestamp
- AI assistant connectors: Claude, ChatGPT, WhatsApp
  → `startups.connected_integrations`

**Cap Table**
- Shareholders with ownership %, nationality, source of control
- Used for UBO Report auto-fill
- [Add Shareholder]
  → `startups.extended_profile.cap_table`

**Compliance Profile**
- Tax regime: QFC / Mainland / Free Zone
- Auditor details
- Active grants/incentives (QDB, Invest Qatar, etc.)
  → `startups.extended_profile.compliance`

**Notifications**
- Per-channel preferences (in-app, email, push, WhatsApp)
- Per-event-type toggles
- Quiet hours, weekend mode, digest frequency
  → `profiles.preferences.notifications`

**Privacy & Sharing**
- Portfolio-public vs team-only vs private toggles
- Cohort benchmarking opt-in (`startups.privacy_settings.cohort_benchmarking`)
- Public wins opt-in (`startups.privacy_settings.public_wins`)
- Mood data visibility
- Data export ([Download all my data])
- Account deletion

**Language & Display**
- English / Arabic toggle (`profiles.language_preference`)
- Theme (light/dark) (`profiles.preferences.theme`)
- Currency display preference

**Security**
- Password change, 2FA, active sessions, audit log

---

# INCUBATION TEAM

## `/team/today` — Worklist

Action-oriented home, not a dashboard.

**Daily snapshot banner**
- Today's date + team member name
- "5 startups submitted this morning · 2 at-risk alerts · 3 founders awaiting
  your feedback · 2 wins pending approval"

**Action sections** (each is a clickable list)

**Needs my feedback** (priority list)
- Submissions where founders are awaiting comment
- Per item: founder, startup, submission date, snippet, [Open]

**At-risk alerts**
- Startups whose Health Score dropped or showing disengagement
- Per item: startup, severity (red/yellow), reason, suggested intervention
  drafts, [Take Action]

**Wins awaiting approval** (Comms work)
- LinkedIn posts / newsletter blurbs drafted by AI from founder submissions
- Per item: startup, win headline, drafted post preview, [Approve & Publish]
  [Edit] [Reject]

**Today's submissions**
- Submissions in last 24h
- Per item: startup, submission summary, key changes, [View Full]

**Upcoming deadlines** (across portfolio)
- Compliance deadlines flagged by Founder Health Score
- Reports due to government, board, sponsors

**Right rail — My quick stats**
- Submissions reviewed this week
- Feedback given count
- Wins approved
- At-risk interventions made

**Data scope**: filter by `team_assignments.team_member_id = current_user`
unless admin.

---

## `/team/portfolio` — Directory

**Filter bar**
- Search by name
- Filter chips: Sector, Stage, Cohort, Health Score (range), Last Submission
  (range), Tags
- View toggle: Grid / List / Map (if location data exists)
- Sort: Most active, At-risk, Last submitted, Growth rate, Alphabetical

**Main grid (cards) or list view**
Per card: logo, name, founder name(s), sector + stage badge, Health Score
(color-coded), last submission date, streak indicator, quick stats (revenue
trend arrow, headcount, runway), status flags (at-risk, top performer, new).

**Click → Per-Startup Deep Dive** (modal or new page `/team/portfolio/[id]`)
- Header: logo, name, founder photos, key facts, [Send Message]
  [Schedule Meeting]
- KPI tabs: Financials | Team | Product | Pipeline | Milestones — each with
  charts and historical data
- Submissions timeline: every submission with team comments inline
- Integrations status: which connected, last sync
- Cap table summary
- Compliance status: upcoming filings, last QFC filing date
- Notes & tags (team-only)
- Linked opportunities: matches sent, applied to, won

---

## `/team/submissions` — Active Feedback Loop

Where Comms work also happens.

**Tabs**: All | Awaiting Feedback | Flagged | Wins to Approve | Recently
Reviewed

**Main list** (most recent first)
Per submission: founder + startup, date and period, summary preview (revenue
change, key wins, flagged items), attached integration badges, existing team
comments count, [Review].

**Submission detail view** (click → expand)
- Full submission with all KPI cards
- Inline commenting on any field (any team member)
- Reactions: 🎉 kudos, 🚩 flag, ❓ clarify, 💡 suggest
  → maps to `submission_feedback.reaction` enum
- Anomaly highlights (sudden drops, suspicious spikes)
- Wins extracted, with drafted publication content for Comms approval:
  - LinkedIn draft
  - Newsletter blurb
  - Internal announcement
  - Press release if applicable
- [Approve for Publication] [Edit Draft] [Reject]
- [Send Personal Note to Founder] [Suggest Office Hours]

**Right rail — submission context**
- Founder Health Score
- Submission streak
- Recent activity
- Past team comments

**Data**
- `kpi_submissions`, `submission_feedback`,
  `kpi_submissions.generated_outputs.wins`

---

## `/team/health` — Health Monitor

The "who needs help right now" view.

**Portfolio health overview**
- Aggregate Health Score distribution (bar chart by tier)
- Trend: portfolio average over time
- Alert summary: N critical, N warning, rest healthy

**Critical alerts (red zone)**
- Per startup: Health Score, top reasons for decline, days since last
  submission, suggested intervention
- Pre-drafted outreach: "Hi [founder], I noticed your last few months have
  been challenging. Would you have 15 minutes this week to chat?"
- [Send Message] [Schedule Meeting] [Add Note] [Reassign to Mentor]

**Warning zone (yellow)**
- Same structure, lower urgency

**Predictive churn indicators**
- "Acme Co. — 78% disengagement risk in 30 days" with trajectory chart
- Reasons (model-driven or rule-based): missed N submissions, mood declining,
  no recent meetings

**Intervention history**
- Track record of past interventions: which worked, which didn't
- Outcome attribution

---

## `/team/insights` — Cross-Portfolio Analytics

Strategic, not action-oriented.

**Portfolio KPIs (aggregate)**
- Total portfolio revenue (MoM, YoY)
- Total jobs created
- Total funding raised by portfolio companies
- Average Health Score
- Active vs. at-risk count

**Cohort comparisons**
- Side-by-side: 2024 cohort vs. 2025 cohort across key metrics
- Vintage curves (revenue at month X across cohorts)

**Sector trends**
- Performance by sector
- Engagement by sector

**Engagement heatmaps**
- Submission rates by week/month
- Time-of-day patterns
- Channel preferences

**Cohort pattern detection**
- "Founders who hit 50K MRR by month 18 had these 3 things in common"
- Surfacing insights from historical portfolio data

**Geographic / demographic**
- Distribution of founders (gender, nationality, age) — for diversity reporting
- Office vs. remote, sectors by region

**Custom saved views**
- Bookmark filters and analyses
- Share with other team members

---

## `/team/reports` — Reporting Auto-Pilot

Generate everything QSTP owes outside.

**Quick generate buttons**
- [Monthly Board Report] [Government Stakeholder Report] [Sponsor Update]
  [Annual Impact Report]

**Templates section**
Cards by audience (name, description, last generated date, [Generate Now]
[Schedule Recurring]):
- Government / regulatory (Ministry of Communications & IT, MoCI, etc.)
- Sponsors (corporate partners funding QSTP)
- Board of Directors / Qatar Foundation leadership
- Internal exec leadership
- Public-facing impact reports

**Generation wizard** (when clicking Generate)
- Date range selection
- Filter (which startups, sectors, cohorts to include)
- Sections to include (toggleable)
- Output format: PDF, Word, slides
- Recipient list (auto-deliver via email)
- AI-generated narrative summary at the top

**Generated reports archive**
- All previously generated reports, searchable
- Version history
- Engagement (who opened, when)
- [Re-send] [Duplicate as new]

**Scheduled reports**
- Auto-generated and sent on cadence
- "Monthly board report — sent 1st of every month at 9am"
- [Edit Schedule] [Pause] [Run Now]

**Data**
- `templates` (scope = `system` for org-wide). Generated archive + schedule
  schema not yet defined.

---

## `/team/settings`

**Profile**
- Name, role, photo, contact
- Department within QSTP

**Portfolio assignment**
- Which startups this team member oversees (`team_assignments`)
- Permissions: read-only, comment, approve wins, generate reports

**Notification preferences**
- Per-channel, per-event-type toggles
- Working hours / on-call rotation
- Mute certain startups or alert types

**Team & permissions** (admin-only — hidden otherwise)
- View other team members
- Role assignments
- Permission overrides

**Integrations** (QSTP-side)
- QSTP newsletter platform connection
- Social media account connections (for win publishing)
- Internal Slack/Teams workspace
- Government reporting accounts

**Templates library**
- Edit organization-wide templates (intervention drafts, government report
  formats) (`templates` with `scope = 'team'` or `'system'`)
- Founder-facing message templates the team uses

**Audit log**
- This member's recent actions for self-review

**Language & display**
- English / Arabic toggle
- Theme

---

## Schema mapping reference

| Page area                          | Tables                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Founder Home feed                  | `kpi_submissions`, `submission_feedback`, `opportunities`, `notifications` |
| Submit                             | `kpi_submissions` (write)                                              |
| Distribute                         | `kpi_submissions.generated_outputs`, `templates`, `startups.recipients` |
| Opportunities                      | `opportunities` (global = `startup_id IS NULL`, matched = `= startup.id`) |
| Metrics                            | `kpi_submissions.metrics`, `startups.health_score`, `privacy_settings` |
| Rewards                            | `startups.points_balance`, `startups.tier` (+ TBD ledger)              |
| Founder Settings                   | `profiles`, `startups.extended_profile`, `connected_integrations`, `privacy_settings` |
| Team Today / Portfolio / Health    | `team_assignments` → `startups`, `kpi_submissions`, `submission_feedback` |
| Team Submissions                   | `kpi_submissions`, `submission_feedback`                               |
| Team Reports                       | `templates` (scope `team`/`system`) (+ TBD generated archive)          |
| Team Settings                      | `profiles`, `team_assignments`                                         |

**Schema gaps** to define before building Tier-2 pages:
- Points ledger (transaction log + redemption history)
- Distribution-sent archive with engagement metrics (opens, replies)
- Recipient open/reply tracking
- Generated-report archive + schedule
- Intervention history / outcomes
- Integration connection state per startup (vs. the boolean blob in
  `connected_integrations`)
