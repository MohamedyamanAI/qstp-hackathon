"use client"

import Link from "next/link"
import { useActionState } from "react"

import { forgotPassword, type AuthState } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    forgotPassword,
    undefined
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          We&apos;ll email you a link to set a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>
          {state?.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              href="/auth/login"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
