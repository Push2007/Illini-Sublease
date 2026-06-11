"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginWithCredentials, type AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    loginWithCredentials,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">UIUC email</Label>
        <Input id="email" name="email" type="email" placeholder="netid@illinois.edu" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/signup" className="text-xs text-[#E84A27] hover:underline">
            Need an account?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} variant="navy" className="w-full">
        {pending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}
