import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const PRICING_KEY = 'seasonal_pricing_rules';

const ruleSchema = z.object({
  cottageId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nightlyPrice: z.number().min(0),
});

type PricingRule = z.infer<typeof ruleSchema> & { id: string };

function parseRules(value: unknown): PricingRule[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => item as PricingRule)
    .filter(
      (rule) =>
        typeof rule.id === 'string' &&
        typeof rule.cottageId === 'string' &&
        typeof rule.startDate === 'string' &&
        typeof rule.endDate === 'string' &&
        typeof rule.nightlyPrice === 'number'
    );
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const [row, cottages] = await Promise.all([
      prisma.siteContent.findUnique({
        where: { key: PRICING_KEY },
        select: { value: true },
      }),
      prisma.cottage.findMany({
        where: { isActive: true },
        select: { id: true, title: true, slug: true, basePrice: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      rules: parseRules(row?.value),
      cottages,
    });
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = ruleSchema.parse(body);
    if (data.endDate < data.startDate) {
      return NextResponse.json({ error: 'La date de fin doit être après le début.' }, { status: 400 });
    }

    const row = await prisma.siteContent.findUnique({
      where: { key: PRICING_KEY },
      select: { value: true },
    });
    const current = parseRules(row?.value);
    const nextRule: PricingRule = {
      id: crypto.randomUUID(),
      ...data,
    };
    const nextValue = [nextRule, ...current];

    await prisma.siteContent.upsert({
      where: { key: PRICING_KEY },
      update: { value: nextValue },
      create: { key: PRICING_KEY, value: nextValue },
    });

    return NextResponse.json(nextRule, { status: 201 });
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
  }
}
