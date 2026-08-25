# docs

The documentation site for [Apricot Framework](https://github.com/project-apricot), published
to **[projectapricot.dev](https://projectapricot.dev)**.

Next.js 16 and [Fumadocs](https://fumadocs.dev), exported as a static site and served from
GitHub Pages.

## Layout

```
libraries.json            which libraries are published, how they are grouped and ordered
content/docs/<slug>/      each library's docs, mirrored verbatim from its own repository
content/docs/index.mdx    the catalogue page at /docs — site-owned
app/                      routes: the landing page, the docs shell, sitemap, robots, icons
lib/source.ts             turns the manifest and the content into Fumadocs' page tree
lib/remark-*.mjs          build-time transforms over the mirrored MDX
```

## Running it

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build          # static export into out/
pnpm check-links    # every internal link and sitemap entry resolves (needs a build first)
```

## How the docs get here

**Library repositories own their documentation.** Each one keeps a `docs/` folder, and that
folder is mirrored into `content/docs/<slug>/` here — byte for byte. Nothing in this
repository edits those files by hand; if a page is wrong, it is fixed in the library that
owns it.

The mirror is automated. On release, and on demand, a library calls the shared
[`docs-release.yml`](https://github.com/project-apricot/shared-workflows/blob/main/.github/workflows/docs-release.yml)
workflow, which copies its `docs/` folder in and opens a pull request against `main`:

```
library repo (grpc)
  release published, or Docs dispatched manually
        │
        ▼
  shared-workflows/docs-release.yml
    rsync --delete  docs/  →  content/docs/grpc/
        │
        ▼
  pull request on branch docs/grpc          ← auto-merges once CI passes
        │
        ▼
  push to main → Deploy workflow → projectapricot.dev
```

The copy uses `--delete`, so a page removed upstream disappears from the site. Re-running a
sync force-updates the same branch rather than opening a second pull request.

### Adapting the mirrored content

Because the mirrored files are never edited, anything the site needs on top is applied at
build time, in `lib/`:

- **`lib/source.ts`** marks each top-level folder as a Fumadocs root folder, which is what
  scopes the sidebar to one library and produces the switcher, and applies the manifest's
  display name, description, ordering and section grouping.
- **`lib/remark-callouts.mjs`** turns the `> **Note.**` / `> **Warning.**` blockquote
  convention into Fumadocs callouts.
- **`lib/remark-strip-title.mjs`** drops the leading `# H1`, which every page repeats from its
  own frontmatter title.
- **`components/mdx.tsx`** normalises relative links. The library docs write them
  extensionless and in two styles, neither of which Fumadocs resolves on its own.

## Publishing a library

Mirroring a library's docs is not enough to publish it: the site only builds what
`libraries.json` lists, and ignores a `content/docs/<slug>/` folder with no entry. So a new
library appears in two steps — its docs sync in, then someone adds it to the manifest:

```jsonc
{
  "slug": "grpc",                // the folder under content/docs/
  "name": "gRPC",                // wins over the library's own meta.json title
  "section": "services",         // must match a section id
  "description": "…"
}
```

Adding it there is what puts it in the sidebar, the docs catalogue and the sitemap. Removing
it takes the library off the site without deleting anything.

## Deploying

Pushing to `main` runs [`deploy.yml`](.github/workflows/deploy.yml), which builds the static
export and publishes it to GitHub Pages. Pull requests run
[`ci.yml`](.github/workflows/ci.yml), which builds but publishes nothing — that is the check
the docs-sync pull requests wait on before auto-merging.

The custom domain is held by `public/CNAME`; `public/.nojekyll` stops Pages from discarding
Next's `_next/` directory.

## Licence

Apache-2.0.
