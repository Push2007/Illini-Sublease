import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/search");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#13294B]">Welcome</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Sign in with your UIUC Google account to view contact info and post subleases.
        </p>
        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          Only <strong>@illinois.edu</strong> Google accounts are allowed.
        </p>

        <div className="mt-6">
          <GoogleButton label="Continue with Google" />
        </div>
      </div>
    </main>
  );
}
