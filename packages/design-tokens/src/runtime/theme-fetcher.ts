import { injectTheme } from './theme-injector';

/**
 * Fetches a theme.json file from the specified URL.
 *
 * - Gracefully handles SSR environments by returning an empty object.
 * - Handles network errors by catching them and returning an empty object.
 *
 * @param url The URL to fetch the theme JSON from.
 * @returns A promise that resolves to the parsed theme JSON object, or an empty object on failure/SSR.
 */
export async function fetchTheme(url: string): Promise<Record<string, unknown>> {
  // SSR guard: fetch might not exist, or we are in a server environment
  if (typeof fetch === 'undefined' || typeof document === 'undefined') {
    return {};
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `[origo-design] Failed to fetch theme from ${url}: ${response.status} ${response.statusText}`
      );
      return {};
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[origo-design] Error fetching theme from ${url}:`, error);
    return {};
  }
}

/**
 * Fetches a theme.json file and injects it into the DOM.
 * Measures the time taken using the Performance API to ensure NFR-PERF-005 limits.
 *
 * @param url The URL to fetch the theme JSON from.
 * @param target The target HTMLElement to scope the injected styles to. Defaults to documentElement.
 * @returns A promise that resolves to a teardown function to remove the injected style tag.
 */
export async function loadAndInjectTheme(
  url: string,
  target?: HTMLElement | null
): Promise<() => void> {
  const perfMarkStart = `theme-load-start-${url}`;
  const perfMarkEnd = `theme-load-end-${url}`;
  const perfMeasure = `theme-load-measure-${url}`;

  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(perfMarkStart);
  }

  let teardown: () => void = () => {
    // default no-op teardown
  };
  try {
    const themeJson = await fetchTheme(url);
    const injected = injectTheme(themeJson, target);
    if (typeof injected === 'function') {
      teardown = injected;
    }
  } catch (error) {
    console.warn('[origo-design] Error in loadAndInjectTheme', error);
  } finally {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(perfMarkEnd);
      try {
        performance.measure(perfMeasure, perfMarkStart, perfMarkEnd);
      } catch {
        // Ignore measure errors
      }
      performance.clearMarks(perfMarkStart);
      performance.clearMarks(perfMarkEnd);
      performance.clearMeasures(perfMeasure);
    }
  }

  return teardown;
}
