import { SearchFilters, type SearchFilterValues } from "@/components/search-filters";
import { ListingCard } from "@/components/listing-card";
import { searchListings } from "@/lib/listings";
import { PRICE_MAX, PRICE_MIN } from "@/lib/constants";
import type { CampusArea, RoomLayout, Term } from "@/generated/prisma/enums";

export const metadata = { title: "Search subleases — IlliniSublease" };

const CAMPUS = ["NORTH", "SOUTH", "URBANA", "CHAMPAIGN"];
const TERMS = ["FALL", "SPRING", "SUMMER"];
const LAYOUTS = ["STUDIO", "ONE_BED", "TWO_BED", "ROOM_IN_SHARED"];

type SP = Record<string, string | string[] | undefined>;
const arr = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  const campus = arr(sp.campus).filter((c) => CAMPUS.includes(c));
  const layout = arr(sp.layout).filter((l) => LAYOUTS.includes(l));
  const bus = arr(sp.bus);
  const term = TERMS.includes(one(sp.term) ?? "") ? (one(sp.term) as Term) : undefined;
  const priceMin = Number(one(sp.priceMin)) || PRICE_MIN;
  const priceMax = Number(one(sp.priceMax)) || PRICE_MAX;
  const roommate = one(sp.roommate) || undefined;
  const q = one(sp.q) || undefined;

  const filterValues: SearchFilterValues = {
    q,
    campus,
    term,
    layout,
    priceMin,
    priceMax,
    bus,
    pet: one(sp.pet) === "1",
    laundry: one(sp.laundry) === "1",
    parking: one(sp.parking) === "1",
    roommate,
  };

  const listings = await searchListings({
    q,
    campusAreas: campus as CampusArea[],
    term,
    layouts: layout as RoomLayout[],
    busRoutes: bus,
    priceMin,
    priceMax,
    petFriendly: filterValues.pet,
    inUnitLaundry: filterValues.laundry,
    parkingIncluded: filterValues.parking,
    roommateGenders: roommate,
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#13294B]">Filters</h2>
            <SearchFilters initial={filterValues} />
          </div>
        </aside>

        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Subleases</h1>
            <p className="text-sm text-zinc-500">
              {listings.length} {listings.length === 1 ? "result" : "results"}
            </p>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <p className="text-zinc-600">No subleases match your filters yet.</p>
              <p className="mt-1 text-sm text-zinc-400">Try widening your price range or clearing filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
