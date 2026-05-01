import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data!.claims

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-mono">
            {String(claims.email ?? claims.sub)}
          </span>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Get started</CardTitle>
            <CardDescription>
              Build something this weekend.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add your first project from the sidebar.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Design system</CardTitle>
            <CardDescription>
              Browse the component library.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Open it from the Resources section in the sidebar.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Manage your profile.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Settings live in the sidebar.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
