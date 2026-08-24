import manifest from '@/libraries.json';

/**
 * `libraries.json` is the single source of truth for which libraries this site publishes, how
 * they are grouped and ordered, and what they are called. A library folder under
 * `content/docs/` produces nothing unless it is registered here — registration is opt-in, so a
 * library's docs can be mirrored in before anyone is ready to publish them.
 *
 * This module is the only place that reads the JSON. Everything else goes through it.
 */

export interface Library {
  /** Folder name under `content/docs/`, and the docs URL segment. */
  slug: string;
  /** Display name. Wins over the `title` in the library's own mirrored `meta.json`. */
  name: string;
  /** Id of the section this library belongs to. */
  section: string;
  description: string;
  /** GitHub repo name under the org. Defaults to `slug`. */
  repo?: string;
  /** Absolute URL overriding the generated `og:image` for this library's pages. */
  ogImage?: string | null;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
}

export interface SectionWithLibraries extends Section {
  libraries: Library[];
}

const site = manifest.site;
export const ORG = site.org;
export const GITHUB_URL = `https://github.com/${ORG}`;

export const libraries: Library[] = manifest.libraries;
export const sectionList: Section[] = manifest.sections;

const bySlug = new Map(libraries.map((library) => [library.slug, library]));

// Validate at module load: a bad manifest should fail the build, not render a broken page.
{
  const sectionIds = new Set(sectionList.map((section) => section.id));

  if (bySlug.size !== libraries.length) {
    const counts = new Map<string, number>();
    for (const library of libraries) {
      counts.set(library.slug, (counts.get(library.slug) ?? 0) + 1);
    }
    const duplicates = [...counts]
      .filter(([, count]) => count > 1)
      .map(([slug]) => slug);
    throw new Error(`libraries.json: duplicate slug(s): ${duplicates.join(', ')}`);
  }

  for (const library of libraries) {
    if (!sectionIds.has(library.section)) {
      throw new Error(
        `libraries.json: library "${library.slug}" references unknown section ` +
          `"${library.section}". Known sections: ${[...sectionIds].join(', ')}`,
      );
    }
  }
}

/** Sections in manifest order, each with its libraries in manifest order. Empty ones dropped. */
export const sections: SectionWithLibraries[] = sectionList
  .map((section) => ({
    ...section,
    libraries: libraries.filter((library) => library.section === section.id),
  }))
  .filter((section) => section.libraries.length > 0);

export function getLibrary(slug: string): Library | undefined {
  return bySlug.get(slug);
}

/** The library owning a docs URL, e.g. `/docs/grpc/usage` -> gRPC. */
export function getLibraryByUrl(url: string): Library | undefined {
  const slug = url.split('/')[2];
  return slug ? bySlug.get(slug) : undefined;
}

export function docsUrl(library: Library): string {
  return `/docs/${library.slug}`;
}

export function repoUrl(library: Library): string {
  return `${GITHUB_URL}/${library.repo ?? library.slug}`;
}

/**
 * GitHub renders a card per repository, already carrying the org avatar, the repo name and its
 * description — so there is nothing to generate or host. The leading path segment is a
 * cache-buster; bump `site.ogCacheKey` to force unfurlers to re-fetch.
 */
function githubCard(repo: string): string {
  return `https://opengraph.githubassets.com/${site.ogCacheKey}/${ORG}/${repo}`;
}

/** Card for this site's own pages (landing, docs index). */
export const siteOgImage = githubCard(site.repo);

export function ogImageFor(library: Library | undefined): string {
  if (!library) return siteOgImage;
  return library.ogImage ?? githubCard(library.repo ?? library.slug);
}
