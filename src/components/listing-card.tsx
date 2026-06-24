import Link from "next/link";
import { MapPin, Bus, PawPrint, WashingMachine, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { campusAreaLabel, roomLayoutLabel, termLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { ListingWithImages } from "@/lib/listings";

export function ListingCard({ listing }: { listing: ListingWithImages }) {
  const cover = listing.images[0]?.url;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            <MapPin className="h-10 w-10" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-[#13294B] shadow">
          {formatPrice(listing.priceMonthly)}/mo
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-zinc-900">{listing.title}</h3>
        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <MapPin className="h-3.5 w-3.5" />
          {campusAreaLabel(listing.campusArea)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <Badge>{termLabel(listing.term)}</Badge>
          <Badge>{roomLayoutLabel(listing.roomLayout)}</Badge>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-1 text-zinc-400">
          {listing.busRoutes.length > 0 && (
            <span className="flex items-center gap-1 text-xs" title={listing.busRoutes.join(", ")}>
              <Bus className="h-4 w-4" /> {listing.busRoutes.length}
            </span>
          )}
          {listing.petFriendly && <PawPrint className="h-4 w-4" aria-label="Pet friendly" />}
          {listing.inUnitLaundry && <WashingMachine className="h-4 w-4" aria-label="In-unit laundry" />}
          {listing.parkingIncluded && <Car className="h-4 w-4" aria-label="Parking included" />}
        </div>
      </div>
    </Link>
  );
}
