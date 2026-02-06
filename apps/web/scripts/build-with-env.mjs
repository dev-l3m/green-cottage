#!/usr/bin/env node
/**
 * Build en chargeant .env et .env.local pour que Prisma ait DATABASE_URL
 * (sinon "Environment variable not found: DATABASE_URL" pendant prisma generate / migrate deploy).
 * Sur Vercel, DATABASE_URL est déjà défini par le projet, on ne fait qu'exécuter le build.
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';

// Log immédiat pour confirmer que le script a démarré (Vercel)
process.stdout.write('[build-with-env] Starting...\n');

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, 'utf-8');
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
  return env;
}

// Garder les env du processus (Vercel, CI, etc.) et compléter avec .env puis .env.local.
// Retirer npm_config_* (définies par pnpm) pour éviter les "Unknown env config" de npx/npm sur Vercel.
const env = {};
for (const [k, v] of Object.entries(process.env)) {
  if (v === undefined) continue;
  if (k.startsWith('npm_config_')) continue;
  env[k] = v;
}
for (const p of [join(root, '.env'), join(root, '.env.local')]) {
  Object.assign(env, loadEnvFile(p));
}

// Prisma exige DATABASE_URL : accepter PRISMA_DATABASE_URL ou POSTGRES_URL comme fallback
if (!env.DATABASE_URL && (env.PRISMA_DATABASE_URL || env.POSTGRES_URL)) {
  env.DATABASE_URL = env.PRISMA_DATABASE_URL || env.POSTGRES_URL;
}

if (!env.DATABASE_URL) {
  process.stderr.write('[build-with-env] ERROR: DATABASE_URL (ou PRISMA_DATABASE_URL / POSTGRES_URL) doit être défini.\n');
  process.exit(1);
}

process.stdout.write('[build-with-env] DATABASE_URL is set, running Prisma generate...\n');

const isWin = process.platform === 'win32';
// Utiliser le binaire Prisma local si dispo (plus fiable que npx sur Vercel)
const prismaName = isWin ? 'prisma.cmd' : 'prisma';
const prismaInWeb = join(root, 'node_modules', '.bin', prismaName);
const prismaInRoot = join(root, '..', '..', 'node_modules', '.bin', prismaName);
const prismaBin = existsSync(prismaInWeb) ? prismaInWeb : existsSync(prismaInRoot) ? prismaInRoot : null;

function run(cmd, args) {
  return spawnSync(cmd, args, { cwd: root, env, stdio: 'inherit', shell: isWin });
}

// 1. Prisma generate (toujours, pas besoin de BDD)
const genShell = prismaBin
  ? (isWin ? `"${prismaBin}" generate` : `"${prismaBin}" generate`)
  : 'npx prisma generate';
let r = run(isWin ? 'cmd' : 'sh', [isWin ? '/c' : '-c', genShell]);
if (r.status !== 0) {
  process.stderr.write(`[build-with-env] prisma generate failed with status ${r.status}\n`);
  process.exit(r.status ?? 1);
}

process.stdout.write('[build-with-env] Prisma generate OK, running migrate deploy...\n');

// 2. Migrations (optionnel en local si BDD injoignable ; requis sur Vercel)
const migrateShell = prismaBin
  ? (isWin ? `"${prismaBin}" migrate deploy` : `"${prismaBin}" migrate deploy`)
  : 'npx prisma migrate deploy';
r = run(isWin ? 'cmd' : 'sh', [isWin ? '/c' : '-c', migrateShell]);
if (r.status !== 0) {
  process.stderr.write('[build-with-env] prisma migrate deploy failed (continuing with next build)\n');
}

process.stdout.write('[build-with-env] Running next build...\n');

// 3. Next.js build (toujours via npx depuis apps/web)
r = run(isWin ? 'cmd' : 'sh', [isWin ? '/c' : '-c', 'npx next build']);
process.exit(r.status ?? 1);
