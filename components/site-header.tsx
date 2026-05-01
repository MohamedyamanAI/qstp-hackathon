import Link from "next/link"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export async function SiteHeader() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

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
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
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
