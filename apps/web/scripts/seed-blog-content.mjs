#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BLOG_SITE_CONTENT_KEY = 'blog_posts';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const jsonPath = join(root, 'src', 'content', 'blog-posts.json');

function loadEnvFileIfExists(filePath) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, 'utf-8');
  for (const line of raw.split('\n')) {
    const idx = line.indexOf('=');
    if (idx <= 0 || line.trimStart().startsWith('#')) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFileIfExists(join(root, '.env.local'));
loadEnvFileIfExists(join(root, '.env'));
if (!process.env.DATABASE_URL && process.env.PRISMA_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL;
}

if (!existsSync(jsonPath)) {
  console.error(`blog-posts.json introuvable: ${jsonPath}`);
  process.exit(1);
}

const raw = readFileSync(jsonPath, 'utf-8');
const items = JSON.parse(raw);

const now = new Date().toISOString();
const toSlug = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const posts = items.map((item) => {
  const id = item.id || `${toSlug(item.title)}-${Math.random().toString(36).slice(2, 8)}`;
  const status = item.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  return {
    id,
    title: item.title,
    slug: item.slug || toSlug(item.title),
    keyword: item.keyword,
    excerpt: item.excerpt,
    content: Array.isArray(item.content) ? item.content : [],
    status,
    publishedAt: status === 'PUBLISHED' ? now : null,
    createdAt: item.createdAt || now,
    updatedAt: now,
  };
});

const prisma = new PrismaClient();

try {
  await prisma.siteContent.upsert({
    where: { key: BLOG_SITE_CONTENT_KEY },
    update: { value: posts },
    create: { key: BLOG_SITE_CONTENT_KEY, value: posts },
  });
  console.log(`Blog seed OK (${posts.length} articles)`);
} catch (error) {
  console.error('Erreur seed blog:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
