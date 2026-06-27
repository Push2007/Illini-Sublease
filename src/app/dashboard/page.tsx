import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { getListingsForUser } from "@/lib/listings";
import { campusAreaLabel, roomLayoutLabel, termLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingManageActions } from "@/components/listing-manage-actions";
import { DeleteAccount } from "@/components/delete-account";

export const metadata = { title: "My listings" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listings = await getListingsForUser(session.user.id);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#13294B]">My listings</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your subleases and contact visibility.</p>
        </div>
        <Button asChild>
          <Link href="/listings/new">
            <PlusCircle className="h-4 w-4" /> Post sublease
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-zinc-600">You haven&apos;t posted any subleases yet.</p>
          <Button asChild className="mt-4">
            <Link href="/listings/new">Post your first sublease</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">
              <div className="h-28 w-full flex-none overflow-hidden rounded-lg bg-zinc-100 sm:w-40">
                {l.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0].url} alt={l.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-300">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/listings/${l.id}`} className="font-semibold text-zinc-900 hover:underline">
                    {l.title}
                  </Link>
                  <span className="font-bold text-[#13294B]">{formatPrice(l.priceMonthly)}/mo</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge className={l.status === "ACTIVE" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                    {l.status}
                  </Badge>
                  <Badge>{campusAreaLabel(l.campusArea)}</Badge>
                  <Badge>{termLabel(l.term)}</Badge>
                  <Badge>{roomLayoutLabel(l.roomLayout)}</Badge>
                </div>
                <div className="mt-auto pt-3">
                  <ListingManageActions listingId={l.id} status={l.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-12 border-t border-zinc-200 pt-8">
        <DeleteAccount />
      </section>
    </main>
  );
}
