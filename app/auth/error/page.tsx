import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication error</CardTitle>
        <CardDescription>
          {message ??
            "Your link is invalid or has expired. Please try again."}
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
