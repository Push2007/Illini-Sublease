"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setListingStatus, deleteListing } from "@/app/listings/actions";

export function ListingManageActions({
  listingId,
  status,
}: {
  listingId: string;
  status: "ACTIVE" | "RENTED" | "EXPIRED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "ACTIVE" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => startTransition(async () => {
            await setListingStatus(listingId, "RENTED");
            router.refresh();
          })}
        >
          Mark as rented
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => startTransition(async () => {
            await setListingStatus(listingId, "ACTIVE");
            router.refresh();
          })}
        >
          Re-activate
        </Button>
      )}

      {confirming ? (
        <span className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => startTransition(async () => {
              await deleteListing(listingId);
              router.refresh();
            })}
          >
            Confirm delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
        </span>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
          Delete
        </Button>
      )}
    </div>
  );
}
