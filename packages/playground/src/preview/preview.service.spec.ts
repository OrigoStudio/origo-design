import { TestBed } from '@angular/core/testing';
import { PreviewService, MAX_DISPLAYED_ERRORS } from './preview.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as comlink from 'comlink';

describe('PreviewService', () => {
  let service: PreviewService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [PreviewService],
    });
    service = TestBed.inject(PreviewService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty initial compilation errors', () => {
    expect(service.compilationErrorsSignal()).toEqual([]);
  });

  it('should have null initial compiled AST', () => {
    expect(service.compiledAstSignal()).toBeNull();
  });

  it('should truncate errors if more than MAX_DISPLAYED_ERRORS', async () => {
    const mockErrors = Array.from({ length: 10000 }).map((_, i) => ({
      type: 'Syntax Error',
      message: `Error ${i}`,
    }));
    (service as any).workerProxy = {
      compile: vi.fn().mockResolvedValue({ errors: mockErrors }),
      [comlink.releaseProxy]: vi.fn(),
    };

    service.onContentChange('test');

    await vi.runAllTimersAsync();

    const errors = service.compilationErrorsSignal();
    expect(errors.length).toBe(MAX_DISPLAYED_ERRORS + 1);
    expect(errors[MAX_DISPLAYED_ERRORS].message).toContain('9950 more errors');
  });

  it('should discard stale compilation results', async () => {
    let resolveFirst: any;
    const firstPromise = new Promise(resolve => (resolveFirst = resolve));
    let resolveSecond: any;
    const secondPromise = new Promise(resolve => (resolveSecond = resolve));

    (service as any).workerProxy = {
      compile: vi.fn().mockReturnValueOnce(firstPromise).mockReturnValueOnce(secondPromise),
      [comlink.releaseProxy]: vi.fn(),
    };

    // Call 1
    service.onContentChange('call 1');
    await vi.advanceTimersByTimeAsync(400); // Trigger first debounce

    // Call 2
    service.onContentChange('call 2');
    await vi.advanceTimersByTimeAsync(400); // Trigger second debounce

    // Resolve second call (fresh) first
    resolveSecond({ errors: [{ type: 'Error', message: 'Fresh' }] });
    await Promise.resolve(); // Flush microtasks

    // Resolve first call (stale) after
    resolveFirst({ errors: [{ type: 'Error', message: 'Stale' }] });
    await Promise.resolve(); // Flush microtasks

    const errors = service.compilationErrorsSignal();
    // It should have the 'Fresh' error, not the 'Stale' error
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('Fresh');
  });
});
