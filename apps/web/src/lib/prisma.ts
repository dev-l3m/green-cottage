import { PrismaClient } from '@prisma/client';

// Vercel / déploiement : accepter PRISMA_DATABASE_URL si DATABASE_URL n'est pas défini
// (même ordre que scripts/migrate-vercel.mjs). Permet de tester en prod avec les données
// "locales" en définissant uniquement PRISMA_DATABASE_URL dans les env Vercel.
if (!process.env.DATABASE_URL && process.env.PRISMA_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
