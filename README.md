# IlliniSublease

> UIUC student-to-student apartment sublease matchmaking — verified `@illinois.edu` only.

## Overview

IlliniSublease is a web app for University of Illinois Urbana-Champaign students who
need to sublease their apartment while they're away (internship, study abroad, summer)
and for students looking for a cheap, available place to live near campus. Posters list
their unit with photos, price, term, and address; searchers filter by what they need and
contact the subleaser directly. Only verified UIUC affiliates with an `@illinois.edu`
Google account can sign in, post listings, or view contact details.

## Features

- **UIUC-only auth** — Google sign-in restricted to `@illinois.edu` addresses.
- **Smart search filters** — campus area (North/South/Urbana/Champaign), term
  (Fall/Spring/Summer), price-range slider, room layout, MTD bus routes, and perks
  (pet-friendly, in-unit laundry, parking, roommate situation), plus keyword search.
- **Photo uploads** — listing photos upload directly to Vercel Blob (up to 8 images per
  listing).
- **Google Places address autocomplete** — posters pick a standardized address from
  Google suggestions; coordinates are saved so "View on map" opens the right location.
- **Listing detail pages** with an image gallery, Google Maps link (address search), and
  full apartment info.
- **Contact info hidden behind login** — a public visitor sees nothing; a logged-in
  UIUC user clicks "Reveal contact info" to see the email/phone.
- **Legal & safety built in** (see below).
- **Owner dashboard** — mark a listing rented, re-activate, or delete it.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind CSS v4**
- **NextAuth v5 (Auth.js)** — Google OAuth only, JWT sessions
- **Prisma 7** + **PostgreSQL** (Neon), via the `pg` driver adapter
- **Vercel Blob** — client-side listing photo uploads
- **Resend** — optional report notification emails (falls back to console logging in dev)
- **Vercel Analytics**

## Legal & compliance

| Requirement | Where it lives |
|---|---|
| Privacy Policy | `/privacy` — Google account data, listing/contact storage, auto-deletion |
| Terms of Service | `/terms` — not the owner, Section 230, limitation of liability, no payments, take-down rights |
| "Consent to Share" checkbox | Required checkbox on the post form (`new-listing-form.tsx`) |
| Contact info behind login | `revealContact()` server action only returns details to signed-in users |
| Automatic data deletion/hiding | Listings auto-expire after their end date / when marked rented; nightly cron at `/api/cron/cleanup` |
| Fair Housing word filter + warning | `src/lib/fair-housing.ts` blocks discriminatory listings; bold warning on the form; `/fair-housing` page |
| Section 230 / no money handled | Stated in `/terms`; the app never processes payments |
| Input sanitization & rate limits | `src/lib/validation.ts`, `src/lib/rate-limit.ts` |
| Secrets in env, HTTPS | All keys in `.env` (git-ignored); Vercel serves over HTTPS |
| "Report this listing" → email | `reportListing()` + `src/lib/email.ts` notify `ADMIN_EMAIL` |
| Footer links on every page | `src/components/site-footer.tsx` (rendered in the root layout) |

## Local development

### 1. Environment variables

Copy `.env.example` to `.env` and fill it in:

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres pooled connection string |
| `AUTH_SECRET` | ✅ | Generate with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ✅ | From Google Cloud Console (see below) |
| `BLOB_READ_WRITE_TOKEN` | ✅ for uploads | Vercel Blob store read/write token |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ for address autocomplete | Google Maps JavaScript API + Places (see below) |
| `RESEND_API_KEY` | optional | Without it, report emails log to the server console |
| `EMAIL_FROM` | optional | Defaults to `onboarding@resend.dev` |
| `ADMIN_EMAIL` | optional | Where listing reports are sent |
| `ALLOWED_EMAIL_DOMAIN` | optional | Defaults to `illinois.edu` |
| `CRON_SECRET` | prod | Protects the cleanup cron endpoint |

### 2. Google OAuth setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (type: Web application).
3. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-vercel-domain>/api/auth/callback/google`
4. Put the client ID/secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

### 3. Google Maps / Places (address autocomplete)

1. In [Google Cloud Console](https://console.cloud.google.com/), enable **Maps JavaScript API** and **Places API (New)**.
2. Create an **API key** and restrict it:
   - **Application restrictions:** HTTP referrers — `http://localhost:3000/*` and `https://<your-vercel-domain>/*`
   - **API restrictions:** Maps JavaScript API + **Places API (New)** only
3. Add the key as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env` and Vercel.

Without this key, the post form falls back to a plain text address field (no autocomplete).

### 4. Install, sync DB, seed, run

```bash
pnpm install
pnpm db:push     # create tables in Neon
pnpm seed        # optional: load demo listings
pnpm dev         # http://localhost:3000
```

Useful scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm db:studio`.

## Deploy to Vercel

1. Push this folder to a GitHub repo and import it in Vercel.
2. Add all `.env` variables in **Vercel → Project → Settings → Environment Variables**
   (set `CRON_SECRET` to a random value in production).
3. Create a **Blob store** in the Vercel project and add `BLOB_READ_WRITE_TOKEN`.
4. Update the Google OAuth redirect URI to your Vercel domain.
5. Deploy. The build runs `prisma generate && next build`.
6. The nightly cleanup cron is configured in `vercel.json` (`/api/cron/cleanup`, 06:00 UTC)
   and is automatically authorized with `CRON_SECRET`.

## Project structure

```
src/
  app/
    page.tsx                 # landing/hero + featured listings
    search/                  # filters + results
    listings/[id]/           # detail (login-gated contact, report)
    listings/new/            # post form (consent + Fair Housing warning)
    listings/actions.ts      # create/reveal/report/status server actions
    dashboard/               # my listings
    login/                   # Google sign-in
    signup, verify/          # redirect to /login (legacy routes)
    auth/actions.ts          # sign-in/sign-out/delete-account actions
    privacy, terms, safety, fair-housing/   # legal pages
    api/auth/[...nextauth]/  # Auth.js handler
    api/upload/              # Vercel Blob upload tokens
    api/cron/cleanup/        # scheduled expiry/cleanup
  auth.ts                    # NextAuth config (Google only)
  components/                # UI, header/footer, forms, listing pieces
  lib/                       # db, listings, maps, fair-housing, email, validation, constants
prisma/schema.prisma         # User, Listing, ListingImage, Report, RateLimit
```

## Notes & limitations

- Listings use free-text addresses. There is no geocoding or distance-from-campus
  enforcement — posters and searchers should confirm location themselves.
- Not affiliated with or endorsed by the University of Illinois. All listings are
  user-generated; the platform never handles payments.
- This is not legal advice. Terms and policies are provided for transparency; consult a
  lawyer for binding guidance.
