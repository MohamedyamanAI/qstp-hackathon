# Architecture & Data Flow

This document outlines the core architecture, state management, and data flow for the QSTP Incubation Platform. It serves as a guide for frontend developers to understand how to interact with the database and manage state.

---

## 1. Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL)
- **State Management:** React Query (Server State) + Zustand (Client State)
- **Validation:** Zod + React Hook Form
- **Deployment:** Cloudflare Workers (via OpenNext)

---

## 2. Data Access Pattern (Server Actions)

Direct Supabase client calls from components are discouraged. Instead, follow this pattern:

1. **Components** call **Server Actions** (or React Query hooks that wrap Server Actions).
2. **Server Actions** (`app/actions/`) validate input using **Zod schemas**.
3. **Server Actions** instantiate the Supabase Server Client (`lib/supabase/server.ts`) to read/write from the database.
4. **Server Actions** return a standardized result object: `{ success: boolean, data?: any, error?: string }`.

### Example: Submitting a KPI Report

```typescript
// 1. Zod Schema (lib/schemas/kpi.ts)
export const KpiSubmissionSchema = z.object({
  startup_id: z.string().uuid(),
  period_start: z.string(),
  period_end: z.string(),
  metrics: z.record(z.any()), // Validated against the specific form_config
});

// 2. Server Action (app/actions/kpi.ts)
"use server"
export async function submitKpiReport(data: z.infer<typeof KpiSubmissionSchema>) {
  const supabase = createServerClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('kpi_submissions')
    .insert({
      startup_id: data.startup_id,
      submitted_by: user.user.id,
      period_start: data.period_start,
      period_end: data.period_end,
      metrics: data.metrics,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    });

  if (error) return { success: false, error: error.message };
  
  // Trigger background job for distributions/opportunities here
  
  return { success: true };
}
```

---

## 3. State Management

### Server State (React Query)
Use React Query for fetching, caching, and synchronizing data from the database.
- **Queries:** Fetching the active feed, fetching past submissions, fetching opportunities.
- **Mutations:** Approving a distribution, saving an opportunity.

### Client State (Zustand)
Use Zustand for ephemeral UI state that doesn't belong in the URL or the database.
- **Submission Flow:** The current step/card in the swipeable submission form.
- **Draft Metrics:** The current values of the KPI form before it is saved to the database.

---

## 4. Handling JSONB Columns

Because PostgreSQL `JSONB` columns return as `any` or `Json` in TypeScript (via Supabase generated types), you **must** cast or validate them using Zod on the frontend to ensure type safety.

Refer to `docs/jsonb-schemas.md` for the exact structures.

```typescript
// Example: Parsing the form_config
import { FormConfigSchema } from '@/lib/schemas/startup';

const { data: startup } = await supabase.from('startups').select('form_config').single();

// Validate and cast the JSONB
const formConfig = FormConfigSchema.parse(startup.form_config);

// Now TypeScript knows formConfig has boolean properties like show_revenue
if (formConfig.show_revenue) {
  // Render revenue input
}
```

---

## 5. Authentication & Routing

- **Middleware (`middleware.ts`):** Handles session refreshing and route protection.
- **Public Routes:** `/`, `/auth/login`, `/auth/signup`.
- **Protected Routes:** Everything else.
- **Role-Based Access:** 
  - `profiles.role` determines if a user is a `founder` or `team`.
  - Layouts (`app/(founder)/layout.tsx` vs `app/(team)/layout.tsx`) should enforce this by checking the profile role on mount.

---

## 6. The "Magic Moment" Flow (Submit -> Distribute)

The core loop of the hackathon MVP requires specific orchestration:

1. **Founder Submits:** Founder completes the swipeable form.
2. **Save to DB:** The `metrics` are saved to `kpi_submissions`.
3. **AI Generation (Background):** A background process (or synchronous API call during the hackathon for simplicity) reads the `metrics`, reads the `templates`, and generates the outputs (emails, posts).
4. **Save Outputs:** The generated drafts are saved to `kpi_submissions.generated_outputs`.
5. **Founder Approves:** Founder reviews the drafts on the Confirmation screen and clicks "Approve All".
6. **Send:** The system actually sends the emails/posts and updates the status in `generated_outputs` to `sent`.