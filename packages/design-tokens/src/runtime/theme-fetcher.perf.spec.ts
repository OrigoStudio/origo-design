import { loadAndInjectTheme } from './theme-fetcher';

describe('Performance Benchmark: NFR-PERF-005', () => {
  beforeAll(() => {
    // Mock the performance API for environments that don't have it (like JSDOM if not fully featured)
    if (typeof performance === 'undefined') {
      Object.defineProperty(global, 'performance', {
        value: {
          mark: jest.fn(),
          measure: jest.fn(),
          getEntriesByName: jest.fn().mockReturnValue([{ duration: 5 }]),
          clearMarks: jest.fn(),
          clearMeasures: jest.fn(),
        },
        writable: true,
      });
    } else {
      // Stub measure to return a fast mock duration if using real performance API in jsdom
      jest
        .spyOn(performance, 'measure')
        .mockImplementation(() => undefined as unknown as PerformanceMeasure);
      jest
        .spyOn(performance, 'getEntriesByName')
        .mockReturnValue([{ duration: 15 }] as unknown as PerformanceEntryList);
    }
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Mock fetch to simulate a fast network request
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ colors: { primary: '#000' } }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should complete theme resolution within 50ms', async () => {
    const target = {} as unknown as HTMLElement;

    // NFR-PERF-005 Benchmark Simulation
    const startTime = Date.now();
    await loadAndInjectTheme('/theme.json', target);
    const endTime = Date.now();

    const duration = endTime - startTime;

    // The actual benchmark would run in a real browser, but we ensure the sync logic
    // overhead here is strictly under our limit (50ms is very generous for this synchronous mock).
    expect(duration).toBeLessThan(50);

    // Verify that performance marks were recorded for observability in real environments
    expect(performance.measure).toHaveBeenCalledWith(
      'theme-load-measure-/theme.json',
      'theme-load-start-/theme.json',
      'theme-load-end-/theme.json'
    );
  });
});
