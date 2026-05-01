import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ForgotPasswordSuccessPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          If an account exists for that email, we&apos;ve sent a password reset
          link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/auth/login"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
