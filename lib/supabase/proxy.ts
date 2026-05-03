import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { fetchUserRole, roleHomeFor } from "@/lib/auth/role"
import type { Database } from "@/lib/supabase/database.types"

const PUBLIC_PATHS = ["/", "/auth", "/api", "/share"]

const FOUNDER_PREFIX = "/founder"
const TEAM_PREFIX = "/team"

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

function isFounderArea(pathname: string) {
  return pathname === FOUNDER_PREFIX || pathname.startsWith(`${FOUNDER_PREFIX}/`)
}

function isTeamArea(pathname: string) {
  return pathname === TEAM_PREFIX || pathname.startsWith(`${TEAM_PREFIX}/`)
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            )
          }
        },
      },
    }
  )

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug issues with users
  // being randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  const pathname = request.nextUrl.pathname

  if (!claims && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (claims && (isFounderArea(pathname) || isTeamArea(pathname))) {
    const userId = typeof claims.sub === "string" ? claims.sub : null
    const role = userId ? await fetchUserRole(supabase, userId) : null
    const onWrongArea =
      (isFounderArea(pathname) && role === "team") ||
      (isTeamArea(pathname) && role === "founder")
    if (onWrongArea) {
      const url = request.nextUrl.clone()
      url.pathname = roleHomeFor(role)
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
