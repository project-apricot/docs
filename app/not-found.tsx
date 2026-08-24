import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LogoMark } from '@/components/logo';

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <LogoMark className="mb-8 size-12" />
      <p className="font-mono text-sm text-fd-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page does not exist</h1>
      <p className="mt-3 max-w-md text-fd-muted-foreground">
        It may have moved with a library release, or the link may be wrong.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="size-4" />
          Browse the docs
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
