# IlliniSublease

> UIUC student-to-student apartment sublease matchmaking — verified `@illinois.edu` only.

## Overview

IlliniSublease is a web app for University of Illinois Urbana-Champaign students who
need to sublease their apartment while they're away (internship, study abroad, summer)
and for students looking for a cheap, available place to live near campus. Posters list
their unit with photos, price, term, and location; searchers filter by exactly what they
need and contact the subleaser directly. Only verified UIUC students (`@illinois.edu`)
can sign in, list, or view contact details — which keeps scammers out.

## Features

- **UIUC-only auth** — email + password (bcrypt-hashed) with an emailed 6-digit
  verification code, **and** Google sign-in. Both are restricted to `@illinois.edu`.
- **Smart search filters** — campus area (North/South/Urbana/Champaign), term
  (Fall/Spring/Summer), price-range slider, room layout, MTD bus routes, and perks
  (pet-friendly, in-unit laundry, parking, roommate situation), plus keyword search.
- **20-mile radius enforcement** — every listing's address is geocoded and rejected if
  it's more than 20 miles from campus (901 W. Illinois St.).
- **Listing detail pages** with an image gallery, map link, and full apartment info.
- **Contact info hidden behind login** — a public visitor sees nothing; a logged-in
  UIUC user clicks "Reveal contact info" to see the email/phone.
- **Legal & safety built in** (see below).
- **Owner dashboard** — mark a listing rented, re-activate, or delete it.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind CSS v4**
- **NextAuth v5 (Auth.js)** — Google OAuth + Credentials provider, JWT sessions
- **bcryptjs** — password hashing
- **Prisma 7** + **PostgreSQL** (Neon), via the `pg` driver adapter
- **Resend** — verification + report emails (falls back to console logging in dev)

## Legal & compliance (mapped to requirements)

| Requirement | Where it lives |
|---|---|
| Privacy Policy | `/privacy` — data collected, bcrypt storage, public contact sharing, auto-deletion |
| Terms of Service | `/terms` — not the owner, Section 230, no payments, take-down rights |
| "Consent to Share" checkbox | Required checkbox on the post form (`new-listing-form.tsx`) |
| Contact info behind login | `revealContact()` server action only returns details to signed-in users |
| Automatic data deletion/hiding | Listings auto-expire after their end date / when marked rented; nightly cron at `/api/cron/cleanup` |
| Fair Housing word filter + warning | `src/lib/fair-housing.ts` blocks discriminatory listings; bold warning on the form; `/fair-housing` page |
| Section 230 / no money handled | Stated in `/terms`; the app never processes payments |
| bcrypt password hashing | `src/auth.ts`, `src/app/auth/actions.ts` |
| Secrets in env, HTTPS | All keys in `.env` (git-ignored); Vercel serves over HTTPS |
| "Report this listing" → email | `reportListing()` + `src/lib/email.ts` notify `ADMIN_EMAIL` |
| Footer links on every page | `src/components/site-footer.tsx` (rendered in the root layout) |

## Local development

### 1. Environment variables

Copy `.env.example` to `.env` and fill it in. The Neon database is already provisioned and
`DATABASE_URL` / `AUTH_SECRET` are set. You still need:

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ (set) | Neon Postgres pooled connection string |
| `AUTH_SECRET` | ✅ (set) | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | for Google login | From Google Cloud Console (see below) |
| `RESEND_API_KEY` | optional in dev | Without it, verification codes print to the server console |
| `EMAIL_FROM` | optional | Defaults to `onboarding@resend.dev` |
| `ADMIN_EMAIL` | optional | Where listing reports are sent |
| `ALLOWED_EMAIL_DOMAIN` | optional | Defaults to `illinois.edu` |
| `CRON_SECRET` | prod | Protects the cleanup cron endpoint |

> **Dev tip:** With no `RESEND_API_KEY`, sign up and the 6-digit code is printed in your
> terminal where `pnpm dev` is running — paste it into the verify screen.

### 2. Google OAuth setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (type: Web application).
3. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-vercel-domain>/api/auth/callback/google`
4. Put the client ID/secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

### 3. Install, sync DB, seed, run

```bash
pnpm install
pnpm db:push     # create tables in Neon
pnpm seed        # optional: load 4 demo listings
pnpm dev         # http://localhost:3000
```

Useful scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm db:studio`.

## Deploy to Vercel

1. Push this folder to a GitHub repo and import it in Vercel.
2. Add all `.env` variables in **Vercel → Project → Settings → Environment Variables**
   (set `CRON_SECRET` to a random value in production).
3. Update the Google OAuth redirect URI to your Vercel domain.
4. Deploy. The build runs `prisma generate && next build`.
5. The nightly cleanup cron is configured in `vercel.json` (`/api/cron/cleanup`, 06:00 UTC)
   and is automatically authorized with `CRON_SECRET`.

## Project structure

```
src/
  app/
    page.tsx                 # landing/hero + latest listings
    search/                  # filters + results
    listings/[id]/           # detail (login-gated contact, report)
    listings/new/            # post form (consent + Fair Housing warning)
    listings/actions.ts      # create/reveal/report/status server actions
    dashboard/               # my listings
    login, signup, verify/   # auth screens
    auth/actions.ts          # signup/verify/login server actions
    privacy, terms, safety, fair-housing/   # legal pages
    api/auth/[...nextauth]/  # Auth.js handler
    api/cron/cleanup/        # scheduled expiry/cleanup
  auth.ts                    # NextAuth config (Google + Credentials)
  components/                # UI, header/footer, forms, listing pieces
  lib/                       # db, listings, geo, geocode, fair-housing, email, constants
prisma/schema.prisma         # User, VerificationCode, Listing, ListingImage, Report
```

## Notes & limitations

- Photos are added as URLs (paste links). Swapping to file uploads (e.g. Vercel Blob) is a
  natural next step.
- Geocoding uses the free OpenStreetMap Nominatim API; for heavy traffic, switch to a keyed
  geocoder.
- Not affiliated with or endorsed by the University of Illinois. All listings are
  user-generated; the platform never handles payments.
```
