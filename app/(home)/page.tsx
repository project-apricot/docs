import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { GithubIcon } from '@/components/github-icon';
import { FeatureTabs } from '@/components/feature-tabs';
import { GITHUB_URL, ORG, siteOgImage } from '@/lib/libraries';
import { absolute, SITE_NAME, SITE_URL } from '@/lib/seo';

const TAGLINE =
  'The plumbing every .NET service ends up writing anyway — service discovery, authentication, identifiers, localization, data access, error contracts — as small, independent libraries.';

const TITLE = 'Apricot Framework — building blocks for .NET services';

export const metadata: Metadata = {
  title: TITLE,
  description: TAGLINE,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: absolute('/'),
    siteName: SITE_NAME,
    title: TITLE,
    description: TAGLINE,
    images: [{ url: siteOgImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: TAGLINE,
    images: [siteOgImage],
  },
};

const PROPS = [
  {
    title: 'Nothing to adopt',
    body: 'There is no framework here to buy into. Each library ships on its own schedule and stands on its own — take one, ignore the rest.',
  },
  {
    title: 'Everything opt-in',
    body: 'No package wires the others together. Each registers what it owns and nothing else, so your composition root stays yours.',
  },
  {
    title: 'Zero-dependency cores',
    body: 'The core of each library takes no dependency on ASP.NET Core or on a container. A console app or worker service can use it as-is.',
  },
  {
    title: 'Consistent where it counts',
    body: 'The same settings-section shape, the same error contract, the same conventions — so the second library you reach for behaves like the first.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: absolute('/'),
      logo: absolute('/icon.svg'),
      sameAs: [GITHUB_URL],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: absolute('/'),
      description: TAGLINE,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-fd-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Side by side once there is room; stacked on phones, where the heading wraps
              to three lines and a centred badge would indent it awkwardly. */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <LogoMark className="size-14 shrink-0 sm:size-18" />
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Building blocks for .NET services
            </h1>
          </div>

          <p className="mt-6 max-w-3xl text-lg text-fd-muted-foreground">{TAGLINE}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
            >
              Read the docs
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={GITHUB_URL}
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              <GithubIcon className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-fd-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold tracking-tight">Worked examples</h2>
          <p className="mt-3 max-w-2xl text-fd-muted-foreground">
            A closer look at how a few of them are used.
          </p>

          <div className="mt-8">
            <FeatureTabs />
          </div>
        </div>
      </section>

      <section className="border-b border-fd-border px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          {PROPS.map((prop) => (
            <div key={prop.title}>
              <h3 className="font-semibold">{prop.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{prop.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-fd-border px-4 py-8 text-center text-sm text-fd-muted-foreground">
        Apache-2.0 ·{' '}
        <a href={GITHUB_URL} className="underline underline-offset-4 hover:text-fd-foreground">
          github.com/{ORG}
        </a>
      </footer>
    </main>
  );
}
