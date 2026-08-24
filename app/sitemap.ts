import type { MetadataRoute } from 'next';
import { statSync } from 'node:fs';
import { source } from '@/lib/source';
import { absolute } from '@/lib/seo';

export const dynamic = 'force-static';

/** Last edit of the underlying MDX, so the sitemap reflects content changes not build times. */
function lastModified(absolutePath: string | undefined): Date | undefined {
  if (!absolutePath) return undefined;
  try {
    return statSync(absolutePath).mtime;
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => {
    // `/docs` -> 2 segments, `/docs/grpc` -> 3 (a library index), deeper -> a sub-page.
    const depth = page.url.split('/').filter(Boolean).length;

    return {
      url: absolute(page.url),
      lastModified: lastModified(page.absolutePath),
      changeFrequency: 'weekly' as const,
      priority: depth <= 1 ? 0.8 : depth === 2 ? 0.7 : 0.6,
    };
  });

  return [
    {
      url: absolute('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...pages,
  ];
}
