import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageMDXComponents } from '@/components/mdx';
import { getLibraryByUrl, ogImageFor, repoUrl } from '@/lib/libraries';
import { absolute, SITE_NAME, SITE_URL } from '@/lib/seo';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const library = getLibraryByUrl(page.url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.data.title,
    description: page.data.description,
    url: absolute(page.url),
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: absolute('/'),
    },
    ...(library
      ? {
          about: {
            '@type': 'SoftwareSourceCode',
            name: library.name,
            description: library.description,
            codeRepository: repoUrl(library),
            programmingLanguage: 'C#',
            runtimePlatform: '.NET',
          },
        }
      : {}),
  };

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getPageMDXComponents(page, source)} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const library = getLibraryByUrl(page.url);
  const image = ogImageFor(library);
  const title = page.data.title;
  const description = page.data.description;

  return {
    title,
    description,
    alternates: { canonical: page.url },
    openGraph: {
      type: 'article',
      url: absolute(page.url),
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
