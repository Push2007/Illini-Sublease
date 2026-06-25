"use client";

import { useActionState, useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Loader2, ShieldAlert, X } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { createListing, type ListingActionState } from "@/app/listings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BUS_ROUTES,
  CAMPUS_AREAS,
  PRICE_MAX,
  PRICE_MIN,
  ROOMMATE_GENDER_OPTIONS,
  TERMS,
} from "@/lib/constants";

const selectClass =
  "mt-1.5 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E84A27]";

const MAX_IMAGES = 8;

type UploadedImage = { url: string; name: string };

export function NewListingForm({ userEmail }: { userEmail: string }) {
  const [state, formAction, pending] = useActionState<ListingActionState, FormData>(
    createListing,
    undefined
  );
  const err = (f: string) => state?.fieldErrors?.[f];
  // Values echoed back by the server action so a failed submit keeps the
  // user's input (React 19 auto-resets uncontrolled forms after an action).
  const v = state?.values;

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setUploadError(`You can upload up to ${MAX_IMAGES} photos.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of files.slice(0, remaining)) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        uploaded.push({ url: blob.url, name: file.name });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (uploadErr) {
      setUploadError(
        uploadErr instanceof Error ? uploadErr.message : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img.url !== url));
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Fair Housing warning */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
          <AlertTriangle className="h-4 w-4" /> All listings must follow Fair Housing laws
        </p>
        <p className="mt-1 text-xs leading-relaxed text-amber-800">
          Discrimination based on race, color, religion, sex, national origin, familial
          status, or disability is strictly forbidden. Listings with discriminatory
          language will be blocked.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <section className="space-y-4">
        <div>
          <Label htmlFor="title">Listing title</Label>
          <Input id="title" name="title" defaultValue={v?.title} placeholder="Sunny 1-bed near Grainger, summer sublease" className="mt-1.5" required />
          {err("title") && <p className="mt-1 text-xs text-red-600">{err("title")}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={v?.description} placeholder="Describe the apartment, what's included, why you're subleasing…" className="mt-1.5" required />
          {err("description") && <p className="mt-1 text-xs text-red-600">{err("description")}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="campusArea">Campus area</Label>
            <select id="campusArea" name="campusArea" className={selectClass} required defaultValue={v?.campusArea ?? ""}>
              <option value="" disabled>Select…</option>
              {CAMPUS_AREAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label} ({c.hint})</option>
              ))}
            </select>
            {err("campusArea") && <p className="mt-1 text-xs text-red-600">{err("campusArea")}</p>}
          </div>
          <div>
            <Label htmlFor="term">Time period</Label>
            <select id="term" name="term" className={selectClass} required defaultValue={v?.term ?? ""}>
              <option value="" disabled>Select…</option>
              {TERMS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {err("term") && <p className="mt-1 text-xs text-red-600">{err("term")}</p>}
          </div>
          <div>
            <Label htmlFor="layout">Room layout</Label>
            <Input id="layout" name="layout" defaultValue={v?.layout} placeholder="4x4, 4x2, 2x2, etc." className="mt-1.5" maxLength={20} required />
            <p className="mt-1 text-xs text-zinc-500">Beds × baths, e.g. 4x4 (4 bed/4 bath).</p>
            {err("layout") && <p className="mt-1 text-xs text-red-600">{err("layout")}</p>}
          </div>
          <div>
            <Label htmlFor="priceMonthly">Monthly rent ($)</Label>
            <Input id="priceMonthly" name="priceMonthly" type="number" min={PRICE_MIN} max={PRICE_MAX} defaultValue={v?.priceMonthly} placeholder="650" className="mt-1.5" required />
            {err("priceMonthly") && <p className="mt-1 text-xs text-red-600">{err("priceMonthly")}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <Label htmlFor="address">Apartment address</Label>
            <Input id="address" name="address" defaultValue={v?.address} placeholder="509 E Green St, Champaign, IL" className="mt-1.5" required />
            <p className="mt-1 text-xs text-zinc-500">Street address or building name — however you&apos;d tell a friend to find it.</p>
            {err("address") && <p className="mt-1 text-xs text-red-600">{err("address")}</p>}
          </div>
          <div>
            <Label htmlFor="bedrooms">Total bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" min={0} max={10} defaultValue={v?.bedrooms} placeholder="4" className="mt-1.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="availableFrom">Available from</Label>
            <Input id="availableFrom" name="availableFrom" type="date" defaultValue={v?.availableFrom} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="availableTo">Available until</Label>
            <Input id="availableTo" name="availableTo" type="date" defaultValue={v?.availableTo} className="mt-1.5" />
            <p className="mt-1 text-xs text-zinc-500">Listing auto-hides after this date.</p>
          </div>
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold text-zinc-800">Nearby MTD bus routes</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BUS_ROUTES.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="busRoutes" value={b} defaultChecked={v?.busRoutes.includes(b)} className="accent-[#E84A27]" /> {b}
            </label>
          ))}
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold text-zinc-800">Perks</p>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="petFriendly" defaultChecked={v?.petFriendly} className="accent-[#E84A27]" /> Pet-friendly
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="inUnitLaundry" defaultChecked={v?.inUnitLaundry} className="accent-[#E84A27]" /> In-unit laundry
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="parkingIncluded" defaultChecked={v?.parkingIncluded} className="accent-[#E84A27]" /> Parking included
          </label>
        </div>
        <div className="mt-4 max-w-xs">
          <Label htmlFor="roommateGenders">Roommate situation</Label>
          <select id="roommateGenders" name="roommateGenders" className={selectClass} defaultValue={v?.roommateGenders ?? ""}>
            <option value="">Not specified</option>
            {ROOMMATE_GENDER_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold text-zinc-800">Photos</p>
        <p className="mt-1 text-xs text-zinc-500">
          Upload up to {MAX_IMAGES} photos from your computer (JPG, PNG, WebP, GIF — max 8MB each).
        </p>

        {/* Uploaded blob URLs are submitted to the server action via this hidden field. */}
        <input type="hidden" name="imageUrls" value={images.map((i) => i.url).join("\n")} />

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={`Remove ${img.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 text-zinc-500 transition-colors hover:border-[#E84A27] hover:text-[#E84A27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Uploading…</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-xs">Add photos</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />

        {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={v?.contactEmail ?? userEmail} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contactPhone">Contact phone (optional)</Label>
            <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={v?.contactPhone} placeholder="(217) 555-0123" className="mt-1.5" />
          </div>
        </div>

        {/* Consent to share */}
        <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <input type="checkbox" name="consentToShare" defaultChecked={v?.consentToShare} className="mt-0.5 accent-[#E84A27]" />
          <span>
            <span className="flex items-center gap-1.5 font-semibold text-zinc-900">
              <ShieldAlert className="h-4 w-4 text-[#E84A27]" /> Consent to share
            </span>
            I agree to let this website show my email and phone number to logged-in
            UIUC users so they can contact me about this sublease.
          </span>
        </label>
        {err("consentToShare") && <p className="text-xs text-red-600">{err("consentToShare")}</p>}
      </section>

      <Button type="submit" size="lg" disabled={pending || uploading} className="w-full">
        {pending ? "Posting…" : uploading ? "Uploading photos…" : "Post sublease"}
      </Button>
    </form>
  );
}
