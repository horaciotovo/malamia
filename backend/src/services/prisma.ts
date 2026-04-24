import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Ensure DATABASE_URL has SSL mode for Render PostgreSQL
const dbUrl = process.env.DATABASE_URL || '';
const databaseUrl = dbUrl.includes('sslmode=') ? dbUrl : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslmode=require`;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
