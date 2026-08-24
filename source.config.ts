import { defineConfig } from 'fumadocs-mdx/config';
import { remarkCallouts } from './lib/remark-callouts.mjs';
import { remarkStripTitle } from './lib/remark-strip-title.mjs';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [remarkCallouts, remarkStripTitle, ...v],
  },
});
