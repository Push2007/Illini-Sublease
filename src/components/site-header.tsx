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
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E84A27] text-white">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#13294B]">
            IlliniSublease
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/search">
              <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">My listings</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/listings/new">
                  <PlusCircle className="h-4 w-4" /> Post sublease
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
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
