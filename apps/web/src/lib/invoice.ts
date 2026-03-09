import PDFDocument from 'pdfkit';
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

export async function generateInvoicePDF(booking: Booking & { invoice: Invoice | null }): Promise<Buffer> {
  const cottage = await prisma.cottage.findUnique({
    where: { id: booking.cottageId },
  });

  const user = await prisma.user.findUnique({
    where: { id: booking.userId },
  });

  if (!cottage || !user) {
    throw new Error('Cottage or user not found');
  }

  const invoiceNumber = booking.invoice?.invoiceNumber || (await generateInvoiceNumber());
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

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  const formatMoney = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  const formatDate = (value: Date | string) => new Date(value).toLocaleDateString('fr-FR');
  const formatAddress = () =>
    [user.addressLine1, user.postalCode && user.city ? `${user.postalCode} ${user.city}` : null, user.country]
      .filter(Boolean)
      .join('\n');

  const nights = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const baseAmount = cottage.basePrice * nights;
  const options = booking.options as any;
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

  // Header block
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#1f2937').text(companyName, 50, 48);
  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  let companyY = 78;
  if (companyAddress) {
    doc.text(companyAddress, 50, companyY);
    companyY += 28;
  }
  if (companyEmail) {
    doc.text(companyEmail, 50, companyY);
    companyY += 14;
  }
  if (companyPhone) {
    doc.text(companyPhone, 50, companyY);
  }

  doc.font('Helvetica-Bold').fontSize(26).fillColor('#111827').text('FACTURE', 400, 48, { align: 'right' });
  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  doc.text(`N°: ${invoiceNumber}`, 360, 86, { width: 190, align: 'right' });
  doc.text(`Date d'émission: ${formatDate(new Date())}`, 360, 100, { width: 190, align: 'right' });
  doc.text(`Statut: Payée`, 360, 114, { width: 190, align: 'right' });

  // Divider
  doc.moveTo(50, 140).lineTo(545, 140).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // Bill to
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text('Facturé à', 50, 156);
  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  let billY = 176;
  if (user.name) {
    doc.text(user.name, 50, billY);
    billY += 14;
  }
  if (user.companyName) {
    doc.text(user.companyName, 50, billY);
    billY += 14;
  }
  doc.text(user.email, 50, billY);
  billY += 14;
  const address = formatAddress();
  if (address) {
    doc.text(address, 50, billY);
    billY += 28;
  }
  if (user.vatNumber) {
    doc.text(`TVA: ${user.vatNumber}`, 50, billY);
  }

  // Booking summary
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text('Réservation', 320, 156);
  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  doc.text(`Réf. réservation: ${booking.id}`, 320, 176);
  doc.text(`Hébergement: ${cottage.title}`, 320, 190, { width: 225 });
  doc.text(`Arrivée: ${formatDate(booking.startDate)}`, 320, 218);
  doc.text(`Départ: ${formatDate(booking.endDate)}`, 320, 232);
  doc.text(`Voyageurs: ${booking.guests}`, 320, 246);
  doc.text(`Nuits: ${nights}`, 320, 260);

  // Table header
  let y = 304;
  doc.rect(50, y, 495, 22).fill('#f3f4f6');
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827');
  doc.text('Description', 60, y + 7);
  doc.text('Montant', 445, y + 7, { width: 90, align: 'right' });

  // Table rows
  y += 30;
  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  for (const item of items) {
    doc.text(item.label, 60, y, { width: 360 });
    doc.text(formatMoney(item.amount), 445, y, { width: 90, align: 'right' });
    y += 18;
  }

  y += 4;
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // Totals
  y += 14;
  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  doc.text('Total HT', 385, y, { width: 70, align: 'right' });
  doc.text(formatMoney(booking.total), 455, y, { width: 80, align: 'right' });
  y += 14;
  doc.text('TVA', 385, y, { width: 70, align: 'right' });
  doc.text('0,00 €', 455, y, { width: 80, align: 'right' });
  y += 16;
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827');
  doc.text('Total TTC', 385, y, { width: 70, align: 'right' });
  doc.text(formatMoney(booking.total), 445, y, { width: 90, align: 'right' });

  // Footer
  doc.moveTo(50, 740).lineTo(545, 740).strokeColor('#e5e7eb').lineWidth(1).stroke();
  doc.font('Helvetica').fontSize(8).fillColor('#6b7280');
  doc.text(
    'Facture acquittée - Document généré automatiquement par Green Cottage.',
    50,
    748,
    { width: 495, align: 'center' }
  );

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
}
