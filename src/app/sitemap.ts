import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

/** Regenerate sitemap at most once per hour (new listings picked up automatically). */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/safety`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/fair-housing`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${baseUrl}/listings/${listing.id}`,
      lastModified: listing.updatedAt ?? listing.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...listingPages];
  } catch (error) {
    console.error("[sitemap] Failed to load listings from database:", error);
    return staticPages;
  }
}
