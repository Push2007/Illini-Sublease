import { z } from "zod";
import {
  BUS_ROUTES,
  PRICE_MAX,
  PRICE_MIN,
  ROOMMATE_GENDER_OPTIONS,
} from "@/lib/constants";
import type { CampusArea, Term } from "@/generated/prisma/enums";

/** Escapes a string for safe interpolation into HTML (emails, etc.). */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Collapses whitespace and strips control characters from free text. */
export function cleanText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

/** Strips newlines and caps length for email subject lines. */
export function sanitizeSubjectLine(input: string, maxLen = 120): string {
  return cleanText(input).replace(/[\r\n]+/g, " ").slice(0, maxLen);
}

const PROFILE_IMAGE_HOSTS = [
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
] as const;

/** Only allow HTTPS avatar URLs from known OAuth providers. */
export function sanitizeProfileImageUrl(input: unknown): string | undefined {
  if (typeof input !== "string" || !input.trim()) return undefined;
  try {
    const u = new URL(input.trim());
    if (u.protocol !== "https:") return undefined;
    const hostOk = PROFILE_IMAGE_HOSTS.some(
      (h) => u.hostname === h || u.hostname.endsWith(`.${h}`)
    );
    if (!hostOk || u.href.length > 500) return undefined;
    return u.href;
  } catch {
    return undefined;
  }
}

/** Strip path separators and control chars from client-supplied upload names. */
export function sanitizeFilename(input: unknown): string {
  const raw = cleanText(input);
  const base = raw.replace(/[/\\]/g, "").replace(/\.{2,}/g, ".");
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return safe || "upload";
}

const CAMPUS_VALUES = ["NORTH", "SOUTH", "URBANA", "CHAMPAIGN"] as const;
const TERM_VALUES = ["FALL", "SPRING", "SUMMER", "WINTER"] as const;

export function parseListingDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return null;
  const year = d.getUTCFullYear();
  if (year < 2000 || year > 2100) return null;
  return d;
}

export function validateDateRange(from: Date | null, to: Date | null): boolean {
  if (!from || !to) return true;
  return from.getTime() <= to.getTime();
}

/** Parse lat/lng hidden fields submitted with a Places-autocomplete address. */
export function parseCoordinates(formData: FormData): {
  latitude: number | null;
  longitude: number | null;
} {
  const latRaw = cleanText(formData.get("latitude"));
  const lngRaw = cleanText(formData.get("longitude"));
  if (!latRaw || !lngRaw) return { latitude: null, longitude: null };

  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { latitude: null, longitude: null };
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { latitude: null, longitude: null };
  }
  return { latitude, longitude };
}

export function isGoogleMapsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
}

// --- Reusable field schemas -------------------------------------------------

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(254)
  .email();

export const passwordSchema = z.string().min(8).max(128);

export const nameSchema = z.string().trim().max(80);

/** Safe display/storage name from OAuth profile data. */
export function sanitizeProfileName(input: unknown): string | undefined {
  const parsed = nameSchema.safeParse(typeof input === "string" ? cleanText(input) : "");
  return parsed.success && parsed.data ? parsed.data : undefined;
}

export const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code.");

export const uuidSchema = z.string().uuid();

export const reportReasonSchema = z
  .string()
  .transform(cleanText)
  .pipe(z.string().min(5, "Please describe the problem.").max(2000, "That's too long."));

// --- Listing input ----------------------------------------------------------

const phoneSchema = z
  .string()
  .transform((v) => cleanText(v))
  .pipe(z.string().max(40).regex(/^[0-9+()\-.\s]*$/, "Enter a valid phone number."));

export const listingInputSchema = z.object({
  title: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(4, "Add a descriptive title.").max(120, "Title is too long.")),
  description: z
    .string()
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(20, "Add at least a couple sentences.")
        .max(4000, "Description is too long.")
    ),
  campusArea: z.enum(CAMPUS_VALUES, { message: "Choose a campus area." }),
  term: z.enum(TERM_VALUES, { message: "Choose a term." }),
  layout: z
    .string()
    .transform((v) => cleanText(v).replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(1, "Enter a room layout, e.g. 4x4, 4x2, 2x2.")
        .max(20, "Room layout is too long.")
    ),
  priceMonthly: z.coerce
    .number()
    .int()
    .min(PRICE_MIN, `Enter a monthly price between $${PRICE_MIN} and $${PRICE_MAX}.`)
    .max(PRICE_MAX, `Enter a monthly price between $${PRICE_MIN} and $${PRICE_MAX}.`),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  address: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(1, "Enter the apartment address.").max(200, "Address is too long.")),
  roommateGenders: z
    .string()
    .transform(cleanText)
    .pipe(z.union([z.literal(""), z.enum(ROOMMATE_GENDER_OPTIONS)]))
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  contactEmail: z.union([z.literal(""), emailSchema]).optional(),
  contactPhone: phoneSchema.optional(),
  consentToShare: z.boolean(),
});

export type ListingInput = z.infer<typeof listingInputSchema>;

// --- Search filters ---------------------------------------------------------

export type SearchFilters = {
  q?: string;
  campus: CampusArea[];
  term?: Term;
  layout: string;
  priceMin: number;
  priceMax: number;
  bus: string[];
  pet: boolean;
  laundry: boolean;
  parking: boolean;
  roommate?: string;
};

const searchFiltersSchema = z
  .object({
    q: z
      .string()
      .transform(cleanText)
      .pipe(z.string().max(100))
      .optional(),
    campus: z
      .array(z.enum(CAMPUS_VALUES))
      .max(CAMPUS_VALUES.length)
      .default([]),
    term: z.enum(TERM_VALUES).optional(),
    layout: z
      .string()
      .transform((v) => cleanText(v).replace(/\s+/g, " "))
      .pipe(z.string().max(20))
      .default(""),
    priceMin: z.coerce.number().int().min(PRICE_MIN).max(PRICE_MAX).default(PRICE_MIN),
    priceMax: z.coerce.number().int().min(PRICE_MIN).max(PRICE_MAX).default(PRICE_MAX),
    bus: z
      .array(z.enum(BUS_ROUTES))
      .max(BUS_ROUTES.length)
      .default([]),
    pet: z.boolean().default(false),
    laundry: z.boolean().default(false),
    parking: z.boolean().default(false),
    roommate: z.enum(ROOMMATE_GENDER_OPTIONS).optional(),
  })
  .transform((data) => {
    const priceMin = Math.min(data.priceMin, data.priceMax);
    const priceMax = Math.max(data.priceMin, data.priceMax);
    return {
      ...data,
      priceMin,
      priceMax,
      q: data.q || undefined,
      layout: data.layout || "",
    };
  });

type RawSearchParams = Record<string, string | string[] | undefined>;

function searchParamOne(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function searchParamArr(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/** Parse and sanitize URL search params for `/search`. */
export function parseSearchParams(sp: RawSearchParams): SearchFilters {
  const campus = searchParamArr(sp.campus).filter((c): c is (typeof CAMPUS_VALUES)[number] =>
    (CAMPUS_VALUES as readonly string[]).includes(c)
  );
  const bus = searchParamArr(sp.bus).filter((b): b is (typeof BUS_ROUTES)[number] =>
    (BUS_ROUTES as readonly string[]).includes(b)
  );
  const termRaw = searchParamOne(sp.term);
  const term =
    termRaw && (TERM_VALUES as readonly string[]).includes(termRaw)
      ? (termRaw as Term)
      : undefined;
  const roommateRaw = searchParamOne(sp.roommate);
  const roommate =
    roommateRaw && (ROOMMATE_GENDER_OPTIONS as readonly string[]).includes(roommateRaw)
      ? roommateRaw
      : undefined;

  const qRaw = searchParamOne(sp.q);
  const q = qRaw ? cleanText(qRaw).slice(0, 100) : "";
  const layoutRaw = searchParamOne(sp.layout);
  const layout = layoutRaw ? cleanText(layoutRaw).replace(/\s+/g, " ").slice(0, 20) : "";

  const parsed = searchFiltersSchema.safeParse({
    q,
    campus,
    term,
    layout,
    priceMin: searchParamOne(sp.priceMin) ?? PRICE_MIN,
    priceMax: searchParamOne(sp.priceMax) ?? PRICE_MAX,
    bus,
    pet: searchParamOne(sp.pet) === "1",
    laundry: searchParamOne(sp.laundry) === "1",
    parking: searchParamOne(sp.parking) === "1",
    roommate,
  });

  if (parsed.success) return parsed.data;

  return {
    campus: [],
    layout: "",
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
    bus: [],
    pet: false,
    laundry: false,
    parking: false,
  };
}

/** Whitelist bus route values from form submissions. */
export function sanitizeBusRoutes(raw: unknown): string[] {
  const values = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  return values
    .map((v) => cleanText(v))
    .filter((r): r is (typeof BUS_ROUTES)[number] =>
      (BUS_ROUTES as readonly string[]).includes(r)
    );
}

/**
 * Listing photos must be public Vercel Blob URLs that *we* issued — never
 * arbitrary attacker-supplied links (which would enable hotlinking / tracking /
 * stored-XSS-via-redirect vectors). Caps the count to 8.
 */
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function sanitizeImageUrls(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => {
      if (s.length === 0 || s.length > 1000) return false;
      try {
        const u = new URL(s);
        return u.protocol === "https:" && u.hostname.endsWith(BLOB_HOST_SUFFIX);
      } catch {
        return false;
      }
    })
    .slice(0, 8);
}

/** Maps a ZodError to the `{ field: message }` shape the forms expect. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
