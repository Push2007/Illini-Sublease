import Link from "next/link";
import { Search, Home, PlusCircle } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E84A27] text-white">
            <Home className="h-5 w-5" />
          </span>
          <span className="truncate text-base font-extrabold tracking-tight text-[#13294B] sm:text-lg">
            IlliniSublease
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
          <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
            <Link href="/search">
              <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
                <Link href="/dashboard">
                  <span className="hidden sm:inline">My listings</span>
                  <span className="sm:hidden">Listings</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="h-9 w-9 px-0 sm:h-9 sm:w-auto sm:px-3">
                <Link href="/listings/new" aria-label="Post sublease">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Post sublease</span>
                </Link>
              </Button>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="max-w-[160px] truncate text-sm text-zinc-500">
                  {user.name ?? user.email}
                </span>
                <SignOutButton />
              </div>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Log in with Google</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
