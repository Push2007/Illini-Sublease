import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewListingForm } from "@/components/new-listing-form";

export const metadata = { title: "Post a sublease" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#13294B]">Post your sublease</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Listed by {session.user.email}. Your contact info stays hidden from the public.
      </p>

      <div className="mt-6">
        <NewListingForm
          userEmail={session.user.email ?? ""}
          googleMapsApiKey={googleMapsApiKey}
        />
      </div>
    </main>
  );
}
