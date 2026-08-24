/**
 * The library docs mark asides as `> **Note.** ...` / `> **Warning.** ...` rather than GFM
 * alerts, so nothing renders them specially by default. Rewrite those blockquotes into
 * Fumadocs `<Callout>` elements, leaving every other blockquote alone.
 *
 * This runs site-side so the mirrored `.mdx` stays byte-identical to its source repo.
 */
const TYPES = {
  'note.': { type: 'info', title: 'Note' },
  'warning.': { type: 'warn', title: 'Warning' },
  note: { type: 'info', title: 'Note' },
  warning: { type: 'warn', title: 'Warning' },
};

function attr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

export function remarkCallouts() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== 'blockquote' || !parent || index === undefined) {
        return;
      }

      const paragraph = node.children[0];
      if (paragraph?.type !== 'paragraph') {
        return;
      }

      const strong = paragraph.children[0];
      if (strong?.type !== 'strong') {
        return;
      }

      const label = strong.children.map((c) => c.value ?? '').join('').trim().toLowerCase();
      const kind = TYPES[label];
      if (!kind) {
        return;
      }

      // Drop the `**Note.**` lead-in and the space that followed it.
      paragraph.children.shift();
      const next = paragraph.children[0];
      if (next?.type === 'text') {
        next.value = next.value.replace(/^\s+/, '');
        if (next.value === '') {
          paragraph.children.shift();
        }
      }
      if (paragraph.children.length === 0) {
        node.children.shift();
      }

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Callout',
        attributes: [attr('type', kind.type), attr('title', kind.title)],
        children: node.children,
      };
    });
  };
}

/** Minimal depth-first walk; avoids a dependency on `unist-util-visit`. */
function visit(node, fn, parent, index) {
  fn(node, index, parent);
  const children = node.children;
  if (!Array.isArray(children)) {
    return;
  }
  for (let i = 0; i < children.length; i++) {
    visit(children[i], fn, node, i);
  }
}

export default remarkCallouts;
