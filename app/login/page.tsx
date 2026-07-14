"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockIcon, MailIcon } from "lucide-react";

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, {
    error: null,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <LockIcon className="h-5 w-5 text-orange-600" />
          </div>

          <h1 className="text-2xl font-bold">Admin Login</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access the dashboard
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>

            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                className="h-10 pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="h-10 pl-9"
                required
              />
            </div>
          </div>

          {state.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}