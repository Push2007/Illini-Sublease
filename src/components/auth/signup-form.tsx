"use client";

import { useActionState } from "react";
import { requestSignup, type AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    requestSignup,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" type="text" placeholder="Reggie Redbird" autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">UIUC email</Label>
        <Input id="email" name="email" type="email" placeholder="netid@illinois.edu" autoComplete="email" required />
        <p className="text-xs text-zinc-500">Only @illinois.edu emails can register.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="At least 8 characters" autoComplete="new-password" required minLength={8} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} variant="navy" className="w-full">
        {pending ? "Sending code…" : "Create account"}
      </Button>
    </form>
  );
}
