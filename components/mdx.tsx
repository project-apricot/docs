import defaultMdxComponents, { createRelativeLink } from 'fumadocs-ui/mdx';
import { Callout } from 'fumadocs-ui/components/callout';
import { LibraryCatalogue } from '@/components/library-catalogue';
import type { MDXComponents } from 'mdx/types';
import type { InferPageType } from 'fumadocs-core/source';
import type { source } from '@/lib/source';

/**
 * Fumadocs only resolves a link against the source tree when it starts with `./` or `../`
 * *and* names a real file, extension included. The library docs write extensionless links in
 * two styles — `](usage)` and `](./usage)` — so neither form resolves, and both fall through
 * to being resolved by the browser against the current URL. On a section index page like
 * `/docs/grpc` that turns `usage` into `/docs/usage`, which does not exist.
 *
 * Normalise anything relative into the `./name.mdx` form before handing it over, so both
 * styles resolve identically from index and non-index pages alike.
 */
export function normalizeDocHref(href: string): string {
  // Absolute URL, protocol-relative, root-relative, or a bare fragment: leave alone.
  if (/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(href)) return href;

  const hashAt = href.indexOf('#');
  let path = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : href.slice(hashAt);

  if (path === '') return href;
  if (!path.startsWith('./') && !path.startsWith('../')) path = `./${path}`;

  // Append the extension unless the last segment already carries one.
  const last = path.slice(path.lastIndexOf('/') + 1);
  if (!/\.[a-z0-9]+$/i.test(last)) path = `${path}.mdx`;

  return path + hash;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Callout,
    LibraryCatalogue,
    ...components,
  };
}

/** MDX components bound to a page, so relative links can resolve against its file path. */
export function getPageMDXComponents(
  page: InferPageType<typeof source>,
  src: typeof source,
): MDXComponents {
  const RelativeLink = createRelativeLink(src, page);

  return getMDXComponents({
    a: ({ href, ...props }) => (
      <RelativeLink {...props} href={href ? normalizeDocHref(href) : href} />
    ),
  });
}

export const useMDXComponents = getMDXComponents;
