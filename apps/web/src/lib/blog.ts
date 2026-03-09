import { z } from 'zod';

export const BLOG_SITE_CONTENT_KEY = 'blog_posts';

export const blogPostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  keyword: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.array(z.string().min(1)).min(1),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export function parseBlogPostsValue(value: unknown): BlogPost[] {
  const parsed = z.array(blogPostSchema).safeParse(value);
  if (!parsed.success) return [];
  return parsed.data;
}

export function buildSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
