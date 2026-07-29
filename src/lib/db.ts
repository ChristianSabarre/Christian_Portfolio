import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 talks to Postgres through a driver adapter rather than a bundled
// engine. PrismaPg works against Neon and any standard Postgres.
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // Serverless-friendly pool. Neon (and most managed Postgres) drop idle
      // connections server-side; expiring them locally first avoids handing a
      // dead socket to the next query.
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
      keepAlive: true,
    }),
  });
}

// Next.js dev server hot-reloads modules; without this the process would leak a
// new pool on every edit until Postgres refuses connections.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
