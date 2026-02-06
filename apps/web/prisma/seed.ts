import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // Create sample cottages
  const cottage1 = await prisma.cottage.upsert({
    where: { slug: 'cottage-charme-1' },
    update: {},
    create: {
      slug: 'cottage-charme-1',
      title: 'Cottage de Charme au Cœur de la Nature',
      summary: 'Un magnifique cottage avec vue sur la campagne',
      description:
        'Ce cottage authentique vous accueille dans un cadre idyllique. Profitez du calme et de la sérénité pour un séjour inoubliable.\n\nLe cottage dispose de tout le confort moderne tout en conservant son charme d\'antan.',
      capacity: 4,
      basePrice: 120,
      cleaningFee: 30,
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      ],
      amenities: ['WiFi', 'Cuisine équipée', 'Parking', 'Jardin', 'Chauffage'],
      rules: 'Pas de fumeurs\nPas d\'animaux\nRespecter les voisins',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      isActive: true,
    },
  });

  const cottage2 = await prisma.cottage.upsert({
    where: { slug: 'cottage-moderne-2' },
    update: {},
    create: {
      slug: 'cottage-moderne-2',
      title: 'Cottage Moderne avec Piscine',
      summary: 'Un cottage moderne avec piscine privée',
      description:
        'Profitez d\'un séjour de luxe dans ce cottage moderne entièrement rénové. La piscine privée vous permettra de vous détendre en toute tranquillité.',
      capacity: 6,
      basePrice: 180,
      cleaningFee: 50,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      ],
      amenities: [
        'WiFi',
        'Cuisine équipée',
        'Parking',
        'Piscine',
        'Jardin',
        'Chauffage',
        'Climatisation',
      ],
      rules: 'Pas de fumeurs\nAnimaux acceptés (supplément)\nRespecter les voisins',
      checkInTime: '16:00',
      checkOutTime: '10:00',
      isActive: true,
    },
  });

  // Cottages alignés avec le contenu JSON (puma, bruyere, petit-pierre, telegaphe) pour que /api/cottages/[slug] et /cottages/[slug]/book fonctionnent
  const jsonSlugs = [
    { slug: 'puma', name: 'Gîte Puma', summary: 'Maison familiale en lisière de forêt avec piscine partagée.', capacity: 6 },
    { slug: 'bruyere', name: 'Gîte Bruyère', summary: 'Gîte chaleureux et fonctionnel pour escapade en couple ou en famille.', capacity: 4 },
    { slug: 'petit-pierre', name: 'Gîte Petit Pierre', summary: 'Gîte convivial pour des séjours au calme.', capacity: 4 },
    { slug: 'telegaphe', name: 'Gîte Télégaphe', summary: 'Gîte au charme authentique pour un séjour nature.', capacity: 4 },
  ];
  for (const c of jsonSlugs) {
    await prisma.cottage.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        title: c.name,
        summary: c.summary,
        description: 'Séjour confortable au plus proche de la nature. Équipements et extérieurs pour la détente et les moments de partage.',
        capacity: c.capacity,
        basePrice: 100,
        cleaningFee: 30,
        images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
        amenities: ['WiFi', 'Cuisine équipée', 'Parking', 'Jardin'],
        checkInTime: '17:00',
        checkOutTime: '10:00',
        isActive: true,
      },
    });
  }
  console.log('Created cottages:', cottage1.slug, cottage2.slug, ...jsonSlugs.map((c) => c.slug));

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
