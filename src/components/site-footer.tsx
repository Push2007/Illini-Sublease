import Link from "next/link";
import { DMCA_AGENT_EMAIL, OPERATOR, SITE_NAME, SITE_NAME_ALT } from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-[#13294B]">{SITE_NAME}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              An independent student-to-student sublease board for the University of Illinois
              Urbana-Champaign community. <strong className="font-medium text-zinc-600">Not
              affiliated with or endorsed by the University of Illinois.</strong> We are not a
              broker or landlord and we never handle payments. Verify everything before you pay
              anyone.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Site administrator:{" "}
              <a
                href="mailto:pushkar2@illinois.edu"
                className="font-medium text-[#13294B] hover:underline"
              >
                pushkar2@illinois.edu
              </a>
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
            <Link href="/dmca" className="text-zinc-600 hover:text-zinc-900">
              Copyright &amp; DMCA
            </Link>
          </nav>
        </div>

        <p className="mt-6 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} {OPERATOR}. {SITE_NAME} ({SITE_NAME_ALT}) is
          operated by {OPERATOR} and is <strong className="font-medium">not affiliated with,
          endorsed by, or operated by</strong> the University of Illinois Urbana-Champaign or
          the Board of Trustees of the University of Illinois. All listings are user-generated.
          DMCA agent:{" "}
          <a href={`mailto:${DMCA_AGENT_EMAIL}`} className="hover:text-zinc-600 hover:underline">
            {DMCA_AGENT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}
