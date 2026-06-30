# Illini Sublease

> UIUC student-to-student apartment sublease matchmaking — verified `@illinois.edu` only.

**Live site:** [illini-sublease.vercel.app](https://illini-sublease.vercel.app)  
**Operator:** PushTangle LLC (`IlliniSublease` is the alternate spelling used in code and URLs)

Illini Sublease is **not affiliated with, endorsed by, or operated by** the University of Illinois Urbana-Champaign or the Board of Trustees of the University of Illinois.

## Overview

A web app for University of Illinois Urbana-Champaign students who need to sublease an apartment while away (internship, study abroad, winter/summer break) and for students looking for a short-term place near campus. Posters list their unit with photos, price, term, and address; searchers filter by what they need and contact the subleaser directly. Only verified UIUC affiliates with an `@illinois.edu` Google account can sign in, post listings, or view contact details.

## Features

- **UIUC-only auth** — Google sign-in restricted to `@illinois.edu` (configurable via `ALLOWED_EMAIL_DOMAIN`).
- **Smart search filters** — campus area (North / South / Urbana / Champaign), term (Fall / Spring / Summer / **Winter**), price range, room layout, MTD bus routes, perks (pet-friendly, in-unit laundry, parking, roommate situation), and keyword search on title/address/description.
- **Photo uploads** — up to 8 images per listing, uploaded client-side to **Vercel Blob** via `/api/upload`.
- **Google Places address autocomplete** — posters select a standardized address from Google suggestions; lat/lng are stored for validation. **View on map** opens Google Maps using the **street address**, not raw coordinates.
- **Listing detail pages** — image gallery, Google Maps link, full apartment info, report button.
- **Contact info behind login** — public visitors see listings but not contact details; logged-in UIUC users click **Reveal contact info**.
- **Owner dashboard** — mark a listing rented, re-activate, delete listings, or delete your entire account.
- **Legal & safety** — privacy policy, terms, fair housing, safety tips, and a registered **DMCA** policy (see below).
- **SEO** — dynamic `/sitemap.xml`, `/robots.txt`, homepage JSON-LD structured data, Google Search Console verification.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** |
| Styling | **Tailwind CSS v4** |
| Auth | **NextAuth v5 (Auth.js)** — Google OAuth only, JWT sessions |
| Database | **Prisma 7** + **PostgreSQL** (Neon), `@prisma/adapter-pg` + `pg` |
| Storage | **Vercel Blob** — listing photos |
| Email | **Resend** — optional report notifications (console fallback in dev) |
| Analytics | **Vercel Analytics** |
| Package manager | **pnpm** |

## Legal & compliance

| Requirement | Where it lives |
|---|---|
| Privacy Policy | `/privacy` — Google OAuth data, listing/contact storage, auto-deletion, account deletion |
| Terms of Service | `/terms` — **no UIUC affiliation**, Section 230, limitation of liability, no payments, DMCA reference |
| Copyright & DMCA | `/dmca` — designated agent, infringement notices, counter-notification, repeat infringers |
| Fair Housing | `/fair-housing` + `src/lib/fair-housing.ts` word filter + form warning |
| Safety & scams | `/safety` |
| Consent to Share | Required checkbox on the post form before contact info can be shown |
| Contact info gated | `revealContact()` server action — signed-in users only |
| Data lifecycle | Listings hidden when marked rented or past end date; nightly cron at `/api/cron/cleanup` |
| Input sanitization & rate limits | `src/lib/validation.ts`, `src/lib/rate-limit.ts` |
| Report listing → email | `reportListing()` + `src/lib/email.ts` → `ADMIN_EMAIL` |
| Footer legal links | `src/components/site-footer.tsx` on every page |
| Non-affiliation disclaimer | Footer, Terms §1, and this README |

Legal contact constants live in `src/lib/legal.ts` (site name, operator, DMCA agent email).

## Local development

### 1. Environment variables

Copy `.env.example` to `.env` (and optionally `.env.local`) and fill it in:

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres **pooled** connection string |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth web client (see below) |
| `BLOB_READ_WRITE_TOKEN` | ✅ for uploads | From a Vercel Blob store |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ for autocomplete | Maps JavaScript API + Places API (New) |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL, e.g. `https://illini-sublease.vercel.app` — used by sitemap, robots, metadata |
| `RESEND_API_KEY` | optional | Without it, report emails log to the server console |
| `EMAIL_FROM` | optional | Defaults to `UIUC Sublease <onboarding@resend.dev>` |
| `ADMIN_EMAIL` | optional | Recipient for listing reports |
| `ALLOWED_EMAIL_DOMAIN` | optional | Defaults to `illinois.edu` |
| `CRON_SECRET` | prod | Protects `/api/cron/cleanup` |

### 2. Google OAuth

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) → **OAuth 2.0 Client ID** (Web application).
2. **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google`
   - `https://illini-sublease.vercel.app/api/auth/callback/google` (or your custom domain)
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

Only basic profile scopes are requested (name, email, photo) — no Gmail or Drive access.

### 3. Google Maps / Places (address autocomplete)

1. Enable **Maps JavaScript API** and **Places API (New)** on the same Google Cloud project.
2. Create an API key restricted to:
   - **HTTP referrers:** `http://localhost:3000/*`, `https://illini-sublease.vercel.app/*`, and `https://*.vercel.app/*` for preview deploys
   - **APIs:** Maps JavaScript API + Places API (New) only
3. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env` and Vercel, then redeploy.

Without the key, the post form falls back to a plain text address field.

### 4. Install, sync DB, seed, run

```bash
pnpm install
pnpm db:push     # create/update tables in Neon
pnpm seed        # optional demo listings
pnpm dev         # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm db:studio`.

After changing `prisma/schema.prisma`, run `pnpm db:push` and restart the dev server so the Prisma client picks up enum changes.

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add all environment variables from `.env.example` under **Project → Settings → Environment Variables** (Production + Preview as needed). Set `CRON_SECRET` to a random value in production.
3. Create/link a **Blob store** and ensure `BLOB_READ_WRITE_TOKEN` is set for Production.
4. Set `NEXT_PUBLIC_SITE_URL=https://illini-sublease.vercel.app` (or your custom domain).
5. Add your production OAuth redirect URI and Maps API referrer (see above).
6. Deploy — build runs `prisma generate && next build`.
7. Confirm `/sitemap.xml` and `/robots.txt` on the live domain; submit `sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

Nightly cleanup is configured in `vercel.json`: `/api/cron/cleanup` at **06:00 UTC**, authorized with `CRON_SECRET`.

## Project structure

```
src/
  app/
    page.tsx                    # landing + featured listings + JSON-LD
    layout.tsx                  # root layout, metadata, header/footer
    sitemap.ts / robots.ts      # SEO routes
    search/                     # filters + results
    listings/[id]/              # detail (gallery, map link, reveal contact, report)
    listings/new/               # post form (autocomplete, consent, fair housing)
    listings/actions.ts         # create / reveal / report / status server actions
    dashboard/                  # my listings, delete account
    login/                      # Google sign-in
    signup/, verify/            # redirect to /login (legacy routes)
    privacy/, terms/, safety/, fair-housing/, dmca/   # legal pages
    api/auth/[...nextauth]/     # Auth.js handler
    api/upload/                 # Vercel Blob client upload tokens
    api/cron/cleanup/           # scheduled listing cleanup
  auth.ts                       # NextAuth config (Google only)
  components/                   # UI, header/footer, forms, listing cards
  lib/
    db.ts, listings.ts          # Prisma client + queries
    validation.ts, rate-limit.ts
    google-maps.ts, maps.ts     # Places autocomplete + map URLs
    fair-housing.ts, email.ts
    legal.ts, json-ld.ts, site-url.ts
prisma/schema.prisma            # User, Listing, ListingImage, Report, RateLimit, VerificationCode
vercel.json                     # cron schedule
pnpm-workspace.yaml             # pnpm overrides for dependency security patches
```

## Notes & limitations

- Addresses come from Google Places autocomplete when configured; there is **no geocoding radius check** or distance-from-campus enforcement — confirm locations in person.
- Listings and photos are user-generated; the platform does not verify leases, inspect units, or handle payments.
- `@illinois.edu` verification limits who can post and view contacts; it is not an endorsement by the university.
- This README and on-site policies are for transparency only — **not legal advice**.
