import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaHash: string | undefined;
};

function prismaSchemaHash() {
  try {
    const schema = readFileSync(
      path.join(process.cwd(), "prisma/schema.prisma"),
      "utf8"
    );
    return createHash("sha256").update(schema).digest("hex").slice(0, 16);
  } catch {
    return "unknown";
  }
}

/** Strip accidental quotes (common when pasting into Vercel env vars). */
function normalizeEnvValue(value: string | undefined) {
  if (!value) return value;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** Neon URLs use sslmode=require; pg v8 warns unless we set verify-full explicitly. */
function getDatabaseUrl() {
  const url = normalizeEnvValue(process.env.DATABASE_URL);
  if (!url) return url;

  const parsed = new URL(url);
  const sslmode = parsed.searchParams.get("sslmode");

  if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
    parsed.searchParams.set("sslmode", "verify-full");
  }

  return parsed.toString();
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = (() => {
  const hash = prismaSchemaHash();
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaSchemaHash !== hash
  ) {
    // Schema changed (e.g. new enum value) — drop stale client from hot reload.
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaSchemaHash = hash;
  }

  return globalForPrisma.prisma;
})();
