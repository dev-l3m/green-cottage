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
  const companyName = process.env.INVOICE_COMPANY_NAME || 'Green Cottage / L3M Holding';
  const companyAddress = process.env.INVOICE_COMPANY_ADDRESS || '';
  const companyEmail = process.env.INVOICE_COMPANY_EMAIL || '';
  const companyPhone = process.env.INVOICE_COMPANY_PHONE || '';

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text(companyName, 50, 50);
  doc.fontSize(10).font('Helvetica').text(companyAddress, 50, 75);
  if (companyEmail) doc.text(companyEmail, 50, 90);
  if (companyPhone) doc.text(companyPhone, 50, 105);

  // Invoice title and number
  doc.fontSize(24).font('Helvetica-Bold').text('FACTURE', 400, 50);
  doc.fontSize(12).font('Helvetica').text(`N° ${invoiceNumber}`, 400, 80);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 400, 95);

  // Client info
  doc.fontSize(14).font('Helvetica-Bold').text('Facturé à:', 50, 150);
  doc.fontSize(10).font('Helvetica');
  if (user.name) doc.text(user.name, 50, 170);
  doc.text(user.email, 50, user.name ? 185 : 170);

  // Booking details
  doc.fontSize(14).font('Helvetica-Bold').text('Détails de la réservation:', 50, 220);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Cottage: ${cottage.title}`, 50, 240);
  doc.text(
    `Période: ${new Date(booking.startDate).toLocaleDateString('fr-FR')} - ${new Date(booking.endDate).toLocaleDateString('fr-FR')}`,
    50,
    255
  );
  doc.text(`Nombre de nuits: ${Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))}`, 50, 270);
  doc.text(`Nombre d'invités: ${booking.guests}`, 50, 285);

  // Items table
  let y = 320;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Description', 50, y);
  doc.text('Montant', 450, y, { align: 'right' });

  y += 20;
  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  doc.fontSize(10).font('Helvetica');
  const nights = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const baseAmount = cottage.basePrice * nights;
  doc.text(`Séjour (${nights} nuit${nights > 1 ? 's' : ''})`, 50, y);
  doc.text(`${baseAmount.toFixed(2)} €`, 450, y, { align: 'right' });
  y += 15;

  const options = booking.options as any;
  if (options?.cleaning && cottage.cleaningFee) {
    doc.text('Frais de ménage', 50, y);
    doc.text(`${cottage.cleaningFee.toFixed(2)} €`, 450, y, { align: 'right' });
    y += 15;
  }

  if (booking.touristTax > 0) {
    doc.text('Taxe de séjour', 50, y);
    doc.text(`${booking.touristTax.toFixed(2)} €`, 450, y, { align: 'right' });
    y += 15;
  }

  y += 5;
  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 15;

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Total TTC', 50, y);
  doc.text(`${booking.total.toFixed(2)} €`, 450, y, { align: 'right' });

  // Footer
  doc.fontSize(8).font('Helvetica').text('Merci pour votre confiance!', 50, 750, { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
}
