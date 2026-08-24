import Link from 'next/link';
import { docsUrl, repoUrl, sections } from '@/lib/libraries';

/**
 * The full library catalogue, rendered from `libraries.json`. Used on `/docs` — the one page
 * that carries descriptions, so the landing does not have to repeat them.
 */
export function LibraryCatalogue() {
  return (
    <div className="not-prose space-y-10">
      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="scroll-m-20 text-xl font-semibold" id={section.id}>
            {section.title}
          </h2>
          {section.description ? (
            <p className="mt-1 text-sm text-fd-muted-foreground">{section.description}</p>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {section.libraries.map((library) => (
              <div
                key={library.slug}
                className="flex flex-col rounded-xl border border-fd-border bg-fd-card p-4"
              >
                <Link
                  href={docsUrl(library)}
                  className="font-semibold text-fd-foreground hover:text-fd-primary"
                >
                  {library.name}
                </Link>
                <p className="mt-1.5 grow text-sm leading-relaxed text-fd-muted-foreground">
                  {library.description}
                </p>

                <div className="mt-4 flex gap-3 border-t border-fd-border pt-3 text-xs">
                  <Link href={docsUrl(library)} className="text-fd-primary hover:underline">
                    Docs
                  </Link>
                  <a
                    href={repoUrl(library)}
                    className="text-fd-muted-foreground hover:text-fd-primary hover:underline"
                    rel="noreferrer"
                  >
                    Source
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
