"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAllowedEmail } from "@/lib/auth-domain";
import { screenFairHousing } from "@/lib/fair-housing";
import { sendReportNotification } from "@/lib/email";
import type { CampusArea, Term } from "@/generated/prisma/enums";
import { rateLimitByIp, RATE_LIMITS } from "@/lib/rate-limit";
import {
  cleanText,
  listingInputSchema,
  parseCoordinates,
  parseListingDate,
  reportReasonSchema,
  sanitizeBusRoutes,
  sanitizeImageUrls,
  isGoogleMapsConfigured,
  uuidSchema,
  validateDateRange,
  zodFieldErrors,
} from "@/lib/validation";

export type ListingValues = {
  title: string;
  description: string;
  campusArea: string;
  term: string;
  layout: string;
  priceMonthly: string;
  bedrooms: string;
  address: string;
  latitude: string;
  longitude: string;
  roommateGenders: string;
  contactEmail: string;
  contactPhone: string;
  availableFrom: string;
  availableTo: string;
  busRoutes: string[];
  petFriendly: boolean;
  inUnitLaundry: boolean;
  parkingIncluded: boolean;
  consentToShare: boolean;
};

export type ListingActionState =
  | { error?: string; fieldErrors?: Record<string, string>; values?: ListingValues }
  | undefined;

/** Snapshot of submitted fields so the form can repopulate after a failed post. */
function readListingValues(formData: FormData): ListingValues {
  const str = (k: string) => cleanText(formData.get(k));
  return {
    title: str("title"),
    description: str("description"),
    campusArea: str("campusArea"),
    term: str("term"),
    layout: str("layout"),
    priceMonthly: str("priceMonthly"),
    bedrooms: str("bedrooms"),
    address: str("address"),
    latitude: str("latitude"),
    longitude: str("longitude"),
    roommateGenders: str("roommateGenders"),
    contactEmail: str("contactEmail"),
    contactPhone: str("contactPhone"),
    availableFrom: str("availableFrom"),
    availableTo: str("availableTo"),
    busRoutes: sanitizeBusRoutes(formData.getAll("busRoutes")),
    petFriendly: formData.get("petFriendly") === "on",
    inUnitLaundry: formData.get("inUnitLaundry") === "on",
    parkingIncluded: formData.get("parkingIncluded") === "on",
    consentToShare: formData.get("consentToShare") === "on",
  };
}

export async function createListing(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const session = await auth();
  if (!session?.user?.id || !isAllowedEmail(session.user.email)) {
    return { error: "You must be signed in with your @illinois.edu account to post." };
  }

  // Echoed back on every failure so the form keeps what the user typed.
  const values = readListingValues(formData);

  const limit = await rateLimitByIp("listing:create", RATE_LIMITS.mutation);
  if (!limit.success) {
    return { error: "You're posting too quickly. Please wait a minute and try again.", values };
  }

  const parsed = listingInputSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    campusArea: formData.get("campusArea") ?? "",
    term: formData.get("term") ?? "",
    layout: formData.get("layout") ?? "",
    priceMonthly: formData.get("priceMonthly") ?? "",
    bedrooms: formData.get("bedrooms") || undefined,
    address: formData.get("address") ?? "",
    roommateGenders: formData.get("roommateGenders") ?? "",
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    contactPhone: formData.get("contactPhone") ?? "",
    consentToShare: formData.get("consentToShare") === "on",
  });

  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error);
    if (fieldErrors.consentToShare)
      fieldErrors.consentToShare = "You must agree to share your contact info to post.";
    return { fieldErrors, values };
  }
  if (!parsed.data.consentToShare) {
    return {
      fieldErrors: { consentToShare: "You must agree to share your contact info to post." },
      values,
    };
  }

  const {
    title,
    description,
    campusArea,
    term,
    layout: roomLayout,
    priceMonthly,
    bedrooms,
    address,
    roommateGenders,
    contactPhone,
  } = parsed.data;
  const contactEmail = parsed.data.contactEmail || session.user.email!;

  const petFriendly = formData.get("petFriendly") === "on";
  const inUnitLaundry = formData.get("inUnitLaundry") === "on";
  const parkingIncluded = formData.get("parkingIncluded") === "on";
  const busRoutes = sanitizeBusRoutes(formData.getAll("busRoutes"));
  const imageUrls = sanitizeImageUrls(formData.get("imageUrls"));
  const availableFrom = parseListingDate(formData.get("availableFrom"));
  const availableTo = parseListingDate(formData.get("availableTo"));

  if (!validateDateRange(availableFrom, availableTo)) {
    return {
      fieldErrors: { availableTo: "End date must be on or after the start date." },
      values,
    };
  }

  const { latitude, longitude } = parseCoordinates(formData);
  if (isGoogleMapsConfigured() && (latitude == null || longitude == null)) {
    return {
      fieldErrors: {
        address: "Select an address from the Google suggestions dropdown.",
      },
      values,
    };
  }

  // Fair Housing screen on free-text fields (roommate gender is exempt).
  const violations = screenFairHousing(title, description);
  if (violations.length) {
    return {
      error: `Your listing appears to violate Fair Housing law (${violations
        .map((v) => v.label)
        .join(", ")}). Please remove discriminatory language and try again.`,
      values,
    };
  }

  const listing = await prisma.listing.create({
    data: {
      userId: session.user.id,
      title,
      description,
      campusArea: campusArea as CampusArea,
      term: term as Term,
      roomLayout,
      priceMonthly: Math.round(priceMonthly),
      bedrooms: bedrooms ?? null,
      address,
      latitude,
      longitude,
      distanceMiles: null,
      busRoutes,
      petFriendly,
      inUnitLaundry,
      parkingIncluded,
      roommateGenders: roommateGenders || null,
      contactEmail,
      contactPhone: contactPhone || null,
      consentToShare: true,
      availableFrom,
      availableTo,
      images: { create: imageUrls.map((url, i) => ({ url, sortOrder: i })) },
    },
  });

  revalidatePath("/search");
  revalidatePath("/dashboard");
  redirect(`/listings/${listing.id}`);
}

const VALID_STATUSES = ["ACTIVE", "RENTED", "EXPIRED"] as const;

export async function setListingStatus(listingId: string, status: "ACTIVE" | "RENTED" | "EXPIRED") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  if (!uuidSchema.safeParse(listingId).success) return { error: "Not found." };
  if (!VALID_STATUSES.includes(status)) return { error: "Invalid status." };

  const limit = await rateLimitByIp("listing:status", RATE_LIMITS.mutation);
  if (!limit.success) return { error: "Too many requests. Please wait a moment." };

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

  if (!uuidSchema.safeParse(listingId).success) return { error: "Not found." };

  const limit = await rateLimitByIp("listing:delete", RATE_LIMITS.mutation);
  if (!limit.success) return { error: "Too many requests. Please wait a moment." };

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

  if (!uuidSchema.safeParse(listingId).success) {
    return { ok: false, error: "Listing not found." };
  }

  // Throttle to deter scraping of contact details across many listings.
  const limit = await rateLimitByIp("listing:reveal", RATE_LIMITS.mutation);
  if (!limit.success) {
    return { ok: false, error: "Too many requests. Please wait a minute and try again." };
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

  if (!uuidSchema.safeParse(listingId).success) return { error: "Listing not found." };

  const parsedReason = reportReasonSchema.safeParse(reason);
  if (!parsedReason.success) {
    return { error: parsedReason.error.issues[0]?.message ?? "Please describe the problem." };
  }
  const trimmed = parsedReason.data;

  const limit = await rateLimitByIp("listing:report", RATE_LIMITS.mutation);
  if (!limit.success) return { error: "Too many reports. Please wait a moment." };

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
