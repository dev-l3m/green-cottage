import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cottagesJson from '@/content/cottages.json';

type CottageJson = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  facts: { capacite_max: number };
  images: { hero: string; gallery: string[] };
  address?: string;
  location?: { lat: number; lng: number };
  practicalInfo?: { arrivee?: string; depart?: string };
  amenities?: string[];
};

const cottagesList = cottagesJson as CottageJson[];

function parseTime(text: string | undefined): string {
  if (!text) return '17:00';
  const match = text.match(/(\d{1,2})h(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '17:00';
}

function cottageFromJsonToDb(json: CottageJson) {
  const images = [json.images.hero, ...(json.images.gallery || [])].filter(Boolean);
  return {
    slug: json.slug,
    title: json.name,
    summary: json.summary ?? '',
    description: json.description ?? '',
    address: json.address ?? null,
    latitude: json.location?.lat ?? null,
    longitude: json.location?.lng ?? null,
    capacity: json.facts?.capacite_max ?? 4,
    basePrice: 100,
    cleaningFee: 30,
    images: images.length ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
    amenities: Array.isArray(json.amenities) && json.amenities.length > 0 ? json.amenities : ['WiFi', 'Cuisine équipée', 'Parking', 'Jardin'],
    checkInTime: parseTime(json.practicalInfo?.arrivee),
    checkOutTime: parseTime(json.practicalInfo?.depart),
    isActive: true,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    let cottage = await prisma.cottage.findUnique({
      where: { slug },
      include: {
        reviews: {
          where: { status: 'PUBLISHED' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!cottage) {
      const fromJson = cottagesList.find((c) => c.slug === slug);
      if (fromJson) {
        const data = cottageFromJsonToDb(fromJson);
        await prisma.cottage.upsert({
          where: { slug },
          update: {},
          create: data,
        });
        cottage = await prisma.cottage.findUnique({
          where: { slug },
          include: {
            reviews: {
              where: { status: 'PUBLISHED' },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });
      }
    }

    if (!cottage) {
      return NextResponse.json({ error: 'Cottage not found' }, { status: 404 });
    }

    return NextResponse.json(cottage);
  } catch (error) {
    console.error('Error fetching cottage:', error);
    return NextResponse.json({ error: 'Failed to fetch cottage' }, { status: 500 });
  }
}
