"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bus, PawPrint, WashingMachine, Car, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BUS_ROUTES,
  CAMPUS_AREAS,
  PRICE_MAX,
  PRICE_MIN,
  ROOM_LAYOUTS,
  ROOMMATE_GENDER_OPTIONS,
  TERMS,
} from "@/lib/constants";

export type SearchFilterValues = {
  q?: string;
  campus: string[];
  term?: string;
  layout: string[];
  priceMin: number;
  priceMax: number;
  bus: string[];
  pet: boolean;
  laundry: boolean;
  parking: boolean;
  roommate?: string;
};

export function SearchFilters({ initial }: { initial: SearchFilterValues }) {
  const router = useRouter();
  const [priceMin, setPriceMin] = useState(initial.priceMin);
  const [priceMax, setPriceMax] = useState(initial.priceMax);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      const v = String(value);
      if (v) params.append(key, v);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="q">Keyword</Label>
        <Input id="q" name="q" defaultValue={initial.q} placeholder="e.g. Green St, balcony…" className="mt-1.5" />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-800">Campus location</legend>
        <div className="mt-2 space-y-1.5">
          {CAMPUS_AREAS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="campus" value={c.value} defaultChecked={initial.campus.includes(c.value)} className="accent-[#E84A27]" />
              {c.label} <span className="text-xs text-zinc-400">({c.hint})</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-800">Time period</legend>
        <div className="mt-2 space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="radio" name="term" value="" defaultChecked={!initial.term} className="accent-[#E84A27]" /> Any term
          </label>
          {TERMS.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="radio" name="term" value={t.value} defaultChecked={initial.term === t.value} className="accent-[#E84A27]" />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-800">
          Price range: ${priceMin} – ${priceMax}/mo
        </legend>
        <div className="mt-3 space-y-3">
          <div>
            <span className="text-xs text-zinc-500">Min</span>
            <input type="range" name="priceMin" min={PRICE_MIN} max={PRICE_MAX} step={25} value={priceMin}
              onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
              className="w-full accent-[#E84A27]" />
          </div>
          <div>
            <span className="text-xs text-zinc-500">Max</span>
            <input type="range" name="priceMax" min={PRICE_MIN} max={PRICE_MAX} step={25} value={priceMax}
              onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
              className="w-full accent-[#E84A27]" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-800">Room layout</legend>
        <div className="mt-2 space-y-1.5">
          {ROOM_LAYOUTS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="layout" value={r.value} defaultChecked={initial.layout.includes(r.value)} className="accent-[#E84A27]" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
          <Bus className="h-4 w-4" /> MTD bus routes
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {BUS_ROUTES.map((b) => (
            <label key={b} className="flex items-center gap-2 text-xs text-zinc-700">
              <input type="checkbox" name="bus" value={b} defaultChecked={initial.bus.includes(b)} className="accent-[#E84A27]" />
              {b}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-800">Perks</legend>
        <div className="mt-2 space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="pet" value="1" defaultChecked={initial.pet} className="accent-[#E84A27]" />
            <PawPrint className="h-4 w-4" /> Pet-friendly
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="laundry" value="1" defaultChecked={initial.laundry} className="accent-[#E84A27]" />
            <WashingMachine className="h-4 w-4" /> In-unit laundry
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="parking" value="1" defaultChecked={initial.parking} className="accent-[#E84A27]" />
            <Car className="h-4 w-4" /> Parking included
          </label>
        </div>
      </fieldset>

      <div>
        <Label htmlFor="roommate">Roommates</Label>
        <select
          id="roommate"
          name="roommate"
          defaultValue={initial.roommate ?? ""}
          className="mt-1.5 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E84A27]"
        >
          <option value="">Any</option>
          {ROOMMATE_GENDER_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" className="flex-1">Apply filters</Button>
        <Button type="button" variant="outline" size="icon" onClick={() => router.push("/search")} aria-label="Reset filters">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
