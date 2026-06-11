"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAllowedEmail } from "@/lib/auth-domain";
import { screenFairHousing } from "@/lib/fair-housing";
import { geocodeAddress } from "@/lib/geocode";
import { milesFromCampus } from "@/lib/geo";
import { sendReportNotification } from "@/lib/email";
import { CAMPUS_RADIUS_MILES, PRICE_MAX, PRICE_MIN, BUS_ROUTES } from "@/lib/constants";
import type { CampusArea, RoomLayout, Term } from "@/generated/prisma/enums";

export type ListingActionState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

const CAMPUS_VALUES = ["NORTH", "SOUTH", "URBANA", "CHAMPAIGN"];
const TERM_VALUES = ["FALL", "SPRING", "SUMMER"];
const LAYOUT_VALUES = ["STUDIO", "ONE_BED", "TWO_BED", "ROOM_IN_SHARED"];

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

export async function createListing(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const session = await auth();
  if (!session?.user?.id || !isAllowedEmail(session.user.email)) {
    return { error: "You must be signed in with your @illinois.edu account to post." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const campusArea = String(formData.get("campusArea") ?? "");
  const term = String(formData.get("term") ?? "");
  const roomLayout = String(formData.get("roomLayout") ?? "");
  const priceMonthly = Number(formData.get("priceMonthly"));
  const bedroomsRaw = formData.get("bedrooms");
  const address = String(formData.get("address") ?? "").trim();
  const roommateGenders = String(formData.get("roommateGenders") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim() || session.user.email!;
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const consent = formData.get("consentToShare") === "on";
  const petFriendly = formData.get("petFriendly") === "on";
  const inUnitLaundry = formData.get("inUnitLaundry") === "on";
  const parkingIncluded = formData.get("parkingIncluded") === "on";
  const busRoutes = formData
    .getAll("busRoutes")
    .map(String)
    .filter((r) => (BUS_ROUTES as readonly string[]).includes(r));
  const imageUrls = String(formData.get("imageUrls") ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s))
    .slice(0, 8);
  const availableFrom = parseDate(formData.get("availableFrom"));
  const availableTo = parseDate(formData.get("availableTo"));

  const fieldErrors: Record<string, string> = {};
  if (title.length < 4) fieldErrors.title = "Add a descriptive title.";
  if (description.length < 20) fieldErrors.description = "Add at least a couple sentences.";
  if (!CAMPUS_VALUES.includes(campusArea)) fieldErrors.campusArea = "Choose a campus area.";
  if (!TERM_VALUES.includes(term)) fieldErrors.term = "Choose a term.";
  if (!LAYOUT_VALUES.includes(roomLayout)) fieldErrors.roomLayout = "Choose a room layout.";
  if (!Number.isFinite(priceMonthly) || priceMonthly < PRICE_MIN || priceMonthly > PRICE_MAX)
    fieldErrors.priceMonthly = `Enter a monthly price between $${PRICE_MIN} and $${PRICE_MAX}.`;
  if (!address) fieldErrors.address = "Enter the apartment address.";
  if (!consent) fieldErrors.consentToShare = "You must agree to share your contact info to post.";

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  // Fair Housing screen on free-text fields (roommate gender is exempt).
  const violations = screenFairHousing(title, description);
  if (violations.length) {
    return {
      error: `Your listing appears to violate Fair Housing law (${violations
        .map((v) => v.label)
        .join(", ")}). Please remove discriminatory language and try again.`,
    };
  }

  // Enforce the 20-mile radius via geocoding.
  const geo = await geocodeAddress(address);
  if (!geo) {
    return {
      fieldErrors: {
        address: "We couldn't locate that address. Use a full Champaign-Urbana street address.",
      },
    };
  }
  const distanceMiles = milesFromCampus(geo.lat, geo.lon);
  if (distanceMiles > CAMPUS_RADIUS_MILES) {
    return {
      fieldErrors: {
        address: `That address is ${distanceMiles.toFixed(
          1
        )} mi from campus. Listings must be within ${CAMPUS_RADIUS_MILES} miles.`,
      },
    };
  }

  const listing = await prisma.listing.create({
    data: {
      userId: session.user.id,
      title,
      description,
      campusArea: campusArea as CampusArea,
      term: term as Term,
      roomLayout: roomLayout as RoomLayout,
      priceMonthly: Math.round(priceMonthly),
      bedrooms: bedroomsRaw ? Number(bedroomsRaw) || null : null,
      address: geo.displayName,
      latitude: geo.lat,
      longitude: geo.lon,
      distanceMiles,
      busRoutes,
      petFriendly,
      inUnitLaundry,
      parkingIncluded,
      roommateGenders: roommateGenders || null,
      contactEmail,
      contactPhone: contactPhone || null,
      consentToShare: consent,
      availableFrom,
      availableTo,
      images: { create: imageUrls.map((url, i) => ({ url, sortOrder: i })) },
    },
  });

  revalidatePath("/search");
  revalidatePath("/dashboard");
  redirect(`/listings/${listing.id}`);
}

export async function setListingStatus(listingId: string, status: "ACTIVE" | "RENTED" | "EXPIRED") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.userId !== session.user.id) return { error: "Not found." };

  await prisma.listing.update({ where: { id: listingId }, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath(`/listings/${listingId}`);
  return { ok: true };
}

export async function deleteListing(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.userId !== session.user.id) return { error: "Not found." };

  await prisma.listing.delete({ where: { id: listingId } });
  revalidatePath("/dashboard");
  revalidatePath("/search");
  return { ok: true };
}

export type RevealResult =
  | { ok: false; error: string }
  | { ok: true; contactEmail: string; contactPhone: string | null };

/** Contact details are only ever returned to a signed-in UIUC user. */
export async function revealContact(listingId: string): Promise<RevealResult> {
  const session = await auth();
  if (!session?.user?.id || !isAllowedEmail(session.user.email)) {
    return { ok: false, error: "Sign in with your @illinois.edu account to view contact info." };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { status: true, consentToShare: true, contactEmail: true, contactPhone: true },
  });
  if (!listing) return { ok: false, error: "Listing not found." };
  if (listing.status !== "ACTIVE" || !listing.consentToShare) {
    return { ok: false, error: "Contact info is no longer available for this listing." };
  }

  return { ok: true, contactEmail: listing.contactEmail, contactPhone: listing.contactPhone };
}

export async function reportListing(listingId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to report a listing." };
  const trimmed = reason.trim();
  if (trimmed.length < 5) return { error: "Please describe the problem." };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { title: true },
  });
  if (!listing) return { error: "Listing not found." };

  await prisma.report.create({
    data: { listingId, reporterId: session.user.id, reason: trimmed },
  });
  await sendReportNotification(listingId, listing.title, trimmed, session.user.email ?? undefined);
  return { ok: true };
}
