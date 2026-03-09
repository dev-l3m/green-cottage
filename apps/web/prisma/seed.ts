/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.join(__dirname, '..');

function loadEnvFileIfExists(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const processWithLoadEnv = process as NodeJS.Process & {
    loadEnvFile?: (path?: string) => void;
  };
  processWithLoadEnv.loadEnvFile?.(filePath);
}

// Load env from apps/web/.env.local then .env for script execution.
loadEnvFileIfExists(path.join(projectDir, '.env.local'));
loadEnvFileIfExists(path.join(projectDir, '.env'));
if (!process.env.DATABASE_URL && process.env.PRISMA_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL;
}

type CottageJson = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  facts?: { capacite_max?: number };
  images: { hero: string; gallery?: string[] };
  address?: string;
  location?: { lat?: number; lng?: number };
  practicalInfo?: { arrivee?: string; depart?: string };
  amenities?: string[];
};

type BlogPostJson = {
  id?: string;
  title: string;
  slug?: string;
  keyword: string;
  excerpt: string;
  content: string[];
  status?: 'DRAFT' | 'PUBLISHED';
  createdAt?: string;
};

function toSlug(text: string): string {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseTime(text: string | undefined, fallback: string): string {
  if (!text) return fallback;
  const match = text.match(/(\d{1,2})[:h](\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : fallback;
}

async function seedBlogPostsFromJson() {
  const jsonPath = path.join(projectDir, 'src', 'content', 'blog-posts.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn('blog-posts.json not found at', jsonPath, '- skipping blog seed from JSON');
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const items = JSON.parse(raw) as BlogPostJson[];
  const now = new Date().toISOString();
  const posts = items.map((item) => {
    const status = item.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    return {
      id: item.id ?? `${toSlug(item.title)}-${Math.random().toString(36).slice(2, 8)}`,
      title: item.title,
      slug: item.slug ?? toSlug(item.title),
      keyword: item.keyword,
      excerpt: item.excerpt,
      content: Array.isArray(item.content) ? item.content : [],
      status,
      publishedAt: status === 'PUBLISHED' ? now : null,
      createdAt: item.createdAt ?? now,
      updatedAt: now,
    };
  });

  await prisma.siteContent.upsert({
    where: { key: 'blog_posts' },
    update: { value: posts },
    create: { key: 'blog_posts', value: posts },
  });

  console.log('Upserted blog posts from JSON:', posts.length);
}

async function seedCottagesFromJson() {
  const jsonPath = path.join(projectDir, 'src', 'content', 'cottages.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn('cottages.json not found at', jsonPath, '- skipping cottage seed from JSON');
    return;
  }
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const items = JSON.parse(raw) as CottageJson[];
  for (const c of items) {
    const images = [c.images.hero, ...(c.images.gallery ?? [])].filter(Boolean);
    await prisma.cottage.upsert({
      where: { slug: c.slug },
      update: {
        title: c.name,
        summary: c.summary ?? null,
        description: c.description ?? '',
        address: c.address ?? null,
        latitude: c.location?.lat ?? null,
        longitude: c.location?.lng ?? null,
        capacity: c.facts?.capacite_max ?? 4,
        images: images.length ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
        amenities: Array.isArray(c.amenities) && c.amenities.length > 0 ? c.amenities : ['WiFi', 'Cuisine équipée', 'Parking', 'Jardin'],
        checkInTime: parseTime(c.practicalInfo?.arrivee, '17:00'),
        checkOutTime: parseTime(c.practicalInfo?.depart, '11:00'),
        isActive: true,
      },
      create: {
        slug: c.slug,
        title: c.name,
        summary: c.summary ?? null,
        description: c.description ?? '',
        address: c.address ?? null,
        latitude: c.location?.lat ?? null,
        longitude: c.location?.lng ?? null,
        capacity: c.facts?.capacite_max ?? 4,
        basePrice: 100,
        cleaningFee: 30,
        images: images.length ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
        amenities: Array.isArray(c.amenities) && c.amenities.length > 0 ? c.amenities : ['WiFi', 'Cuisine équipée', 'Parking', 'Jardin'],
        checkInTime: parseTime(c.practicalInfo?.arrivee, '17:00'),
        checkOutTime: parseTime(c.practicalInfo?.depart, '11:00'),
        isActive: true,
      },
    });
  }
  console.log('Upserted cottages from JSON:', items.map((c) => c.slug).join(', '));
}

async function main() {
  console.log('Seeding database...');
  const resetDemoUsers = process.env.RESET_DEMO_USERS === 'true';
  const runOnceMode = process.env.SEED_RUN_ONCE === 'true';
  const seedMarkerKey = process.env.SEED_MARKER_KEY || 'seed_deploy_once_v1';

  if (runOnceMode) {
    const marker = await prisma.siteContent.findUnique({
      where: { key: seedMarkerKey },
      select: { id: true },
    });
    if (marker) {
      console.log(`Seed marker "${seedMarkerKey}" already exists. Skipping seed.`);
      return;
    }
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@green-cottage.com' },
    update: resetDemoUsers
      ? {
          passwordHash: adminPassword,
          name: 'Admin',
          role: 'ADMIN',
        }
      : {},
    create: {
      email: 'admin@green-cottage.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: resetDemoUsers
      ? {
          passwordHash: customerPassword,
          name: 'John Doe',
          role: 'CUSTOMER',
        }
      : {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      name: 'John Doe',
      role: 'CUSTOMER',
    },
  });

  console.log('Created customer user:', customer.email);

  // Seed cottages from apps/web/src/content/cottages.json (upsert by slug)
  await seedCottagesFromJson();
  await seedBlogPostsFromJson();

  // Create site content
  await prisma.siteContent.upsert({
    where: { key: 'home_hero_title' },
    update: {},
    create: {
      key: 'home_hero_title',
      value: { text: 'Trouvez votre cottage idéal' },
    },
  });

  await prisma.siteContent.upsert({
    where: { key: 'home_hero_description' },
    update: {},
    create: {
      key: 'home_hero_description',
      value: {
        text: 'Découvrez des hébergements de charme pour des séjours inoubliables',
      },
    },
  });

  if (runOnceMode) {
    await prisma.siteContent.upsert({
      where: { key: seedMarkerKey },
      update: {
        value: { doneAt: new Date().toISOString() },
      },
      create: {
        key: seedMarkerKey,
        value: { doneAt: new Date().toISOString() },
      },
    });
    console.log(`Seed marker created: ${seedMarkerKey}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
