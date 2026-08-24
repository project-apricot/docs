/**
 * Every mirrored page opens with an `# H1` repeating its own frontmatter `title` (54 of 54 at
 * the time of writing). Fumadocs already renders the title from frontmatter via `<DocsTitle>`,
 * so leaving the H1 in shows the title twice and adds a redundant top-level TOC entry.
 *
 * Drop that leading H1. Anything else — including a page that opens with prose, or a second
 * H1 further down — is left alone.
 */
export function remarkStripTitle() {
  return (tree, file) => {
    const first = tree.children[0];
    if (first?.type !== 'heading' || first.depth !== 1) {
      return
    }

    const title = file?.data?.frontmatter?.title;
    if (typeof title === 'string') {
      const text = toText(first).trim();
      if (text !== title.trim()) {
        return;
      }
    }

    tree.children.shift();
  };
}

function toText(node) {
  if (typeof node.value === 'string') {
    return node.value;
  }
  if (!Array.isArray(node.children)) {
    return '';
  }
  return node.children.map(toText).join('');
}

export default remarkStripTitle;
