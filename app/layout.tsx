import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import SearchDialog from '@/components/search';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Independent, Apache-2.0 building blocks for .NET services: one error contract, service discovery, authentication, data access and more.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      {/*
        Browser extensions (Grammarly, password managers) inject attributes onto <body> before
        React hydrates, which reads as a mismatch. suppressHydrationWarning applies to this
        element's own attributes only, so real mismatches inside the tree still surface.
      */}
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <ScrollToTop />
        <RootProvider search={{ SearchDialog }}>{children}</RootProvider>
      </body>
    </html>
  );
}
