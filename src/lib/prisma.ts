import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import type { HTTPQueryOptions } from "@neondatabase/serverless";

declare global {
  var prisma: InstanceType<typeof PrismaClient> | undefined; // eslint-disable-line no-var
}

function createPrisma() {
  const options = {} as HTTPQueryOptions<boolean, boolean>;
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, options);
  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
