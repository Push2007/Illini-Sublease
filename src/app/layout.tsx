import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@vercel/analytics/next";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Illini Sublease — UIUC student sublease matchmaking",
    template: "%s — Illini Sublease",
  },
  description:
    "Find and post short-term apartment subleases near the University of Illinois Urbana-Champaign. Verified @illinois.edu students only.",
  openGraph: {
    siteName: "Illini Sublease",
    type: "website",
  },
  verification: {
      google: "DgsW_IELG3RBiWOy-2oGEfb9HujDOvY2dpp8htVrlb4", 
    },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
