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
        <section className="flex max-w-2xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            QSTP Hackathon · 2026
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Build faster with a sharp foundation.
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Authentication, a design system, and a clean component library —
            ready out of the box, so you can spend the weekend on the idea
            instead of the scaffolding.
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
          <p className="font-mono text-xs text-muted-foreground">
            Press <kbd className="rounded border bg-muted px-1.5 py-0.5">d</kbd>{" "}
            to toggle dark mode
          </p>
        </section>
      </main>
    </div>
  )
}
