// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    starlight({
      title: 'My Docs',
      social: {
        github: 'https://github.com/withastro/starlight',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', link: '/guides/example/' },
            { label: 'Design Tokens', link: '/guides/design-tokens/' },
            { label: 'Publishing & Versioning', link: '/guides/publishing/' },
            { label: 'AST JSON Validation', link: '/guides/ast-validator/' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'Architecture Decisions',
          autogenerate: { directory: 'architecture-decisions' },
        },
      ],
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['cookie'],
    },
  },
});
