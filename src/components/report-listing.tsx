"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reportListing } from "@/app/listings/actions";

export function ReportListing({
  listingId,
  isLoggedIn,
}: {
  listingId: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700">
        <Flag className="h-3.5 w-3.5" /> Report this listing
      </Link>
    );
  }

  if (status === "done") {
    return <p className="text-xs text-green-600">Thanks — we&apos;ve received your report.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700"
      >
        <Flag className="h-3.5 w-3.5" /> Report this listing
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <p className="text-sm font-medium text-zinc-800">What&apos;s wrong with this listing?</p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Looks like a scam, photos aren't theirs, discriminatory language…"
        className="mt-2 min-h-[72px]"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          disabled={status === "sending"}
          onClick={async () => {
            setStatus("sending");
            setError(null);
            const res = await reportListing(listingId, reason);
            if (res?.error) {
              setError(res.error);
              setStatus("error");
            } else {
              setStatus("done");
            }
          }}
        >
          {status === "sending" ? "Sending…" : "Submit report"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
