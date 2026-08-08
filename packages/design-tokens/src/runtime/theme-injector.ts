/** CSS custom property name allowlist — alphanumeric, hyphens, underscores only */
const CSS_SAFE_KEY = /^[a-zA-Z0-9_-]+$/;

/** Keys that must never be set on a plain object to prevent prototype pollution */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Allowed CSS value patterns for semantic token overrides.
 * Validates concrete formats rather than relying solely on a denylist.
 */
const SAFE_VALUE_PATTERNS: RegExp[] = [
  /^#[0-9a-fA-F]{3,8}$/, // hex colors: #fff, #ffffff, #ffffffaa
  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)$/, // rgb / rgba
  /^hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%(?:\s*,\s*[\d.]+)?\s*\)$/, // hsl / hsla
  /^[\d.]+(?:px|rem|em|%|vh|vw|vmin|vmax|pt|ch|ex|fr|deg|rad|turn|ms|s)$/, // numeric with units
  /^[\d.]+$/, // plain numbers (opacity, z-index, line-height)
  /^[a-zA-Z][-a-zA-Z0-9]*$/, // CSS named values: red, transparent, inherit, currentColor, etc.
  /^var\(--[a-zA-Z0-9_-]+\)$/, // CSS variables
  /^calc\([^)]+\)$/, // CSS calc
  /^clamp\([^)]+\)$/, // CSS clamp
  /^(?:linear|radial|conic)-gradient\([^)]+\)$/, // CSS gradients
];

function isSafeValue(value: string): boolean {
  return SAFE_VALUE_PATTERNS.some(pattern => pattern.test(value.trim()));
}

/**
 * Parses and sanitises a flat or single-level-nested theme JSON object into
 * a safe map of `token-key → CSS value`.
 *
 * - Keys are validated against a CSS identifier allowlist.
 * - Values are validated against explicit CSS format patterns.
 * - Prototype-poisoning keys (`__proto__`, `constructor`, `prototype`) are blocked.
 * - Arrays are rejected at every nesting level.
 */
export function parseTheme(themeJson: unknown): Record<string, string> {
  if (!themeJson || typeof themeJson !== 'object' || Array.isArray(themeJson)) {
    return {};
  }

  // Object.create(null) avoids prototype setter side-effects for any key written
  const result = Object.create(null) as Record<string, string>;

  const flatten = (
    obj: Record<string, unknown>,
    prefix = '',
    depth = 0,
    visited = new WeakSet()
  ) => {
    if (depth > 1) return; // Prevent arbitrary depth beyond single-level
    if (visited.has(obj)) return; // Prevent circular reference crashes
    visited.add(obj);

    for (const key of Object.keys(obj)) {
      if (BLOCKED_KEYS.has(key) || !CSS_SAFE_KEY.test(key)) continue;

      const value = obj[key];

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value as Record<string, unknown>, `${prefix}${key}-`, depth + 1, visited);
      } else if (typeof value === 'string' || typeof value === 'number') {
        const strVal = String(value).trim();
        const fullKey = `${prefix}${key}`;

        // Block base token overrides, enforce semantic overrides
        if (!fullKey.startsWith('base-') && isSafeValue(strVal)) {
          result[fullKey] = strVal;
        }
      }
    }
  };

  flatten(themeJson as Record<string, unknown>);
  return result;
}

/**
 * Applies a parsed theme to the DOM by injecting a `<style>` tag into
 * `document.head` scoped to the target element.
 *
 * - When `target` is `document.documentElement` (the default), the style block
 *   targets `:root` for global override.
 * - When `target` is any other element, the element receives a stable
 *   `data-origo-theme-id` attribute and the style block is scoped to that
 *   attribute selector, enabling per-subtree theme isolation.
 * - Passing an empty or fully-invalid theme removes the previously injected
 *   style tag for that target rather than leaving stale rules.
 * - Safe to call in SSR environments — returns immediately if `document` is
 *   not defined.
 */
let nextTagId = 0;

export function injectTheme(themeJson: unknown, target?: HTMLElement | null): () => void {
  // SSR guard — DOM APIs are not available in Node.js environments
  if (typeof document === 'undefined') return () => undefined;

  const actualTarget = target === undefined ? document.documentElement : target;
  if (!actualTarget) return () => undefined;

  const head = document.head || document.documentElement;
  if (!head) return () => undefined;

  const parsed = parseTheme(themeJson);

  // Determine the CSS selector and the style-tag attribute for this target
  let selector: string;
  let tagId: string;

  if (actualTarget === document.documentElement) {
    selector = ':root';
    tagId = 'runtime';
  } else {
    // Assign a stable per-element ID so repeated calls reuse the same tag
    if (!actualTarget.dataset['origoThemeId']) {
      actualTarget.dataset['origoThemeId'] = `t${++nextTagId}`;
    }
    tagId = actualTarget.dataset['origoThemeId'] as string;
    selector = `[data-origo-theme-id="${CSS.escape(tagId)}"]`;
  }

  let styleTag = head.querySelector<HTMLStyleElement>(
    `style[data-origo-theme="${CSS.escape(tagId)}"]`
  );

  // Empty theme → remove the style tag to prevent stale overrides
  if (Object.keys(parsed).length === 0) {
    styleTag?.remove();
    return () => undefined;
  }

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.setAttribute('data-origo-theme', tagId);
    head.appendChild(styleTag);
  }

  let cssVariables = '';
  for (const [key, value] of Object.entries(parsed)) {
    cssVariables += `  --origo-${key}: ${value};\n`;
  }

  styleTag.textContent = `${selector} {\n${cssVariables}}\n`;

  // Return a teardown function to clean up scoped injections
  return () => {
    styleTag?.remove();
  };
}
