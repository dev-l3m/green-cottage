import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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

function parseTime(text: string | undefined): string {
  if (!text) return '17:00';
  const match = text.match(/(\d{1,2})h(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '17:00';
}

async function seedCottagesFromJson() {
  const jsonPath = path.join(__dirname, '..', 'src', 'content', 'cottages.json');
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
        checkInTime: parseTime(c.practicalInfo?.arrivee),
        checkOutTime: parseTime(c.practicalInfo?.depart),
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
        checkInTime: parseTime(c.practicalInfo?.arrivee),
        checkOutTime: parseTime(c.practicalInfo?.depart),
        isActive: true,
      },
    });
  }
  console.log('Upserted cottages from JSON:', items.map((c) => c.slug).join(', '));
}

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@green-cottage.com' },
    update: {},
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
    update: {},
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

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
