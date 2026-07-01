import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const CAMPUS_LAT = 40.1106;
const CAMPUS_LON = -88.2272;

function milesFromCampus(lat: number, lon: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat - CAMPUS_LAT);
  const dLon = toRad(lon - CAMPUS_LON);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(CAMPUS_LAT)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: "demo@illinois.edu" },
    update: {},
    create: { email: "demo@illinois.edu", name: "Demo Student", emailVerified: new Date() },
  });

  const listings = [
    {
      title: "Sunny 1-bed near Grainger Library",
      description:
        "Bright 1-bedroom on the engineering side, 3-min walk to Grainger. Subleasing for the summer while I'm at an internship. Fully furnished, fast internet included.",
      campusArea: "NORTH" as const,
      term: "SUMMER" as const,
      roomLayout: "1x1",
      priceMonthly: 720,
      address: "Green & Wright, Urbana, IL",
      lat: 40.1108,
      lon: -88.2273,
      busRoutes: ["22 Illini", "5 Green"],
      petFriendly: false,
      inUnitLaundry: true,
      parkingIncluded: false,
      roommateGenders: "No roommates",
      imgs: ["illini-a1", "illini-a2", "illini-a3"],
    },
    {
      title: "Room in 4-bed on John St (Fall)",
      description:
        "Single room in a friendly 4-bedroom apartment in South Campus. Looking to fill one spot for the fall semester. Big kitchen, two bathrooms, close to everything.",
      campusArea: "SOUTH" as const,
      term: "FALL" as const,
      roomLayout: "4x2",
      priceMonthly: 520,
      address: "John St, Champaign, IL",
      lat: 40.1042,
      lon: -88.2378,
      busRoutes: ["22 Illini", "13 Silver"],
      petFriendly: true,
      inUnitLaundry: true,
      parkingIncluded: true,
      roommateGenders: "Co-ed / mixed",
      imgs: ["illini-b1", "illini-b2"],
    },
    {
      title: "Cozy studio on the Urbana side",
      description:
        "Affordable studio a short bus ride from the Quad. Spring sublease available. Heat and water included, quiet building, great for a focused semester.",
      campusArea: "URBANA" as const,
      term: "SPRING" as const,
      roomLayout: "studio",
      priceMonthly: 430,
      address: "Lincoln Ave, Urbana, IL",
      lat: 40.1101,
      lon: -88.2009,
      busRoutes: ["100 Yellow", "1 Yellow"],
      petFriendly: false,
      inUnitLaundry: false,
      parkingIncluded: true,
      roommateGenders: "No roommates",
      imgs: ["illini-c1", "illini-c2"],
    },
    {
      title: "2-bed with parking, Champaign side",
      description:
        "Spacious 2-bedroom with a dedicated parking spot. Subleasing both rooms for the full year. In-unit laundry, dishwasher, balcony. Pets considered.",
      campusArea: "CHAMPAIGN" as const,
      term: "FALL" as const,
      roomLayout: "2x2",
      priceMonthly: 980,
      address: "Springfield Ave, Champaign, IL",
      lat: 40.1163,
      lon: -88.2566,
      busRoutes: ["10 Gold", "5 Green"],
      petFriendly: true,
      inUnitLaundry: true,
      parkingIncluded: true,
      roommateGenders: "Co-ed / mixed",
      imgs: ["illini-d1", "illini-d2", "illini-d3"],
    },
  ];

  for (const l of listings) {
    const distanceMiles = milesFromCampus(l.lat, l.lon);
    const created = await prisma.listing.create({
      data: {
        userId: demo.id,
        title: l.title,
        description: l.description,
        campusArea: l.campusArea,
        term: l.term,
        roomLayout: l.roomLayout,
        priceMonthly: l.priceMonthly,
        address: l.address,
        latitude: l.lat,
        longitude: l.lon,
        distanceMiles,
        busRoutes: l.busRoutes,
        petFriendly: l.petFriendly,
        inUnitLaundry: l.inUnitLaundry,
        parkingIncluded: l.parkingIncluded,
        roommateGenders: l.roommateGenders,
        contactEmail: "demo@illinois.edu",
        contactPhone: "(217) 555-0123",
        consentToShare: true,
        images: { create: l.imgs.map((s, i) => ({ url: img(s), sortOrder: i })) },
      },
    });
    console.log(`Seeded listing: ${created.title}`);
  }
}

main()
  .then(() => console.log("Seed complete."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
