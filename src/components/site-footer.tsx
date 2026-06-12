import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-[#13294B]">IlliniSublease</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              A student-to-student sublease board for the University of Illinois
              Urbana-Champaign. We are not a broker or landlord and we never handle
              payments. Verify everything before you pay anyone.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <Link href="/search" className="text-zinc-600 hover:text-zinc-900">
              Search subleases
            </Link>
            <Link href="/listings/new" className="text-zinc-600 hover:text-zinc-900">
              Post a sublease
            </Link>
            <Link href="/privacy" className="text-zinc-600 hover:text-zinc-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-600 hover:text-zinc-900">
              Terms of Service
            </Link>
            <Link href="/safety" className="text-zinc-600 hover:text-zinc-900">
              Safety &amp; scams
            </Link>
            <Link href="/fair-housing" className="text-zinc-600 hover:text-zinc-900">
              Fair Housing
            </Link>
          </nav>
        </div>

        <p className="mt-6 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} PushTangle LLC. IlliniSublease is operated by
          PushTangle LLC and is not affiliated with or endorsed by the University of
          Illinois. All listings are user-generated.
        </p>
      </div>
    </footer>
  );
}
