import { prisma } from './prisma';
import type { Booking, Invoice } from '@prisma/client';

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get or create counter for this year
  let counter = await prisma.invoiceCounter.findUnique({
    where: { year },
  });

  if (!counter) {
    counter = await prisma.invoiceCounter.create({
      data: { year, counter: 0 },
    });
  }

  // Increment counter atomically
  const updated = await prisma.invoiceCounter.update({
    where: { year },
    data: { counter: { increment: 1 } },
  });

  const invoiceNumber = `GC-${year}-${String(updated.counter).padStart(6, '0')}`;
  return invoiceNumber;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toMoney(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function toDate(value: Date | string): string {
  return new Date(value).toLocaleDateString('fr-FR');
}

function renderInvoiceHtml(input: {
  invoiceNumber: string;
  bookingId: string;
  startDate: Date | string;
  endDate: Date | string;
  guests: number;
  nights: number;
  items: Array<{ label: string; amount: number }>;
  total: number;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  userName: string;
  userCompanyName: string;
  userEmail: string;
  userAddress: string;
  userVatNumber: string;
  cottageTitle: string;
}): string {
  const rows = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(toMoney(item.amount))}</td>
        </tr>
      `
    )
    .join('');

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Facture ${escapeHtml(input.invoiceNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 36px; font-size: 12px; }
      .row { display: flex; justify-content: space-between; gap: 24px; }
      .muted { color: #6b7280; }
      .title { font-size: 28px; font-weight: 700; margin: 0; }
      h2 { font-size: 14px; margin: 0 0 8px 0; }
      .box { margin-top: 18px; }
      table { width: 100%; border-collapse: collapse; margin-top: 14px; }
      th { text-align: left; background: #f3f4f6; padding: 10px 12px; font-size: 12px; }
      .right { text-align: right; }
      .totals { margin-top: 12px; width: 100%; }
      .totals td { padding: 4px 0; }
      .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 11px; }
    </style>
  </head>
  <body>
    <div class="row">
      <div>
        <h1 style="margin:0;font-size:22px;">${escapeHtml(input.companyName)}</h1>
        <div class="muted">${escapeHtml(input.companyAddress).replaceAll('\n', '<br/>')}</div>
        <div class="muted">${escapeHtml(input.companyEmail)}</div>
        <div class="muted">${escapeHtml(input.companyPhone)}</div>
      </div>
      <div style="text-align:right;">
        <p class="title">FACTURE</p>
        <div>N°: ${escapeHtml(input.invoiceNumber)}</div>
        <div>Date d'emission: ${escapeHtml(toDate(new Date()))}</div>
        <div>Statut: Payee</div>
      </div>
    </div>

    <div class="row box">
      <div style="flex:1;">
        <h2>Facture a</h2>
        <div>${escapeHtml(input.userName)}</div>
        <div>${escapeHtml(input.userCompanyName)}</div>
        <div>${escapeHtml(input.userEmail)}</div>
        <div>${escapeHtml(input.userAddress).replaceAll('\n', '<br/>')}</div>
        <div>${escapeHtml(input.userVatNumber)}</div>
      </div>
      <div style="flex:1;">
        <h2>Reservation</h2>
        <div>Ref.: ${escapeHtml(input.bookingId)}</div>
        <div>Hebergement: ${escapeHtml(input.cottageTitle)}</div>
        <div>Arrivee: ${escapeHtml(toDate(input.startDate))}</div>
        <div>Depart: ${escapeHtml(toDate(input.endDate))}</div>
        <div>Voyageurs: ${input.guests}</div>
        <div>Nuits: ${input.nights}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="right">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <table class="totals">
      <tr><td style="text-align:right;">Total HT</td><td class="right">${escapeHtml(toMoney(input.total))}</td></tr>
      <tr><td style="text-align:right;">TVA</td><td class="right">0,00 €</td></tr>
      <tr><td style="text-align:right;font-weight:700;">Total TTC</td><td class="right" style="font-weight:700;">${escapeHtml(toMoney(input.total))}</td></tr>
    </table>

    <div class="footer">
      Facture acquittee - Document genere automatiquement par Green Cottage.
    </div>
  </body>
</html>`;
}

async function generatePdfWithBrowserless(html: string): Promise<Buffer> {
  const apiUrl = process.env.BROWSERLESS_API_URL;
  const token = process.env.BROWSERLESS_API_TOKEN;

  if (!apiUrl || !token) {
    throw new Error('Browserless is not configured: set BROWSERLESS_API_URL and BROWSERLESS_API_TOKEN.');
  }

  const endpoint = `${apiUrl.replace(/\/$/, '')}/pdf?token=${encodeURIComponent(token)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html,
      options: {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '10mm',
          bottom: '12mm',
          left: '10mm',
        },
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Browserless PDF failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateInvoicePDF(
  booking: Booking & { invoice: Invoice | null },
  invoiceNumberHint?: string
): Promise<Buffer> {
  const cottage = await prisma.cottage.findUnique({
    where: { id: booking.cottageId },
  });

  const user = await prisma.user.findUnique({
    where: { id: booking.userId },
  });

  if (!cottage || !user) {
    throw new Error('Cottage or user not found');
  }

  const invoiceNumber = invoiceNumberHint || booking.invoice?.invoiceNumber || (await generateInvoiceNumber());
  const settingsRows = await prisma.siteContent.findMany({
    where: {
      key: {
        in: [
          'invoice_company_name',
          'invoice_company_address',
          'invoice_company_email',
          'invoice_company_phone',
        ],
      },
    },
    select: { key: true, value: true },
  });
  const settings = new Map(settingsRows.map((r) => [r.key, r.value as { text?: string }]));

  const companyName =
    settings.get('invoice_company_name')?.text ||
    process.env.INVOICE_COMPANY_NAME ||
    'Green Cottage / L3M Holding';
  const companyAddress =
    settings.get('invoice_company_address')?.text ||
    process.env.INVOICE_COMPANY_ADDRESS ||
    '';
  const companyEmail =
    settings.get('invoice_company_email')?.text ||
    process.env.INVOICE_COMPANY_EMAIL ||
    '';
  const companyPhone =
    settings.get('invoice_company_phone')?.text ||
    process.env.INVOICE_COMPANY_PHONE ||
    '';

  const nights = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const baseAmount = Number(cottage.basePrice) * nights;
  const options = booking.options as Record<string, unknown> | null;
  const cleaningAmount = options?.cleaning && cottage.cleaningFee ? Number(cottage.cleaningFee) : 0;

  const items: Array<{ label: string; amount: number }> = [
    {
      label: `Séjour ${cottage.title} (${nights} nuit${nights > 1 ? 's' : ''})`,
      amount: baseAmount,
    },
  ];
  if (cleaningAmount > 0) {
    items.push({ label: 'Frais de ménage', amount: cleaningAmount });
  }
  if (booking.touristTax > 0) {
    items.push({ label: 'Taxe de séjour', amount: booking.touristTax });
  }

  const userAddress = [user.addressLine1, user.postalCode && user.city ? `${user.postalCode} ${user.city}` : null, user.country]
    .filter(Boolean)
    .join('\n');
  const html = renderInvoiceHtml({
    invoiceNumber,
    bookingId: booking.id,
    startDate: booking.startDate,
    endDate: booking.endDate,
    guests: booking.guests,
    nights,
    items,
    total: Number(booking.total),
    companyName,
    companyAddress,
    companyEmail,
    companyPhone,
    userName: user.name || '',
    userCompanyName: user.companyName || '',
    userEmail: user.email,
    userAddress,
    userVatNumber: user.vatNumber ? `TVA: ${user.vatNumber}` : '',
    cottageTitle: cottage.title,
  });

  const providerRaw = process.env.PDF_PROVIDER?.trim().toLowerCase();
  const hasBrowserlessConfig = Boolean(
    process.env.BROWSERLESS_API_URL && process.env.BROWSERLESS_API_TOKEN
  );
  const provider = providerRaw || (hasBrowserlessConfig ? 'browserless' : 'disabled');
  if (provider !== 'browserless') {
    throw new Error(
      `PDF generation is disabled for provider "${provider}". Set PDF_PROVIDER=browserless (and ensure env is loaded in current runtime) to enable.`
    );
  }

  return generatePdfWithBrowserless(html);
}
