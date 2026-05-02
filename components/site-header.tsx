import Link from "next/link"

import { Button } from "@/components/ui/button"
import { fetchUserRole, roleHomeFor } from "@/lib/auth/role"
import { createClient } from "@/lib/supabase/server"

export async function SiteHeader() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId =
    typeof data?.claims?.sub === "string" ? data.claims.sub : null
  const home = userId
    ? roleHomeFor(await fetchUserRole(supabase, userId))
    : null
  const isAuthenticated = !!userId

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
        >
          QSTP
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/design-system">Design system</Link>
          </Button>
          {isAuthenticated && home ? (
            <Button asChild size="sm">
              <Link href={home}>Workspace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
