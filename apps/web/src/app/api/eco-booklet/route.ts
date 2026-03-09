import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

const ecoBookletSchema = z.object({
  email: z.string().trim().email('Email invalide').max(320, 'Email trop long'),
  consent: z.literal(true),
});

const DOUBLE_OPT_IN_ENABLED = process.env.ECO_BOOKLET_DOUBLE_OPT_IN === 'true';
const CONFIRM_TOKEN_TTL_HOURS = Number(process.env.ECO_BOOKLET_CONFIRM_TOKEN_TTL_HOURS || '48');
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

  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!host) return '';

  return `${protocol}://${host}`;
}

function getDateAfterHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function sendDownloadEmail(email: string, downloadUrl: string) {
  await sendEmail({
    to: email,
    subject: 'Votre livret Green Cottage est prêt',
    text: `Bonjour,\n\nVoici votre lien de téléchargement (valable pendant ${DOWNLOAD_TOKEN_TTL_HOURS} heures) : ${downloadUrl}\n\nA bientôt,\nGreen Cottage`,
    html: `
      <p>Bonjour,</p>
      <p>Merci pour votre inscription. Votre livret d'activités est disponible via le lien ci-dessous :</p>
      <p><a href="${downloadUrl}">Télécharger le PDF</a></p>
      <p>Ce lien est valable pendant ${DOWNLOAD_TOKEN_TTL_HOURS} heures.</p>
      <p>A bientôt,<br/>Green Cottage</p>
    `,
  });
}

async function sendDoubleOptInEmail(email: string, confirmUrl: string) {
  await sendEmail({
    to: email,
    subject: 'Confirmez votre email pour recevoir le PDF',
    text: `Bonjour,\n\nMerci de confirmer votre email via ce lien (valable pendant ${CONFIRM_TOKEN_TTL_HOURS} heures) : ${confirmUrl}\n\nAprès confirmation, nous vous enverrons le lien de téléchargement du PDF.\n\nGreen Cottage`,
    html: `
      <p>Bonjour,</p>
      <p>Merci de confirmer votre email pour recevoir le livret :</p>
      <p><a href="${confirmUrl}">Confirmer mon email</a></p>
      <p>Ce lien est valable pendant ${CONFIRM_TOKEN_TTL_HOURS} heures.</p>
      <p>Après confirmation, vous recevrez le lien de téléchargement du PDF.</p>
      <p>Green Cottage</p>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ecoBookletSchema.parse(body);
    const email = data.email.toLowerCase();
    const baseUrl = getBaseUrl(request);

    if (!baseUrl) {
      return NextResponse.json({ error: 'URL de base introuvable' }, { status: 500 });
    }

    if (DOUBLE_OPT_IN_ENABLED) {
      const confirmToken = createToken();
      const confirmTokenHash = hashToken(confirmToken);
      const confirmTokenExpiresAt = getDateAfterHours(CONFIRM_TOKEN_TTL_HOURS);

      await prisma.newsletter.upsert({
        where: { email },
        update: {
          source: 'eco-booklet-popup',
          gdprConsentAt: new Date(),
          status: 'PENDING',
          confirmedAt: null,
          doubleOptInTokenHash: confirmTokenHash,
          doubleOptInTokenExpiresAt: confirmTokenExpiresAt,
          downloadTokenHash: null,
          downloadTokenExpiresAt: null,
        },
        create: {
          email,
          source: 'eco-booklet-popup',
          gdprConsentAt: new Date(),
          status: 'PENDING',
          doubleOptInTokenHash: confirmTokenHash,
          doubleOptInTokenExpiresAt: confirmTokenExpiresAt,
        },
      });

      const confirmUrl = `${baseUrl}/api/eco-booklet/confirm?token=${confirmToken}`;
      await sendDoubleOptInEmail(email, confirmUrl);

      return NextResponse.json({ ok: true, pendingConfirmation: true });
    }

    const downloadToken = createToken();
    const downloadTokenHash = hashToken(downloadToken);
    const downloadTokenExpiresAt = getDateAfterHours(DOWNLOAD_TOKEN_TTL_HOURS);

    await prisma.newsletter.upsert({
      where: { email },
      update: {
        source: 'eco-booklet-popup',
        gdprConsentAt: new Date(),
        status: 'SUBSCRIBED',
        confirmedAt: new Date(),
        doubleOptInTokenHash: null,
        doubleOptInTokenExpiresAt: null,
        downloadTokenHash,
        downloadTokenExpiresAt,
        lastDownloadEmailSentAt: new Date(),
      },
      create: {
        email,
        source: 'eco-booklet-popup',
        gdprConsentAt: new Date(),
        status: 'SUBSCRIBED',
        confirmedAt: new Date(),
        downloadTokenHash,
        downloadTokenExpiresAt,
        lastDownloadEmailSentAt: new Date(),
      },
    });

    const downloadUrl = `${baseUrl}/api/eco-booklet/download?token=${downloadToken}`;
    await sendDownloadEmail(email, downloadUrl);

    return NextResponse.json({ ok: true, pendingConfirmation: false });
  } catch (error) {
    console.error('Error saving eco booklet lead:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible d’enregistrer votre demande' }, { status: 500 });
  }
}
