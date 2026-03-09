import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import {
  BLOG_SITE_CONTENT_KEY,
  blogPostSchema,
  buildSlug,
  parseBlogPostsValue,
} from '@/lib/blog';

const createBlogPostSchema = z.object({
  title: z.string().trim().min(3),
  keyword: z.string().trim().min(2),
  excerpt: z.string().trim().min(10),
  content: z.array(z.string().trim().min(1)).min(1),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: BLOG_SITE_CONTENT_KEY },
      select: { value: true },
    });
    const posts = parseBlogPostsValue(row?.value);
    const sorted = [...posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = createBlogPostSchema.parse(body);

    const current = await prisma.siteContent.findUnique({
      where: { key: BLOG_SITE_CONTENT_KEY },
      select: { value: true },
    });
    const posts = parseBlogPostsValue(current?.value);

    const now = new Date().toISOString();
    const newPost = blogPostSchema.parse({
      id: crypto.randomUUID(),
      title: data.title,
      slug: buildSlug(data.title),
      keyword: data.keyword,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      publishedAt: data.status === 'PUBLISHED' ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    const nextValue = [newPost, ...posts];
    await prisma.siteContent.upsert({
      where: { key: BLOG_SITE_CONTENT_KEY },
      update: { value: nextValue },
      create: { key: BLOG_SITE_CONTENT_KEY, value: nextValue },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
