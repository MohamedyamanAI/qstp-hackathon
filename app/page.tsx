import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { fetchUserRole, roleHomeFor } from "@/lib/auth/role"
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId =
    typeof data?.claims?.sub === "string" ? data.claims.sub : null
  const home = userId
    ? roleHomeFor(await fetchUserRole(supabase, userId))
    : null
  const isAuthenticated = !!userId

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            QSTP · Founder operating system
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            One monthly update. Every stakeholder, handled.
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Founders submit once in 90 seconds — investor emails, board decks,
            announcements, and opportunity matches go out automatically. The
            QSTP team gets a live portfolio view, not another inbox to chase.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            {isAuthenticated && home ? (
              <Button asChild size="lg">
                <Link href={home}>Open workspace</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/auth/sign-up">Get started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
          <ul className="mt-4 grid w-full gap-3 text-left sm:grid-cols-3">
            <li className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium">Submit once</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pre-filled from Stripe, GitHub, LinkedIn, HubSpot. Voice or
                form.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium">Distribute everywhere</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Investor update, board deck, and announcement drafted in one
                pass.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium">Earn the upside</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Match grants and partners, climb tiers, and unlock unfair
                advantages.
              </p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
