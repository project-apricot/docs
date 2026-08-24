import { defineDocs } from 'fumadocs-mdx/macro';
import { loader, type LoaderPlugin } from 'fumadocs-core/source';
import type * as PageTree from 'fumadocs-core/page-tree';
import { getLibrary, libraries, sections } from '@/lib/libraries';

const docs = defineDocs({
  dir: 'content/docs',
});

function topLevelFolder(path: string): string {
  const slash = path.indexOf('/');
  return slash === -1 ? '' : path.slice(0, slash);
}

function slugOfFolder(node: PageTree.Folder): string | undefined {
  const stack: PageTree.Node[] = [...node.children];
  if (node.index) {
    stack.unshift(node.index);
  }

  while (stack.length > 0) {
    const child = stack.shift()!;
    if (child.type === 'page') {
      return child.url.split('/')[2];
    }
    if (child.type === 'folder') {
      stack.push(...child.children);
    }
  }

  return undefined;
}

function manifestPlugin(): LoaderPlugin {
  return {
    name: 'apricot-manifest',

    transformStorage({ storage }) {
      const registered = new Set(libraries.map((library) => library.slug));
      const skipped = new Set<string>();
      const present = new Set<string>();

      for (const path of storage.getFiles()) {
        const folder = topLevelFolder(path);
        if (folder === ''){
          continue;
        } 

        if (registered.has(folder)) {
          present.add(folder);
          continue;
        }

        skipped.add(folder);
        storage.delete(path);
      }

      const missing = [...registered].filter((slug) => !present.has(slug));
      if (missing.length > 0) {
        throw new Error(
          `libraries.json registers ${missing.map((s) => `"${s}"`).join(', ')}, but ` +
            `content/docs/${missing[0]}/ has no files. Mirror the library's docs in, or ` +
            `remove it from the manifest.`,
        );
      }

      if (skipped.size > 0) {
        console.warn(
          `[apricot] skipping unregistered docs folder(s): ${[...skipped].sort().join(', ')}. ` +
            `Add them to libraries.json to publish them.`,
        );
      }
    },

    transformPageTree: {
      folder(node, folderPath) {
        if (!folderPath || folderPath.includes('/')) {
          return node;
        }

        node.root = true;

        const library = getLibrary(folderPath);
        if (library) {
          node.name = library.name;
          node.description = library.description;
        }

        return node;
      },

      root(node) {
        const folders = new Map(
          node.children.flatMap((child) => {
            if (child.type !== 'folder') {
              return []
            };
            const slug = slugOfFolder(child);
            return slug ? [[slug, child] as const] : [];
          }),
        );

        const children: typeof node.children = node.children.filter(
          (child) => child.type === 'page',
        );

        for (const section of sections) {
          const items = section.libraries
            .map((library) => folders.get(library.slug))
            .filter((folder) => folder !== undefined);

          if (items.length === 0) {
            continue
          };

          children.push({ type: 'separator', name: section.title }, ...items);
        }

        node.children = children;
        return node;
      },
    },
  };
}

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [manifestPlugin()],
});
