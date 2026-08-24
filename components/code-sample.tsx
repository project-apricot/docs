import { highlight } from 'fumadocs-core/highlight';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';

// `themes` is populated at runtime but not surfaced by the union type of the exported default.
const { themes = { light: 'github-light', dark: 'github-dark' } } =
  rehypeCodeDefaultOptions as { themes?: { light: string; dark: string } };

/**
 * A syntax-highlighted block for use outside MDX, using the same shiki themes the docs pipeline
 * is configured with so the landing page and the docs pages agree.
 *
 * Renders the `<pre>` only — callers own the surrounding chrome.
 */
export async function CodeSample({
  code,
  lang = 'csharp',
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  return highlight(code, {
    lang,
    themes,
    components: {
      // Keep shiki's own classes — `shiki shiki-themes …` is what Fumadocs' CSS keys off to
      // swap in the dark palette. Overwriting className leaves the block on light colours.
      pre: ({ className: shikiClassName, ...props }) => (
        <pre
          {...props}
          className={[
            shikiClassName,
            'overflow-x-auto p-4 text-[0.8125rem] leading-relaxed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ),
    },
  });
}
