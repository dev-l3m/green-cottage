import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const PRICING_KEY = 'seasonal_pricing_rules';

type PricingRule = {
  id: string;
  cottageId: string;
  startDate: string;
  endDate: string;
  nightlyPrice: number;
};

function parseRules(value: unknown): PricingRule[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => item as PricingRule)
    .filter((rule) => typeof rule.id === 'string');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: PRICING_KEY },
      select: { value: true },
    });
    const current = parseRules(row?.value);
    const next = current.filter((rule) => rule.id !== params.id);
    if (next.length === current.length) {
      return NextResponse.json({ error: 'Règle introuvable' }, { status: 404 });
    }

    await prisma.siteContent.upsert({
      where: { key: PRICING_KEY },
      update: { value: next },
      create: { key: PRICING_KEY, value: next },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    return NextResponse.json({ error: 'Failed to delete pricing rule' }, { status: 500 });
  }
}
