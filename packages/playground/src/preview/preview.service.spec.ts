import { TestBed } from '@angular/core/testing';
import { PreviewService } from './preview.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as comlink from 'comlink';

describe('PreviewService', () => {
  let service: PreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreviewService],
    });
    service = TestBed.inject(PreviewService);
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
      compile: async () => ({ errors: mockErrors }),
      [comlink.releaseProxy]: vi.fn(),
    };

    service.onContentChange('test');

    await new Promise(resolve => setTimeout(resolve, 450));

    const errors = service.compilationErrorsSignal();
    expect(errors.length).toBe(51);
    expect(errors[50].message).toContain('9950 more errors');
  });

  it('should discard stale compilation results', async () => {
    let resolveFirst: any;
    const firstPromise = new Promise(resolve => (resolveFirst = resolve));

    (service as any).workerProxy = {
      compile: vi
        .fn()
        .mockImplementationOnce(() => firstPromise)
        .mockImplementationOnce(async () => ({ errors: [{ type: 'Error', message: 'Fresh' }] })),
      [comlink.releaseProxy]: vi.fn(),
    };

    // Call 1
    service.onContentChange('call 1');
    await new Promise(resolve => setTimeout(resolve, 450)); // wait for debounce

    // Call 2
    service.onContentChange('call 2');
    await new Promise(resolve => setTimeout(resolve, 450)); // wait for debounce

    // Now both calls are in flight or second has returned.
    // Let's resolve the first call now. It should be discarded.
    resolveFirst({ errors: [{ type: 'Error', message: 'Stale' }] });

    // Wait for microtasks
    await new Promise(resolve => setTimeout(resolve, 50));

    const errors = service.compilationErrorsSignal();
    // It should have the 'Fresh' error, not the 'Stale' error
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('Fresh');
  });
});
