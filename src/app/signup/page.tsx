import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata = { title: "Sign up — IlliniSublease" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/search");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#13294B]">
          Join IlliniSublease
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Verified UIUC students only — keeps scammers out.
        </p>

        <div className="mt-6">
          <GoogleButton label="Sign up with Google" />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200" /> or with email <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#E84A27] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
