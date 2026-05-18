import * as dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
