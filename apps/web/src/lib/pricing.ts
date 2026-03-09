import { prisma } from '@/lib/prisma';

type SeasonalPricingRule = {
  id: string;
  cottageId: string;
  startDate: string;
  endDate: string;
  nightlyPrice: number;
};

export type BookingPricingBreakdown = {
  nights: number;
  baseAmount: number;
  cleaningFee: number;
  managementFee: number;
  touristTax: number;
  subtotal: number;
  total: number;
};

const SEASONAL_RULES_KEY = 'seasonal_pricing_rules';

function parseNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function toIsoDate(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function parseRules(value: unknown): SeasonalPricingRule[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => item as SeasonalPricingRule)
    .filter(
      (item) =>
        typeof item.id === 'string' &&
        typeof item.cottageId === 'string' &&
        typeof item.startDate === 'string' &&
        typeof item.endDate === 'string' &&
        typeof item.nightlyPrice === 'number'
    );
}

export async function computeBookingPricing(params: {
  cottageId: string;
  basePrice: number;
  defaultCleaningFee: number;
  startDate: Date;
  endDate: Date;
  withCleaning: boolean;
}) {
  const [settingsRows, seasonalRow] = await Promise.all([
    prisma.siteContent.findMany({
      where: {
        key: {
          in: ['booking_management_fee_percent', 'tourist_tax_percent'],
        },
      },
      select: { key: true, value: true },
    }),
    prisma.siteContent.findUnique({
      where: { key: SEASONAL_RULES_KEY },
      select: { value: true },
    }),
  ]);

  const byKey = new Map(
    settingsRows.map((row) => [row.key, row.value as { value?: number | string; text?: number | string }])
  );
  const managementFeePercent = parseNumber(
    byKey.get('booking_management_fee_percent')?.text ?? byKey.get('booking_management_fee_percent')?.value,
    0
  );
  const touristTaxPercent = parseNumber(
    byKey.get('tourist_tax_percent')?.text ?? byKey.get('tourist_tax_percent')?.value,
    2.5
  );

  const rules = parseRules(seasonalRow?.value).filter((rule) => rule.cottageId === params.cottageId);

  const nights = Math.max(
    0,
    Math.ceil((params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  let baseAmount = 0;
  for (let i = 0; i < nights; i += 1) {
    const date = new Date(params.startDate);
    date.setDate(params.startDate.getDate() + i);
    const isoDate = toIsoDate(date);
    const match = rules.find((rule) => rule.startDate <= isoDate && rule.endDate >= isoDate);
    baseAmount += match?.nightlyPrice ?? params.basePrice;
  }

  const cleaningFee = params.withCleaning ? params.defaultCleaningFee : 0;
  const managementFee = (baseAmount + cleaningFee) * (managementFeePercent / 100);
  const subtotal = baseAmount + cleaningFee + managementFee;
  const touristTax = subtotal * (touristTaxPercent / 100);
  const total = subtotal + touristTax;

  const breakdown: BookingPricingBreakdown = {
    nights,
    baseAmount,
    cleaningFee,
    managementFee,
    touristTax,
    subtotal,
    total,
  };

  return breakdown;
}
