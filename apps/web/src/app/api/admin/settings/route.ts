import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const settingsSchema = z.object({
  homeHeroTitle: z.string().default(''),
  homeHeroDescription: z.string().default(''),
  invoiceCompanyName: z.string().default(''),
  invoiceCompanyAddress: z.string().default(''),
  invoiceCompanyEmail: z.string().default(''),
  invoiceCompanyPhone: z.string().default(''),
});

const settingsToKeys = (data: z.infer<typeof settingsSchema>) => [
  { key: 'home_hero_title', text: data.homeHeroTitle },
  { key: 'home_hero_description', text: data.homeHeroDescription },
  { key: 'invoice_company_name', text: data.invoiceCompanyName },
  { key: 'invoice_company_address', text: data.invoiceCompanyAddress },
  { key: 'invoice_company_email', text: data.invoiceCompanyEmail },
  { key: 'invoice_company_phone', text: data.invoiceCompanyPhone },
];

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const keys = settingsToKeys({
      homeHeroTitle: '',
      homeHeroDescription: '',
      invoiceCompanyName: '',
      invoiceCompanyAddress: '',
      invoiceCompanyEmail: '',
      invoiceCompanyPhone: '',
    }).map((k) => k.key);

    const rows = await prisma.siteContent.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    });

    const byKey = new Map(rows.map((r) => [r.key, r.value as { text?: string }]));
    return NextResponse.json({
      homeHeroTitle: byKey.get('home_hero_title')?.text ?? '',
      homeHeroDescription: byKey.get('home_hero_description')?.text ?? '',
      invoiceCompanyName: byKey.get('invoice_company_name')?.text ?? '',
      invoiceCompanyAddress: byKey.get('invoice_company_address')?.text ?? '',
      invoiceCompanyEmail: byKey.get('invoice_company_email')?.text ?? '',
      invoiceCompanyPhone: byKey.get('invoice_company_phone')?.text ?? '',
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Impossible de récupérer les paramètres' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = settingsSchema.parse(body);
    const pairs = settingsToKeys(data);

    await Promise.all(
      pairs.map((item) =>
        prisma.siteContent.upsert({
          where: { key: item.key },
          update: { value: { text: item.text } },
          create: { key: item.key, value: { text: item.text } },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible d’enregistrer les paramètres' }, { status: 500 });
  }
}
