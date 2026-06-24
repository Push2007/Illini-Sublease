import { z } from "zod";
import { PRICE_MAX, PRICE_MIN } from "@/lib/constants";

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

const CAMPUS_VALUES = ["NORTH", "SOUTH", "URBANA", "CHAMPAIGN"] as const;
const TERM_VALUES = ["FALL", "SPRING", "SUMMER"] as const;

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
  roommateGenders: z.string().transform(cleanText).pipe(z.string().max(60)).optional(),
  contactEmail: z.union([z.literal(""), emailSchema]).optional(),
  contactPhone: phoneSchema.optional(),
  consentToShare: z.boolean(),
});

export type ListingInput = z.infer<typeof listingInputSchema>;

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
