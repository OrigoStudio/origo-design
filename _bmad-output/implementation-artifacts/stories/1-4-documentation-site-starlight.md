---
status: ready-for-dev
story_id: 1.4
story_key: 1-4-documentation-site-starlight
epic: 1
---

# Story 1.4: Documentation Site (Starlight)

Status: ready-for-dev

## Story

As a Platform Engineer,
I want a Starlight documentation site in the monorepo,
So that we can author developer documentation alongside the code from day one.

## Acceptance Criteria

1. **Given** the Origo monorepo
   **When** I run `nx serve docs` (or the equivalent target)
   **Then** a Starlight documentation site is served locally.

## Dev Agent Guardrails

### Technical Requirements
- Initialize a Starlight (Astro) project within `apps/docs/`.
- Ensure seamless integration with the Nx workspace so that running `nx serve docs` and `nx build docs` works out of the box.
- Set up content collections using Starlight's new loader API and schema (`@astrojs/starlight/loaders` and `@astrojs/starlight/schema`) in `src/content.config.ts`.
- Ensure Astro output is configured for static site generation (`output: 'static'`).

### Architecture Compliance
- **P1-AD-8**: Starlight (Astro) for docs site; static output only; playground embedded as iframe (iframe setup deferred to Epic 7/10, but directory structure must support it).
- **AD-2**: Monorepo boundary tag rules enforced. Ensure `apps/docs` follows standard linting if possible, but keep Astro-specific configs properly isolated.
- The playground will be hosted at this documentation site URL, so the site must be ready to serve static assets on a CDN.

### Library/Framework Requirements
- Astro (`astro` latest)
- Starlight (`@astrojs/starlight` latest)
- Configure Nx `project.json` for the `docs` app to wrap standard Astro CLI commands.

### File Structure Requirements
```text
origo-design/
  apps/
    docs/
      astro.config.mjs
      project.json (or integrated via Nx plugin)
      src/
        content.config.ts
        content/
          docs/
            index.md
            getting-started/
```

### Testing Requirements
- The site must build successfully without errors when running `nx build docs`.
- Run `nx serve docs` to verify it starts the local dev server.
- Verify that standard CI steps (lint, build) don't fail due to the new Astro integration.

## Previous Story Intelligence

### Learnings from Stories 1.1, 1.2 & 1.3:
- **Environment & Dependency management:** GitHub Actions uses `npm ci --no-audit`.
- **Formatting and Linting enforcement:** Husky pre-commit hooks enforce `prettier --write` and `nx format:check`. Ensure the new `apps/docs` project is compliant with `nx format`. You may need to add `.astro` to Prettier configurations if applicable.
- **Testing:** Story 1.3 encountered issues with `npm test` pipeline failures on empty workspaces; ensure that introducing Astro doesn't break standard Jest tests in other projects or vice versa.

## Latest Tech Information

### Astro & Starlight Latest Changes
- To add Starlight with the latest Astro versions, **Content Collections** now use the `loader` API instead of just collections.
- Update `src/content.config.ts` (or `src/content/config.ts`) as follows:
  ```typescript
  import { defineCollection } from 'astro:content';
  import { docsLoader } from '@astrojs/starlight/loaders';
  import { docsSchema } from '@astrojs/starlight/schema';

  export const collections = {
    docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  };
  ```
- Use `npm create astro@latest` (select Starlight) inside `apps/docs`, or if there's an Nx integration like `@nxtensions/astro`, prefer that to maintain monorepo idiomatic targets.

## Project Context Reference
- Epic 1 focuses on Workspace Initialization, CI, & Docs Foundation.
- This story represents the end of the foundational Epic 1.

---
*Completion Note: Ultimate context engine analysis completed - comprehensive developer guide created*
