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

const updateBlogPostSchema = z.object({
  title: z.string().trim().min(3),
  keyword: z.string().trim().min(2),
  excerpt: z.string().trim().min(10),
  content: z.array(z.string().trim().min(1)).min(1),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = updateBlogPostSchema.parse(body);

    const current = await prisma.siteContent.findUnique({
      where: { key: BLOG_SITE_CONTENT_KEY },
      select: { value: true },
    });
    const posts = parseBlogPostsValue(current?.value);
    const index = posts.findIndex((post) => post.id === params.id);

    if (index < 0) {
      return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    }

    const existing = posts[index];
    const now = new Date().toISOString();
    const nextPost = blogPostSchema.parse({
      ...existing,
      title: data.title,
      slug: buildSlug(data.title),
      keyword: data.keyword,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      publishedAt:
        data.status === 'PUBLISHED'
          ? existing.publishedAt ?? now
          : null,
      updatedAt: now,
    });

    const nextPosts = [...posts];
    nextPosts[index] = nextPost;

    await prisma.siteContent.upsert({
      where: { key: BLOG_SITE_CONTENT_KEY },
      update: { value: nextPosts },
      create: { key: BLOG_SITE_CONTENT_KEY, value: nextPosts },
    });

    return NextResponse.json(nextPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const current = await prisma.siteContent.findUnique({
      where: { key: BLOG_SITE_CONTENT_KEY },
      select: { value: true },
    });
    const posts = parseBlogPostsValue(current?.value);
    const nextPosts = posts.filter((post) => post.id !== params.id);

    if (nextPosts.length === posts.length) {
      return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    }

    await prisma.siteContent.upsert({
      where: { key: BLOG_SITE_CONTENT_KEY },
      update: { value: nextPosts },
      create: { key: BLOG_SITE_CONTENT_KEY, value: nextPosts },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
