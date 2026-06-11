import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Bus,
  PawPrint,
  WashingMachine,
  Car,
  Users,
  Calendar,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { auth } from "@/auth";
import { getListingById } from "@/lib/listings";
import { campusAreaLabel, roomLayoutLabel, termLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ListingGallery } from "@/components/listing-gallery";
import { RevealContact } from "@/components/reveal-contact";
import { ReportListing } from "@/components/report-listing";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListingById(id), auth()]);
  if (!listing) notFound();

  const isLoggedIn = Boolean(session?.user?.id);
  const fmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/search" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← Back to search
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <ListingGallery images={listing.images.map((i) => i.url)} title={listing.title} />

          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{listing.title}</h1>
              {listing.status !== "ACTIVE" && (
                <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                  {listing.status === "RENTED" ? "Rented" : "Expired"}
                </Badge>
              )}
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
              <MapPin className="h-4 w-4" /> {listing.address}
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-[#E84A27] hover:underline"
            >
              View on map ({listing.distanceMiles.toFixed(1)} mi from campus) <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{campusAreaLabel(listing.campusArea)}</Badge>
              <Badge>{termLabel(listing.term)}</Badge>
              <Badge>{roomLayoutLabel(listing.roomLayout)}</Badge>
              {listing.bedrooms ? <Badge>{listing.bedrooms} bd</Badge> : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.petFriendly && <Perk icon={<PawPrint className="h-4 w-4" />} label="Pet-friendly" />}
              {listing.inUnitLaundry && <Perk icon={<WashingMachine className="h-4 w-4" />} label="In-unit laundry" />}
              {listing.parkingIncluded && <Perk icon={<Car className="h-4 w-4" />} label="Parking included" />}
              {listing.roommateGenders && <Perk icon={<Users className="h-4 w-4" />} label={listing.roommateGenders} />}
              {(listing.availableFrom || listing.availableTo) && (
                <Perk
                  icon={<Calendar className="h-4 w-4" />}
                  label={`${fmt(listing.availableFrom) ?? "?"} → ${fmt(listing.availableTo) ?? "?"}`}
                />
              )}
            </div>

            {listing.busRoutes.length > 0 && (
              <div className="mt-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
                  <Bus className="h-4 w-4" /> Nearby MTD routes
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {listing.busRoutes.map((r) => (
                    <Badge key={r}>{r}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-zinc-800">About this sublease</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {listing.description}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-extrabold text-[#13294B]">
              {formatPrice(listing.priceMonthly)}
              <span className="text-base font-medium text-zinc-400">/mo</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Listed by {listing.user.name ?? "a UIUC student"}
            </p>

            <div className="mt-4">
              <RevealContact listingId={listing.id} isLoggedIn={isLoggedIn} />
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
              <ShieldAlert className="h-4 w-4" /> Stay safe
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              We never handle payments and don&apos;t verify listings. Tour the unit,
              confirm the lease, and never wire deposits to someone you haven&apos;t met.
            </p>
          </div>

          <div className="px-1">
            <ReportListing listingId={listing.id} isLoggedIn={isLoggedIn} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
      <span className="text-[#E84A27]">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
