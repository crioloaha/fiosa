import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
let prismaClientOptions: any = {};

if (databaseUrl) {
  let urlToUse = databaseUrl;
  if (!databaseUrl.includes('connection_limit')) {
    const separator = databaseUrl.includes('?') ? '&' : '?';
    urlToUse = `${databaseUrl}${separator}connection_limit=2`;
  }
  prismaClientOptions.datasources = {
    db: {
      url: urlToUse,
    },
  };
}

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
