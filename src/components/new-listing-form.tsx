"use client";

import { useActionState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
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
  ROOM_LAYOUTS,
  ROOMMATE_GENDER_OPTIONS,
  TERMS,
} from "@/lib/constants";

const selectClass =
  "mt-1.5 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E84A27]";

export function NewListingForm({ userEmail }: { userEmail: string }) {
  const [state, formAction, pending] = useActionState<ListingActionState, FormData>(
    createListing,
    undefined
  );
  const err = (f: string) => state?.fieldErrors?.[f];

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
          <Input id="title" name="title" placeholder="Sunny 1-bed near Grainger, summer sublease" className="mt-1.5" required />
          {err("title") && <p className="mt-1 text-xs text-red-600">{err("title")}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Describe the apartment, what's included, why you're subleasing…" className="mt-1.5" required />
          {err("description") && <p className="mt-1 text-xs text-red-600">{err("description")}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="campusArea">Campus area</Label>
            <select id="campusArea" name="campusArea" className={selectClass} required defaultValue="">
              <option value="" disabled>Select…</option>
              {CAMPUS_AREAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label} ({c.hint})</option>
              ))}
            </select>
            {err("campusArea") && <p className="mt-1 text-xs text-red-600">{err("campusArea")}</p>}
          </div>
          <div>
            <Label htmlFor="term">Time period</Label>
            <select id="term" name="term" className={selectClass} required defaultValue="">
              <option value="" disabled>Select…</option>
              {TERMS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {err("term") && <p className="mt-1 text-xs text-red-600">{err("term")}</p>}
          </div>
          <div>
            <Label htmlFor="roomLayout">Room layout</Label>
            <select id="roomLayout" name="roomLayout" className={selectClass} required defaultValue="">
              <option value="" disabled>Select…</option>
              {ROOM_LAYOUTS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {err("roomLayout") && <p className="mt-1 text-xs text-red-600">{err("roomLayout")}</p>}
          </div>
          <div>
            <Label htmlFor="priceMonthly">Monthly rent ($)</Label>
            <Input id="priceMonthly" name="priceMonthly" type="number" min={PRICE_MIN} max={PRICE_MAX} placeholder="650" className="mt-1.5" required />
            {err("priceMonthly") && <p className="mt-1 text-xs text-red-600">{err("priceMonthly")}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <Label htmlFor="address">Apartment address</Label>
            <Input id="address" name="address" placeholder="509 E Green St, Champaign, IL" className="mt-1.5" required />
            <p className="mt-1 text-xs text-zinc-500">Must be within 20 miles of campus. We verify the location.</p>
            {err("address") && <p className="mt-1 text-xs text-red-600">{err("address")}</p>}
          </div>
          <div>
            <Label htmlFor="bedrooms">Total bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" min={0} max={10} placeholder="4" className="mt-1.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="availableFrom">Available from</Label>
            <Input id="availableFrom" name="availableFrom" type="date" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="availableTo">Available until</Label>
            <Input id="availableTo" name="availableTo" type="date" className="mt-1.5" />
            <p className="mt-1 text-xs text-zinc-500">Listing auto-hides after this date.</p>
          </div>
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold text-zinc-800">Nearby MTD bus routes</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BUS_ROUTES.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="busRoutes" value={b} className="accent-[#E84A27]" /> {b}
            </label>
          ))}
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold text-zinc-800">Perks</p>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="petFriendly" className="accent-[#E84A27]" /> Pet-friendly
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="inUnitLaundry" className="accent-[#E84A27]" /> In-unit laundry
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="parkingIncluded" className="accent-[#E84A27]" /> Parking included
          </label>
        </div>
        <div className="mt-4 max-w-xs">
          <Label htmlFor="roommateGenders">Roommate situation</Label>
          <select id="roommateGenders" name="roommateGenders" className={selectClass} defaultValue="">
            <option value="">Not specified</option>
            {ROOMMATE_GENDER_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <Label htmlFor="imageUrls">Photo URLs (one per line)</Label>
        <Textarea
          id="imageUrls"
          name="imageUrls"
          placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
          className="mt-1.5 font-mono text-xs"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Paste links to your apartment photos (e.g. from Google Photos, Imgur). Up to 8.
        </p>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={userEmail} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contactPhone">Contact phone (optional)</Label>
            <Input id="contactPhone" name="contactPhone" type="tel" placeholder="(217) 555-0123" className="mt-1.5" />
          </div>
        </div>

        {/* Consent to share */}
        <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <input type="checkbox" name="consentToShare" className="mt-0.5 accent-[#E84A27]" />
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

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Posting…" : "Post sublease"}
      </Button>
    </form>
  );
}
