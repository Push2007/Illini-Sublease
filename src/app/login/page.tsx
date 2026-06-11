import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata = { title: "Log in — IlliniSublease" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/search");

  const { verified } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#13294B]">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-500">Log in to view contact info and post subleases.</p>

        {verified && (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Email verified! You can now log in.
          </p>
        )}

        <div className="mt-6">
          <GoogleButton />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200" /> or with email <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-zinc-500">
          New here?{" "}
          <Link href="/signup" className="font-medium text-[#E84A27] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
