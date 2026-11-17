import { blogPosts } from '@/data/blogPosts.ts';
import type { BlogPost } from '@/data/blogPosts.ts';

// The old data names its images `/assets/<file>`, but the files live in the old `src/assets/`, which
// Vite publishes only when code imports them (under a hashed name): the old pages show broken images.
// Approved difference 13 (owner decision of 2026-11-17): the files are imported here and published by
// the build as the WebP copies next to them (20–85 KB instead of 0.9–2 MB PNG); the post without a
// file (nurse-benefits) shows /og-blog.jpg.
const ASSETS = import.meta.glob<string>(
  [
    '../../assets/drips_cl2.webp',
    '../../assets/main.webp',
    '../../assets/WoundDressingBandage.webp',
    '../../assets/injection.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);

export const BLOG_FALLBACK_IMAGE = '/og-blog.jpg';

/** The published address of a post's image. */
export function blogImageUrl(post: BlogPost): string {
  const file = post.image.replace(/^\/assets\//, '').replace(/\.png$/, '.webp');
  return ASSETS[`../../assets/${file}`] ?? BLOG_FALLBACK_IMAGE;
}

/**
 * The old pages format the date with `toLocaleDateString('en-US')` of `new Date('YYYY-MM-DD')`
 * (UTC midnight). The time zone is fixed so the build does not depend on the machine's zone.
 */
export function formatPostDate(date: string, month: 'short' | 'long'): string {
  return new Date(date).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function getPost(slug: string | undefined): BlogPost {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Unknown blog post: ${slug}`);
  return post;
}

/** As old `getRecentPosts(3)`, without sorting the shared array in place. */
export function recentPosts(limit: number): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
}
