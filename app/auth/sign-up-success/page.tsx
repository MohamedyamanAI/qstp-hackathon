import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          We&apos;ve sent you a confirmation link. Open it on this device to
          finish creating your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Already confirmed?{" "}
          <Link
            href="/auth/login"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  )
}
