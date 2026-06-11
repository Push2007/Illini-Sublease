import Link from "next/link";
import { redirect } from "next/navigation";
import { VerifyForm } from "@/components/auth/verify-form";

export const metadata = { title: "Verify your email — IlliniSublease" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/signup");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#13294B]">Check your email</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter the code we sent to verify your account.</p>

        <div className="mt-6">
          <VerifyForm email={email} />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Wrong email?{" "}
          <Link href="/signup" className="font-medium text-[#E84A27] hover:underline">
            Start over
          </Link>
        </p>
      </div>
    </main>
  );
}
