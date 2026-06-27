import { SearchFilters, type SearchFilterValues } from "@/components/search-filters";
import { ListingCard } from "@/components/listing-card";
import { searchListings } from "@/lib/listings";
import { parseSearchParams } from "@/lib/validation";

export const metadata = { title: "Search subleases" };

type SP = Record<string, string | string[] | undefined>;

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters = parseSearchParams(sp);

  const filterValues: SearchFilterValues = {
    q: filters.q,
    campus: filters.campus,
    term: filters.term,
    layout: filters.layout,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    bus: filters.bus,
    pet: filters.pet,
    laundry: filters.laundry,
    parking: filters.parking,
    roommate: filters.roommate,
  };

  const listings = await searchListings({
    q: filters.q,
    campusAreas: filters.campus,
    term: filters.term,
    layout: filters.layout || undefined,
    busRoutes: filters.bus,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    petFriendly: filters.pet,
    inUnitLaundry: filters.laundry,
    parkingIncluded: filters.parking,
    roommateGenders: filters.roommate,
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
