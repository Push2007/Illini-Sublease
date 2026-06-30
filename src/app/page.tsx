import Link from "next/link";
import { Search, ShieldCheck, MapPin, BadgeCheck, Bus } from "lucide-react";
import { getFeaturedListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { homePageJsonLd } from "@/lib/json-ld";

export default async function HomePage() {
  const featured = await getFeaturedListings(6);

  return (
    <>
      <JsonLd data={homePageJsonLd()} />
      <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#13294B] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <BadgeCheck className="h-4 w-4 text-[#E84A27]" /> Verified @illinois.edu students only
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Find or fill a UIUC sublease  student to student.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-300">
            Leaving for a semester or an internship? List your apartment. Coming to
            campus? Find a cheap, available room near campus!
          </p>

          <form action="/search" className="mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                name="q"
                placeholder="Search by street, building, or keyword…"
                className="h-12 w-full rounded-lg border-0 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E84A27]"
              />
            </div>
            <Button type="submit" size="lg" className="h-12">Search</Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <QuickLink href="/search?term=WINTER" label="Winter" />
            <QuickLink href="/search?term=FALL" label="Fall" />
            <QuickLink href="/search?term=SPRING" label="Spring" />
            <QuickLink href="/search?term=SUMMER" label="Summer" />
            <QuickLink href="/search?campus=NORTH" label="North (Engineering)" />
            <QuickLink href="/search?priceMax=600" label="Under $600" />
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
          <Feature icon={<ShieldCheck className="h-5 w-5" />} title="For UIUC students" desc="Sign in with your @illinois.edu Google account in order to post a sublease or get the contact info of a subleaser." />
          <Feature icon={<MapPin className="h-5 w-5" />} title="Search by location" desc="Filter by campus area, address keyword, and MTD bus routes, then confirm the spot in person." />
          <Feature icon={<Bus className="h-5 w-5" />} title="Filter by needs" desc="Price, term, layout, MTD bus routes, pets, laundry, parking, and more." />
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Latest subleases</h2>
          <Link href="/search" className="text-sm font-medium text-[#E84A27] hover:underline">
            Browse all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <p className="text-zinc-600">No subleases posted yet. Be the first!</p>
            <Button asChild className="mt-4">
              <Link href="/listings/new">Post a sublease</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
      </main>
    </>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/20 px-3 py-1 text-zinc-200 transition-colors hover:bg-white/10"
    >
      {label}
    </Link>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#E84A27]/10 text-[#E84A27]">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-zinc-900">{title}</p>
        <p className="mt-0.5 text-sm text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}
