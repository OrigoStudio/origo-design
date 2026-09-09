import { bench, describe } from 'vitest';
import { PreviewService } from './preview.service';
import { TestBed } from '@angular/core/testing';

describe('PreviewService Benchmarks', () => {
  let service: PreviewService;

  const setupBench = () => {
    TestBed.configureTestingModule({
      providers: [PreviewService],
    });
    service = TestBed.inject(PreviewService);
    // Don't mock the worker proxy, test the real latency of the full pipeline (IPC serialization)
    // To bench onContentChange properly, we need to await the final result, but bench loops
    // just call it over and over.
    // If we call onContentChange, it will debounce.
    // Instead of benching onContentChange (which just tests setTimeout),
    // we should bench workerProxy.compile directly if it's available.
  };

  bench(
    'worker compile IPC serialization latency',
    async () => {
      if (!service) {
        setupBench();
        // Wait for worker to init
        await new Promise(r => setTimeout(r, 100));
      }
      const proxy = (service as any).workerProxy;
      if (proxy) {
        await proxy.compile('{"id": "test-domain"}');
      }
    },
    { time: 500 }
  );

  bench(
    'onContentChange debounce burst handling',
    async () => {
      if (!service) setupBench();
      // Calling it 100 times synchronously tests the JS engine's debounce performance
      for (let i = 0; i < 100; i++) {
        service.onContentChange(`{"id": "test-domain", "count": ${i}}`);
      }
    },
    { time: 500 }
  );
});
