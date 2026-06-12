"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/app/auth/actions";

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-red-800">
        <Trash2 className="h-4 w-4" /> Delete account
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-red-700">
        Permanently delete your account and all of your listings and photos. This
        cannot be undone. Any data we received from Google (name, email, photo) is
        removed too.
      </p>

      {confirming ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-red-800">Are you sure?</span>
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => startTransition(() => deleteAccount())}
          >
            {pending ? "Deleting…" : "Yes, delete everything"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="destructive" className="mt-4" onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      )}
    </div>
  );
}
