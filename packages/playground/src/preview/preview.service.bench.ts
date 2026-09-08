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
    // Mock the worker Proxy so bench doesn't test actual Web Worker message passing overhead
    (service as any).workerProxy = {
      compile: async (input: string) => {
        // simulate standard AST response
        return {
          ast: {
            schemaVersion: '1.0',
            domains: [{ id: 'test-domain', name: 'Test', version: '1.0.0', entities: [] }],
          },
        };
      },
    };
  };

  bench(
    'onContentChange with typical payload',
    async () => {
      if (!service) setupBench();
      await service.onContentChange('{"id": "test-domain"}');
    },
    { time: 500 }
  );
});
