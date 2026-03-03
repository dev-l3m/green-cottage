export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminSettingsPanel, {
  type AdminSettingsValues,
} from '../../../components/admin/AdminSettingsPanel';

const SETTINGS_KEYS = [
  'home_hero_title',
  'home_hero_description',
  'invoice_company_name',
  'invoice_company_address',
  'invoice_company_email',
  'invoice_company_phone',
] as const;

async function getAdminSettings(): Promise<AdminSettingsValues> {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: [...SETTINGS_KEYS] } },
    select: { key: true, value: true },
  });

  const byKey = new Map(rows.map((r) => [r.key, r.value as { text?: string }]));

  return {
    homeHeroTitle: byKey.get('home_hero_title')?.text ?? '',
    homeHeroDescription: byKey.get('home_hero_description')?.text ?? '',
    invoiceCompanyName: byKey.get('invoice_company_name')?.text ?? '',
    invoiceCompanyAddress: byKey.get('invoice_company_address')?.text ?? '',
    invoiceCompanyEmail: byKey.get('invoice_company_email')?.text ?? '',
    invoiceCompanyPhone: byKey.get('invoice_company_phone')?.text ?? '',
  };
}

export default async function AdminSettingsPage() {
  const initialValues = await getAdminSettings();

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-4">Paramètres</h1>
      <p className="text-muted-foreground mb-6">
        Configurez les contenus globaux et les informations de facturation.
      </p>
      <AdminSettingsPanel initialValues={initialValues} />
    </div>
  );
}
