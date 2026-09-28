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
      title: 'Origo Design Documents',
      favicon: 'origo-studio.ico',
      social: {
        github: 'https://github.com/OrigoStudio/origo-design',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Quickstart', link: '/getting-started/quickstart/' },
            { label: 'Testing Protocols', link: '/getting-started/testing-protocols/' },
          ],
        },
        {
          label: 'Getting Started',
          items: [
            { label: 'Quickstart', link: '/getting-started/quickstart/' },
            { label: 'Testing Protocols', link: '/getting-started/testing-protocols/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'CLI Templates', link: '/guides/cli-templates/' },
            { label: 'Design Tokens', link: '/guides/design-tokens/' },
            { label: 'Publishing & Versioning', link: '/guides/publishing/' },
            { label: 'AST JSON Validation', link: '/guides/ast-validator/' },
            { label: 'Accessibility & RTL Guide', link: '/guides/accessibility-and-rtl/' },
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
