"use client";

import { useActionState } from "react";
import { verifyCode, type AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    verifyCode,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="email" value={email} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">6-digit code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="123456"
          className="text-center text-lg tracking-[0.4em]"
          required
        />
        <p className="text-xs text-zinc-500">
          We emailed a code to <span className="font-medium">{email}</span>. It expires in 15 minutes.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} variant="navy" className="w-full">
        {pending ? "Verifying…" : "Verify & continue"}
      </Button>
    </form>
  );
}
