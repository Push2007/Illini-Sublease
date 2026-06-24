import { prisma } from "@/lib/db";
import type { CampusArea, Term } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export type ListingFilters = {
  q?: string;
  campusAreas?: CampusArea[];
  term?: Term;
  priceMin?: number;
  priceMax?: number;
  layout?: string;
  busRoutes?: string[];
  petFriendly?: boolean;
  inUnitLaundry?: boolean;
  parkingIncluded?: boolean;
  roommateGenders?: string;
};

/** Hide listings that are rented or whose availability window has passed. */
export async function expireStaleListings() {
  await prisma.listing.updateMany({
    where: {
      status: "ACTIVE",
      availableTo: { not: null, lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
}

export async function searchListings(filters: ListingFilters) {
  await expireStaleListings();

  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };

  if (filters.campusAreas?.length) where.campusArea = { in: filters.campusAreas };
  if (filters.term) where.term = filters.term;
  if (filters.layout) where.roomLayout = { contains: filters.layout, mode: "insensitive" };

  if (filters.priceMin != null || filters.priceMax != null) {
    where.priceMonthly = {
      ...(filters.priceMin != null ? { gte: filters.priceMin } : {}),
      ...(filters.priceMax != null ? { lte: filters.priceMax } : {}),
    };
  }

  if (filters.busRoutes?.length) where.busRoutes = { hasSome: filters.busRoutes };
  if (filters.petFriendly) where.petFriendly = true;
  if (filters.inUnitLaundry) where.inUnitLaundry = true;
  if (filters.parkingIncluded) where.parkingIncluded = true;
  if (filters.roommateGenders) where.roommateGenders = filters.roommateGenders;

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { address: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      user: { select: { name: true, email: true } },
    },
  });
}

export async function getListingsForUser(userId: string) {
  await expireStaleListings();
  return prisma.listing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getFeaturedListings(limit = 6) {
  await expireStaleListings();
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export type ListingWithImages = Awaited<ReturnType<typeof searchListings>>[number];
