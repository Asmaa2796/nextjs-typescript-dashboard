"use client";

import { useState } from "react";
import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockIcon, MailIcon, Loader2Icon } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn(formData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setError(
        message === "Invalid login credentials"
          ? "Invalid email or password"
          : message
      );

      setLoading(false);
    }
  }

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>

            <div className="relative">
              <MailIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                className="h-10 pl-9"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <LockIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="h-10 pl-9"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-orange-600 text-white hover:bg-orange-700"
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}