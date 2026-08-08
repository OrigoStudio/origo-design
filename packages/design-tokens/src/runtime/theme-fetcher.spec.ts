/** @jest-environment jsdom */
import { fetchTheme, loadAndInjectTheme } from './theme-fetcher';
import * as injector from './theme-injector';

jest.mock('./theme-injector', () => ({
  injectTheme: jest.fn(),
}));

describe('fetchTheme', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset any mocks
    jest.resetAllMocks();
  });

  afterEach(() => {
    // Restore fetch
    global.fetch = originalFetch;
  });

  it('should fetch and return JSON data on success', async () => {
    const mockTheme = { 'color-primary': '#ff0000' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTheme),
    });

    const result = await fetchTheme('/theme.json');
    expect(global.fetch).toHaveBeenCalledWith('/theme.json');
    expect(result).toEqual(mockTheme);
  });

  it('should return an empty object on non-2xx response', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const result = await fetchTheme('/theme.json');
    expect(result).toEqual({});
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch theme from /theme.json: 404 Not Found')
    );

    consoleWarnSpy.mockRestore();
  });

  it('should return an empty object on network error', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await fetchTheme('/theme.json');
    expect(result).toEqual({});
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching theme from /theme.json:'),
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it('should return an empty object in SSR environments (where fetch is undefined)', async () => {
    const tempFetch = global.fetch;
    // @ts-expect-error - testing fallback
    delete global.fetch;

    const result = await fetchTheme('/theme.json');
    expect(result).toEqual({});

    global.fetch = tempFetch;
  });
});

describe('loadAndInjectTheme', () => {
  const originalFetch = global.fetch;
  const originalPerformance = global.performance;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.performance = originalPerformance;
  });

  it('should fetch theme and call injectTheme', async () => {
    const mockTheme = { 'color-primary': '#00ff00' };
    const mockTeardown = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTheme),
    });

    (injector.injectTheme as jest.Mock).mockReturnValue(mockTeardown);

    const teardown = await loadAndInjectTheme('/theme.json');

    expect(global.fetch).toHaveBeenCalledWith('/theme.json');
    expect(injector.injectTheme).toHaveBeenCalledWith(mockTheme, undefined);
    expect(teardown).toBe(mockTeardown);
  });

  it('should record performance marks', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
    (injector.injectTheme as jest.Mock).mockReturnValue(jest.fn());

    // Mock performance
    const markMock = jest.fn();
    const measureMock = jest.fn();

    global.performance.mark = markMock;
    global.performance.measure = measureMock;
    global.performance.clearMarks = jest.fn();
    global.performance.clearMeasures = jest.fn();

    await loadAndInjectTheme('/test.json');

    expect(markMock).toHaveBeenCalledWith('theme-load-start-/test.json');
    expect(markMock).toHaveBeenCalledWith('theme-load-end-/test.json');
    expect(measureMock).toHaveBeenCalledWith(
      'theme-load-measure-/test.json',
      'theme-load-start-/test.json',
      'theme-load-end-/test.json'
    );
  });
});
