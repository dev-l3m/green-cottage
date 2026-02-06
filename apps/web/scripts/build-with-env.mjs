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

// Garder les env du processus (Vercel, CI, etc.) et compléter avec .env puis .env.local
const env = { ...process.env };
for (const p of [join(root, '.env'), join(root, '.env.local')]) {
  Object.assign(env, loadEnvFile(p));
}

// Prisma exige DATABASE_URL : accepter PRISMA_DATABASE_URL ou POSTGRES_URL comme fallback
if (!env.DATABASE_URL && (env.PRISMA_DATABASE_URL || env.POSTGRES_URL)) {
  env.DATABASE_URL = env.PRISMA_DATABASE_URL || env.POSTGRES_URL;
}

if (!env.DATABASE_URL) {
  console.error('DATABASE_URL (ou PRISMA_DATABASE_URL / POSTGRES_URL) doit être défini dans .env, .env.local ou l’environnement.');
  process.exit(1);
}

const isWin = process.platform === 'win32';
const buildCmd = 'npx prisma generate && npx prisma migrate deploy && npx next build';
const result = spawnSync(isWin ? 'cmd' : 'sh', [isWin ? '/c' : '-c', buildCmd], {
  cwd: root,
  env,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
