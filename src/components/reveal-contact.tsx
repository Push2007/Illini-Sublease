"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revealContact } from "@/app/listings/actions";

export function RevealContact({
  listingId,
  isLoggedIn,
}: {
  listingId: string;
  isLoggedIn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<{ contactEmail: string; contactPhone: string | null } | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="flex items-center gap-2 text-sm text-zinc-600">
          <Lock className="h-4 w-4" /> Contact info is hidden from the public.
        </p>
        <Button asChild className="mt-3 w-full" variant="navy">
          <Link href="/login">Log in to view contact</Link>
        </Button>
      </div>
    );
  }

  if (contact) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-green-700">Contact the subleaser</p>
        <a href={`mailto:${contact.contactEmail}`} className="mt-2 flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline">
          <Mail className="h-4 w-4" /> {contact.contactEmail}
        </a>
        {contact.contactPhone && (
          <a href={`tel:${contact.contactPhone}`} className="mt-1.5 flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline">
            <Phone className="h-4 w-4" /> {contact.contactPhone}
          </a>
        )}
        <p className="mt-3 text-xs text-zinc-500">
          Never send money before verifying the apartment and lease in person.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Button
        className="w-full"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          const res = await revealContact(listingId);
          setLoading(false);
          if (res.ok) setContact({ contactEmail: res.contactEmail, contactPhone: res.contactPhone });
          else setError(res.error);
        }}
      >
        <Eye className="h-4 w-4" /> {loading ? "Loading…" : "Reveal contact info"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
