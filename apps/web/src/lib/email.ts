import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    from,
  };
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const config = getSmtpConfig();
  if (!config) return null;

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  return cachedTransporter;
}

export async function sendEmail(payload: EmailPayload) {
  const config = getSmtpConfig();
  const transporter = getTransporter();

  if (!config || !transporter) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP configuration is missing');
    }

    console.info('[eco-booklet] Email skipped in non-production mode', {
      to: payload.to,
      subject: payload.subject,
    });
    return;
  }

  await transporter.sendMail({
    from: config.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}
