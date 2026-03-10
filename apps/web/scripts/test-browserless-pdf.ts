import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  loadEnvFile(join(process.cwd(), '.env'));
  loadEnvFile(join(process.cwd(), '.env.production'));
  loadEnvFile(join(process.cwd(), '.env.local'));
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.startsWith('prisma+postgres://')) {
    process.env.DATABASE_URL =
      process.env.DIRECT_DATABASE_URL ||
      process.env.PRISMA_DATABASE_URL ||
      process.env.POSTGRES_URL ||
      dbUrl;
  }
  const { prisma } = await import('../src/lib/prisma');
  prismaClient = prisma;
  const { generateInvoicePDF } = await import('../src/lib/invoice');

  const booking = await prisma.booking.findFirst({
    where: { status: 'PAID' },
    include: { invoice: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!booking) {
    console.log('NO_PAID_BOOKING');
    return;
  }

  const invoiceNumber = booking.invoice?.invoiceNumber ?? 'GC-TEST-000001';
  const pdf = await generateInvoicePDF(booking, invoiceNumber);
  console.log(`PDF_OK_BYTES=${pdf.length}`);
}

let prismaClient: { $disconnect: () => Promise<void> } | null = null;

main()
  .catch((err) => {
    console.error('PDF_TEST_FAILED:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  });
