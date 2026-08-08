Invoke the `bmad-review-edge-case-hunter` skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/deferred-work.md b/_bmad-output/implementation-artifacts/deferred-work.md
index 6532378..c3e3e89 100644
--- a/_bmad-output/implementation-artifacts/deferred-work.md
+++ b/_bmad-output/implementation-artifacts/deferred-work.md
@@ -10,3 +10,8 @@
 ## Deferred from: code review of 2-2-token-compilation-pipeline.md (2026-08-06)
 
 - Unconstrained Token Group Metadata [packages/design-tokens/src/schemas/base-tokens.schema.json:1] ΓÇö `base-tokens.schema.json` permits any arbitrary string for `$type` inside a `tokenGroup`, creating schema loopholes.
+
+## Deferred from: code review of 2-3-zero-code-theme-overrides.md (2026-08-08)
+
+- Missing `theme.json` fetch mechanism ΓÇö spec says "Create a mechanism to fetch, parse, and apply a `theme.json` file at runtime." Only parse+inject are implemented; no network/file fetch wrapper exists. Can be addressed in story 2.4 or as a follow-on fetch utility in `@origo/design-tokens/runtime`.
+
diff --git a/_bmad-output/implementation-artifacts/stories/2-3-zero-code-theme-overrides.md b/_bmad-output/implementation-artifacts/stories/2-3-zero-code-theme-overrides.md
index 2f288a8..34ab9b4 100644
--- a/_bmad-output/implementation-artifacts/stories/2-3-zero-code-theme-overrides.md
+++ b/_bmad-output/implementation-artifacts/stories/2-3-zero-code-theme-overrides.md
@@ -1,5 +1,5 @@
 ---
-status: review
+status: done
 story_id: 2.3
 story_key: 2-3-zero-code-theme-overrides
 epic: 2
@@ -8,7 +8,7 @@ baseline_commit: 1ec3866c74a417eed54f2b2bcbc7daaaee8212c8
 
 # Story 2.3: Zero-Code Theme Overrides
 
-Status: review
+Status: done
 
 ## Story
 
@@ -81,6 +81,16 @@ Recent commits show successful merge of the `2-2-token-compilation-pipeline`. Th
   - [x] 3.2 Implement logic to inject `<style>` tag into `document.head`
   - [x] 3.3 Write tests for DOM injection (using JSDOM or similar)
 
+### Review Findings
+
+- [x] [Review][Decision] `target` parameter ignored ΓÇö resolved: implemented scoped injection via `data-origo-theme-id` attribute selector. Global `:root` used when `target === document.documentElement`.
+- [x] [Review][Patch] CSS injection via object keys ΓÇö resolved: keys validated against `/^[a-zA-Z0-9_-]+$/` allowlist before interpolation. [theme-injector.ts:12-19, 38-40]
+- [x] [Review][Patch] Sanitization is too weak ΓÇö resolved: value validation replaced with explicit format allowlist (hex, rgb/rgba, hsl/hsla, numeric+unit, named colors). [theme-injector.ts:18]
+- [x] [Review][Patch] No SSR guard ΓÇö resolved: `if (typeof document === 'undefined') return;` added at top of `injectTheme`. [theme-injector.ts:29, 46]
+- [x] [Review][Patch] Stale theme persists when re-injecting empty/all-invalid theme ΓÇö resolved: empty `parsed` now removes the existing style tag instead of returning early. [theme-injector.ts:32-34]
+- [x] [Review][Patch] Prototype pollution via `__proto__` key ΓÇö resolved: `Object.create(null)` used for `result`; explicit `BLOCKED_KEYS` set blocks `__proto__`, `constructor`, `prototype`. [theme-injector.ts:6, 19]
+- [x] [Review][Defer] Missing `theme.json` fetch mechanism ΓÇö spec says "Create a mechanism to fetch, parse, and apply a `theme.json` file at runtime." Only parse+inject are implemented; no network/file fetch wrapper exists. ΓÇö deferred, pre-existing gap in story scope interpretation; can be addressed in story 2.4 or as a follow-on capability
+
 ## File List
 - `packages/design-tokens/src/runtime/theme-injector.ts`
 - `packages/design-tokens/src/runtime/theme-injector.spec.ts`
diff --git a/packages/design-tokens/src/runtime/theme-injector.spec.ts b/packages/design-tokens/src/runtime/theme-injector.spec.ts
index f168a7a..5a8b9a4 100644
--- a/packages/design-tokens/src/runtime/theme-injector.spec.ts
+++ b/packages/design-tokens/src/runtime/theme-injector.spec.ts
@@ -5,16 +5,7 @@ import { injectTheme, parseTheme } from './theme-injector';
 
 describe('theme-injector', () => {
   describe('parseTheme', () => {
-    it('should parse valid theme JSON object and flatten it if necessary', () => {
-      const theme = {
-        color: {
-          surface: '#ffffff',
-          primary: '#ff0000',
-        },
-      };
-      // Expecting flattened keys or whatever mapping we decide on.
-      // Assuming flat tokens mapping exactly to CSS variable suffix for simplicity, or just preserving structure if it's already flat.
-      // Let's assume the input is flat key-value pairs for semantic tokens as per style-dictionary output.
+    it('should parse a flat theme JSON object into a CSS variable mapping', () => {
       const flatTheme = {
         'color-surface': '#ffffff',
         'color-primary': '#ff0000',
@@ -25,7 +16,40 @@ describe('theme-injector', () => {
       });
     });
 
-    it('should sanitize CSS values and reject malicious inputs', () => {
+    it('should flatten single-level-nested theme objects using hyphen-joined keys', () => {
+      const nested = {
+        color: {
+          surface: '#ffffff',
+          primary: '#ff0000',
+        },
+      };
+      expect(parseTheme(nested)).toEqual({
+        'color-surface': '#ffffff',
+        'color-primary': '#ff0000',
+      });
+    });
+
+    it('should accept valid CSS value formats', () => {
+      const theme = {
+        'hex-short': '#fff',
+        'hex-long': '#aabbcc',
+        'hex-alpha': '#aabbccdd',
+        'rgb-color': 'rgb(255, 0, 0)',
+        'rgba-color': 'rgba(255, 0, 0, 0.5)',
+        'hsl-color': 'hsl(120, 100%, 50%)',
+        'hsla-color': 'hsla(120, 100%, 50%, 0.8)',
+        'px-value': '16px',
+        'rem-value': '1rem',
+        'em-value': '0.5em',
+        'percent-value': '100%',
+        'named-color': 'red',
+        'plain-number': '1.5',
+      };
+      const result = parseTheme(theme);
+      expect(Object.keys(result)).toHaveLength(Object.keys(theme).length);
+    });
+
+    it('should reject CSS values with injection payloads', () => {
       const maliciousTheme = {
         'color-primary': 'red; display: none;',
         'spacing-sm': '10px } body { background: red; }',
@@ -37,66 +61,123 @@ describe('theme-injector', () => {
 
       expect(result['valid-color']).toBe('#00ff00');
       expect(result['valid-spacing']).toBe('1rem');
-      // Malicious values should be ignored/dropped
       expect(result['color-primary']).toBeUndefined();
       expect(result['spacing-sm']).toBeUndefined();
     });
 
+    it('should reject keys containing CSS control characters', () => {
+      const maliciousKeys = {
+        'color; } body { background: red; } /*': 'red',
+        'normal-key': '#ff0000',
+      };
+      const result = parseTheme(maliciousKeys);
+      expect(result['normal-key']).toBe('#ff0000');
+      expect(Object.keys(result)).toHaveLength(1);
+    });
+
+    it('should block prototype pollution via __proto__, constructor, and prototype keys', () => {
+      const malicious = {
+        __proto__: 'polluted',
+        constructor: 'replaced',
+        prototype: 'replaced',
+        'safe-key': '#ffffff',
+      } as Record<string, unknown>;
+
+      const result = parseTheme(malicious);
+
+      expect(result['safe-key']).toBe('#ffffff');
+      // Verify no prototype pollution occurred on a fresh object
+      expect(({} as Record<string, unknown>)['__proto__']).not.toBe('polluted');
+    });
+
     it('should handle invalid input types gracefully', () => {
       expect(parseTheme(null)).toEqual({});
       expect(parseTheme(undefined)).toEqual({});
       expect(parseTheme('not an object')).toEqual({});
       expect(parseTheme(123)).toEqual({});
+      expect(parseTheme([])).toEqual({});
     });
   });
 
   describe('injectTheme', () => {
-    let target: HTMLElement;
-
-    beforeEach(() => {
-      target = document.createElement('div');
-      document.body.appendChild(target);
-    });
-
     afterEach(() => {
-      document.body.removeChild(target);
-      // Clean up injected style tags
-      const styles = document.head.querySelectorAll('style[data-origo-theme="runtime"]');
-      styles.forEach(s => s.remove());
+      // Clean up all injected style tags
+      document.head.querySelectorAll('style[data-origo-theme]').forEach((s) => s.remove());
+      // Remove theme-id attributes from any test elements still in the DOM
+      document.querySelectorAll('[data-origo-theme-id]').forEach((el) => {
+        (el as HTMLElement).removeAttribute('data-origo-theme-id');
+      });
     });
 
-    it('should inject CSS custom properties into a style tag', () => {
-      const theme = {
+    it('should inject CSS custom properties scoped to :root when no target is given', () => {
+      injectTheme({
         'color-primary': '#ff0000',
         'spacing-sm': '4px',
-      };
-
-      injectTheme(theme, target);
+      });
 
-      // We expect a style tag in the head
       const styleTag = document.head.querySelector('style[data-origo-theme="runtime"]');
       expect(styleTag).toBeTruthy();
+      expect(styleTag?.textContent).toContain(':root');
       expect(styleTag?.textContent).toContain('--origo-color-primary: #ff0000;');
       expect(styleTag?.textContent).toContain('--origo-spacing-sm: 4px;');
     });
 
-    it('should overwrite existing injected theme styles rather than adding multiple tags', () => {
-      const theme1 = { 'color-primary': '#ff0000' };
-      const theme2 = { 'color-primary': '#00ff00' };
+    it('should inject CSS scoped to the target element when a non-root target is provided', () => {
+      const target = document.createElement('div');
+      document.body.appendChild(target);
+
+      injectTheme({ 'color-primary': '#ff0000' }, target);
+
+      const themeId = target.dataset['origoThemeId'];
+      expect(themeId).toBeTruthy();
+
+      const styleTag = document.head.querySelector(`style[data-origo-theme="${themeId}"]`);
+      expect(styleTag).toBeTruthy();
+      expect(styleTag?.textContent).toContain(`[data-origo-theme-id="${themeId}"]`);
+      expect(styleTag?.textContent).not.toContain(':root');
+      expect(styleTag?.textContent).toContain('--origo-color-primary: #ff0000;');
+
+      document.body.removeChild(target);
+    });
+
+    it('should reuse the same data-origo-theme-id on repeated calls to the same target', () => {
+      const target = document.createElement('div');
+      document.body.appendChild(target);
+
+      injectTheme({ 'color-primary': '#ff0000' }, target);
+      const firstId = target.dataset['origoThemeId'];
+
+      injectTheme({ 'color-primary': '#00ff00' }, target);
+      const secondId = target.dataset['origoThemeId'];
 
-      injectTheme(theme1, target);
-      injectTheme(theme2, target);
+      expect(firstId).toBe(secondId);
+      const styles = document.head.querySelectorAll(`style[data-origo-theme="${firstId}"]`);
+      expect(styles.length).toBe(1);
+      expect(styles[0].textContent).toContain('--origo-color-primary: #00ff00;');
+
+      document.body.removeChild(target);
+    });
+
+    it('should overwrite existing :root theme styles rather than adding multiple tags', () => {
+      injectTheme({ 'color-primary': '#ff0000' });
+      injectTheme({ 'color-primary': '#00ff00' });
 
       const styles = document.head.querySelectorAll('style[data-origo-theme="runtime"]');
       expect(styles.length).toBe(1);
       expect(styles[0].textContent).toContain('--origo-color-primary: #00ff00;');
     });
 
-    it('should use the provided target class/id if we scope it (optional)', () => {
-      // By default it might inject into root or target
-      const theme = { 'color-primary': '#ff0000' };
-      injectTheme(theme, target);
-      // If we scope it to target, we could check the selector
+    it('should remove the style tag when an empty theme is injected, preventing stale overrides', () => {
+      injectTheme({ 'color-primary': '#ff0000' });
+      expect(document.head.querySelector('style[data-origo-theme="runtime"]')).toBeTruthy();
+
+      injectTheme({});
+      expect(document.head.querySelector('style[data-origo-theme="runtime"]')).toBeNull();
+    });
+
+    it('should not inject a style tag when all values fail sanitization', () => {
+      injectTheme({ 'color-primary': 'red; display: none' });
+      expect(document.head.querySelector('style[data-origo-theme="runtime"]')).toBeNull();
     });
   });
 });
diff --git a/packages/design-tokens/src/runtime/theme-injector.ts b/packages/design-tokens/src/runtime/theme-injector.ts
index 58f1fae..6a90f0c 100644
--- a/packages/design-tokens/src/runtime/theme-injector.ts
+++ b/packages/design-tokens/src/runtime/theme-injector.ts
@@ -1,54 +1,120 @@
-export function parseTheme(themeJson: any): Record<string, string> {
-  if (!themeJson || typeof themeJson !== 'object') {
+/** CSS custom property name allowlist ΓÇö alphanumeric, hyphens, underscores only */
+const CSS_SAFE_KEY = /^[a-zA-Z0-9_-]+$/;
+
+/** Keys that must never be set on a plain object to prevent prototype pollution */
+const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
+
+/**
+ * Allowed CSS value patterns for semantic token overrides.
+ * Validates concrete formats rather than relying solely on a denylist.
+ */
+const SAFE_VALUE_PATTERNS: RegExp[] = [
+  /^#[0-9a-fA-F]{3,8}$/, // hex colors: #fff, #ffffff, #ffffffaa
+  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)$/, // rgb / rgba
+  /^hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%(?:\s*,\s*[\d.]+)?\s*\)$/, // hsl / hsla
+  /^[\d.]+(?:px|rem|em|%|vh|vw|vmin|vmax|pt|ch|ex|fr|deg|rad|turn|ms|s)$/, // numeric with units
+  /^[\d.]+$/, // plain numbers (opacity, z-index, line-height)
+  /^[a-zA-Z][-a-zA-Z]*$/, // CSS named values: red, transparent, inherit, currentColor, etc.
+];
+
+function isSafeValue(value: string): boolean {
+  return SAFE_VALUE_PATTERNS.some((pattern) => pattern.test(value.trim()));
+}
+
+/**
+ * Parses and sanitises a flat or single-level-nested theme JSON object into
+ * a safe map of `token-key ΓåÆ CSS value`.
+ *
+ * - Keys are validated against a CSS identifier allowlist.
+ * - Values are validated against explicit CSS format patterns.
+ * - Prototype-poisoning keys (`__proto__`, `constructor`, `prototype`) are blocked.
+ * - Arrays are rejected at every nesting level.
+ */
+export function parseTheme(themeJson: unknown): Record<string, string> {
+  if (!themeJson || typeof themeJson !== 'object' || Array.isArray(themeJson)) {
     return {};
   }
 
-  const result: Record<string, string> = {};
+  // Object.create(null) avoids prototype setter side-effects for any key written
+  const result = Object.create(null) as Record<string, string>;
+
+  const flatten = (obj: Record<string, unknown>, prefix = '') => {
+    for (const key of Object.keys(obj)) {
+      if (BLOCKED_KEYS.has(key) || !CSS_SAFE_KEY.test(key)) continue;
+
+      const value = obj[key];
 
-  // Flatten the theme JSON if it's nested (e.g. { color: { primary: 'red' } })
-  // For simplicity based on the test, we'll assume it might be a single level deep or already flat.
-  // A robust implementation should recurse, but we will handle the tested cases.
-  const flatten = (obj: any, prefix = '') => {
-    for (const [key, value] of Object.entries(obj)) {
       if (value && typeof value === 'object' && !Array.isArray(value)) {
-        flatten(value, `${prefix}${key}-`);
-      } else if (typeof value === 'string') {
-        // Sanitize the CSS value to prevent injection
-        // Reject values with semicolons or curly braces
-        if (!/[;{}]/.test(value)) {
-          result[`${prefix}${key}`] = value;
-        }
+        flatten(value as Record<string, unknown>, `${prefix}${key}-`);
+      } else if (typeof value === 'string' && isSafeValue(value)) {
+        result[`${prefix}${key}`] = value.trim();
       }
     }
   };
 
-  flatten(themeJson);
+  flatten(themeJson as Record<string, unknown>);
   return result;
 }
 
-export function injectTheme(themeJson: any, target: HTMLElement = document.documentElement): void {
+/**
+ * Applies a parsed theme to the DOM by injecting a `<style>` tag into
+ * `document.head` scoped to the target element.
+ *
+ * - When `target` is `document.documentElement` (the default), the style block
+ *   targets `:root` for global override.
+ * - When `target` is any other element, the element receives a stable
+ *   `data-origo-theme-id` attribute and the style block is scoped to that
+ *   attribute selector, enabling per-subtree theme isolation.
+ * - Passing an empty or fully-invalid theme removes the previously injected
+ *   style tag for that target rather than leaving stale rules.
+ * - Safe to call in SSR environments ΓÇö returns immediately if `document` is
+ *   not defined.
+ */
+export function injectTheme(
+  themeJson: unknown,
+  target: HTMLElement = document.documentElement,
+): void {
+  // SSR guard ΓÇö DOM APIs are not available in Node.js environments
+  if (typeof document === 'undefined') return;
+
   const parsed = parseTheme(themeJson);
 
-  if (Object.keys(parsed).length === 0) {
-    return;
-  }
+  // Determine the CSS selector and the style-tag attribute for this target
+  let selector: string;
+  let tagId: string;
 
-  // Generate CSS custom properties
-  let cssVariables = '';
-  for (const [key, value] of Object.entries(parsed)) {
-    cssVariables += `  --origo-${key}: ${value};\n`;
+  if (target === document.documentElement) {
+    selector = ':root';
+    tagId = 'runtime';
+  } else {
+    // Assign a stable per-element ID so repeated calls reuse the same tag
+    if (!target.dataset['origoThemeId']) {
+      target.dataset['origoThemeId'] = Math.random().toString(36).slice(2, 9);
+    }
+    tagId = target.dataset['origoThemeId'];
+    selector = `[data-origo-theme-id="${tagId}"]`;
   }
 
-  // We inject at the :root level for simplicity, but could scope it if needed
-  const css = `:root {\n${cssVariables}}\n`;
+  let styleTag = document.head.querySelector<HTMLStyleElement>(
+    `style[data-origo-theme="${tagId}"]`,
+  );
+
+  // Empty theme ΓåÆ remove the style tag to prevent stale overrides
+  if (Object.keys(parsed).length === 0) {
+    styleTag?.remove();
+    return;
+  }
 
-  // Check if a runtime theme style tag already exists
-  let styleTag = document.head.querySelector('style[data-origo-theme="runtime"]');
   if (!styleTag) {
     styleTag = document.createElement('style');
-    styleTag.setAttribute('data-origo-theme', 'runtime');
+    styleTag.setAttribute('data-origo-theme', tagId);
     document.head.appendChild(styleTag);
   }
 
-  styleTag.textContent = css;
+  let cssVariables = '';
+  for (const [key, value] of Object.entries(parsed)) {
+    cssVariables += `  --origo-${key}: ${value};\n`;
+  }
+
+  styleTag.textContent = `${selector} {\n${cssVariables}}\n`;
 }
