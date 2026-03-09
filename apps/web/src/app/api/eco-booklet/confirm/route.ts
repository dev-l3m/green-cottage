import { createHash, randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const DOWNLOAD_TOKEN_TTL_HOURS = Number(process.env.ECO_BOOKLET_DOWNLOAD_TOKEN_TTL_HOURS || '168');

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function createToken() {
  return randomBytes(32).toString('hex');
}

function getBaseUrl(request: NextRequest) {
  const fromEnv = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  return request.nextUrl.origin;
}

function successHtml() {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937;">
        <h2>Email confirme</h2>
        <p>Merci. Votre email est confirme et le lien de telechargement vient d'etre envoye.</p>
        <p>Vous pouvez fermer cette page.</p>
      </body>
    </html>
  `;
}

function errorHtml(message: string) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937;">
        <h2>Lien invalide</h2>
        <p>${message}</p>
      </body>
    </html>
  `;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return new NextResponse(errorHtml('Le token est manquant.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const now = new Date();
    const tokenHash = hashToken(token);
    const subscription = await prisma.newsletter.findUnique({
      where: { doubleOptInTokenHash: tokenHash },
    });

    if (!subscription || !subscription.doubleOptInTokenExpiresAt) {
      return new NextResponse(errorHtml('Ce lien est invalide.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (subscription.doubleOptInTokenExpiresAt < now) {
      return new NextResponse(errorHtml('Ce lien a expire. Merci de vous reinscrire.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (subscription.status === 'UNSUBSCRIBED') {
      return new NextResponse(errorHtml('Cet email est desinscrit.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const downloadToken = createToken();
    const downloadTokenHash = hashToken(downloadToken);
    const downloadTokenExpiresAt = new Date(now.getTime() + DOWNLOAD_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    const updated = await prisma.newsletter.update({
      where: { id: subscription.id },
      data: {
        status: 'SUBSCRIBED',
        confirmedAt: now,
        doubleOptInTokenHash: null,
        doubleOptInTokenExpiresAt: null,
        downloadTokenHash,
        downloadTokenExpiresAt,
        lastDownloadEmailSentAt: now,
      },
      select: { email: true },
    });

    const baseUrl = getBaseUrl(request);
    const downloadUrl = `${baseUrl}/api/eco-booklet/download?token=${downloadToken}`;
    await sendEmail({
      to: updated.email,
      subject: 'Votre livret Green Cottage est pret',
      text: `Bonjour,\n\nMerci pour la confirmation. Voici votre lien de telechargement (valable pendant ${DOWNLOAD_TOKEN_TTL_HOURS} heures) : ${downloadUrl}\n\nGreen Cottage`,
      html: `
        <p>Bonjour,</p>
        <p>Merci pour la confirmation. Voici votre lien de telechargement :</p>
        <p><a href="${downloadUrl}">Telecharger le PDF</a></p>
        <p>Ce lien est valable pendant ${DOWNLOAD_TOKEN_TTL_HOURS} heures.</p>
        <p>Green Cottage</p>
      `,
    });

    return new NextResponse(successHtml(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error confirming eco booklet subscription:', error);
    return new NextResponse(errorHtml('Une erreur est survenue. Merci de reessayer.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
