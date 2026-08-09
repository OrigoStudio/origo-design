Invoke the `bmad-review-edge-case-hunter` skill on this diff:

```diff
diff --git a/docs/astro.config.mjs b/docs/astro.config.mjs
index d94440d..7f8aa29 100644
--- a/docs/astro.config.mjs
+++ b/docs/astro.config.mjs
@@ -20,6 +20,7 @@ export default defineConfig({
           items: [
             // Each item here is one entry in the navigation menu.
             { label: 'Example Guide', link: '/guides/example/' },
+            { label: 'Design Tokens', link: '/guides/design-tokens/' },
           ],
         },
         {
diff --git a/docs/src/content/docs/guides/design-tokens.mdx b/docs/src/content/docs/guides/design-tokens.mdx
new file mode 100644
index 0000000..9bf1a37
--- /dev/null
+++ b/docs/src/content/docs/guides/design-tokens.mdx
@@ -0,0 +1,72 @@
+---
+title: Design Tokens
+description: A comprehensive guide on Origo Design tokens structure, lifecycle, and consumption.
+---
+
+Welcome to the Design Tokens guide for Origo Design! This document outlines how to understand and consume design tokens in your applications, as well as how to provide runtime overrides (white-labeling).
+
+## Token Structure
+
+Origo Design uses a multi-layered token structure to ensure maximum flexibility and semantic consistency.
+
+1. **Base Tokens:** The foundational values of the design system (e.g., raw color hex codes, absolute spacing values). Defined in `base-tokens.schema.json`.
+2. **Semantic Tokens:** Meaningful aliases for base tokens that describe their intent (e.g., `color.primary`, `spacing.large`).
+3. **Component Tokens:** Highly specific tokens scoped to individual UI components (e.g., `button.background.primary`).
+
+## Consumption
+
+### Vanilla JavaScript / TypeScript
+
+To consume design tokens in a standard web environment, the `@origo/design-tokens` package provides a runtime fetcher and injector. 
+
+Use `loadAndInjectTheme` to fetch a `theme.json` file from a URL and inject it into the DOM as CSS variables.
+
+```typescript
+import { loadAndInjectTheme } from '@origo/design-tokens/runtime';
+
+// Fetches theme.json and injects it into document.documentElement by default
+loadAndInjectTheme('/assets/theme.json')
+  .then(teardown => {
+    // A teardown function is returned to remove the injected style tag if needed
+    console.log('Theme loaded successfully!');
+  })
+  .catch(error => {
+    console.error('Failed to load theme:', error);
+  });
+```
+
+The underlying API also includes `fetchTheme` if you only want to retrieve the JSON without injecting it. The runtime utilities are built to safely handle Server-Side Rendering (SSR) environments and gracefully degrade on network errors.
+
+### Angular Renderer
+
+For Angular applications, we provide the `@origo/angular-renderer` package which simplifies theme injection into the application lifecycle.
+
+You can register the theme provider in your app config or root module using `provideOrigoTheme`. This utilizes Angular's `APP_INITIALIZER` to fetch and apply the theme during application bootstrap.
+
+```typescript
+import { ApplicationConfig } from '@angular/core';
+import { provideOrigoTheme } from '@origo/angular-renderer';
+
+export const appConfig: ApplicationConfig = {
+  providers: [
+    provideOrigoTheme('/assets/theme.json')
+  ]
+};
+```
+
+## White-labeling & Overrides
+
+One of the key strengths of this token architecture is the ability to easily white-label your application. Since tokens are resolved into CSS Custom Properties (Variables) at runtime, clients can provide overriding dictionaries.
+
+1. **Host a Custom Theme JSON:** Create a `custom-theme.json` that follows the same schema as the default tokens.
+2. **Override at Runtime:** Pass the URL of your custom theme file to `loadAndInjectTheme` or `provideOrigoTheme`.
+3. **CSS Injection:** The fetcher will parse the new tokens and overwrite the CSS Custom Properties on the `documentElement` (or a specific target element if provided).
+
+```typescript
+// Applying a client-specific theme
+provideOrigoTheme('https://client-domain.com/branding/custom-theme.json');
+```
+
+## Versioning & Imports
+
+Packages in the Origo-Design monorepo use `nx release` for semantic versioning. When importing, ensure you import from the correct public API surfaces (e.g. `@origo/design-tokens/runtime`). Always align your package versions in `package.json` with the latest releases to benefit from new token schemas and bug fixes.
+```
+
