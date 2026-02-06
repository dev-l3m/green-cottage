#!/usr/bin/env node
/**
 * Applique les migrations Prisma sur la BDD Vercel.
 * Charge apps/web/.env.local et utilise (dans l'ordre) :
 * PRISMA_DATABASE_URL, POSTGRES_URL ou DATABASE_URL.
 * Usage: depuis apps/web : node scripts/migrate-vercel.mjs
 *        ou : pnpm run db:deploy:vercel
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envLocalPath = join(root, '.env.local');

if (!existsSync(envLocalPath)) {
  console.error('.env.local introuvable dans apps/web. Créez-le avec DATABASE_URL (ou POSTGRES_URL / PRISMA_DATABASE_URL) pointant vers votre BDD Vercel.');
  process.exit(1);
}

const raw = readFileSync(envLocalPath, 'utf-8');
const env = {};
for (const line of raw.split('\n')) {
  const idx = line.indexOf('=');
  if (idx <= 0 || line.trimStart().startsWith('#')) continue;
  const key = line.slice(0, idx).trim();
  let value = line.slice(idx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const databaseUrl = env.PRISMA_DATABASE_URL || env.POSTGRES_URL || env.DATABASE_URL;
if (!databaseUrl) {
  console.error('.env.local doit contenir au moins une de: PRISMA_DATABASE_URL, POSTGRES_URL, DATABASE_URL');
  process.exit(1);
}

// Vercel Postgres exige souvent ?sslmode=require (sauf pour prisma+postgres Accelerate)
const urlToUse =
  databaseUrl.startsWith('prisma+') || databaseUrl.includes('sslmode=')
    ? databaseUrl
    : databaseUrl.replace(/\?/, '?sslmode=require&');

console.log('Migrations vers la BDD (URL depuis .env.local)...');

// Sous Windows, spawnSync('pnpm', ['exec', 'prisma', ...]) peut échouer (code null).
// On utilise le binaire Prisma local pour fiabilité cross‑platform.
const isWin = process.platform === 'win32';
const prismaName = isWin ? 'prisma.cmd' : 'prisma';
const prismaInWeb = join(root, 'node_modules', '.bin', prismaName);
const prismaInRoot = join(root, '..', '..', 'node_modules', '.bin', prismaName);
const prismaBin = existsSync(prismaInWeb) ? prismaInWeb : existsSync(prismaInRoot) ? prismaInRoot : null;
const cmd = prismaBin || 'npx';
const args = prismaBin ? ['migrate', 'deploy'] : ['prisma', 'migrate', 'deploy'];

const result = spawnSync(cmd, args, {
  cwd: root,
  env: { ...process.env, DATABASE_URL: urlToUse },
  encoding: 'utf-8',
  shell: isWin,
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.error) {
  console.error('\nErreur lancement Prisma:', result.error.message);
  process.exit(1);
}
if (result.signal) {
  console.error('\nProcessus Prisma interrompu (signal %s).', result.signal);
  process.exit(1);
}
if (result.status !== 0) {
  console.error('\nErreur: prisma migrate deploy a échoué (code %s).', result.status);
  console.error('Vérifiez que l\'URL dans .env.local est correcte et que la BDD accepte les connexions (SSL si besoin).');
  process.exit(result.status);
}

process.exit(0);
