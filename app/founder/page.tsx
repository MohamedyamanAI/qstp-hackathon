import { redirect } from "next/navigation"

import { FOUNDER_HOME } from "@/lib/auth/role"

export default function FounderIndexPage() {
  redirect(FOUNDER_HOME)
}
