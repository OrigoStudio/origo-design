import { Injectable, signal, OnDestroy } from '@angular/core';
import * as comlink from 'comlink';
import type { CompilerWorker, CompilerError } from '../workers/compiler.worker';
import { CanonicalAST } from '@origo/core';

export const COMPILATION_DEBOUNCE_MS = 400;
export const MAX_DISPLAYED_ERRORS = 50;

@Injectable({ providedIn: 'root' })
export class PreviewService implements OnDestroy {
  public compiledAstSignal = signal<CanonicalAST | null>(null);
  public compilationErrorsSignal = signal<CompilerError[]>([]);

  private _compilationId = 0;
  private worker?: Worker;
  private workerProxy?: comlink.Remote<CompilerWorker>;
  private debounceTimer?: number;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof Worker === 'undefined') {
      console.warn('Worker is not supported in this environment (e.g. JSDOM)');
      return;
    }

    if (this.workerProxy) {
      this.workerProxy[comlink.releaseProxy]();
      this.workerProxy = undefined;
    }

    if (this.worker) {
      this.worker.terminate();
    }

    this.worker = new Worker(new URL('../workers/compiler.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onerror = err => {
      console.error('Compiler worker crashed:', err);
      this.compilationErrorsSignal.set([
        { type: 'Worker Crash', message: 'Compiler worker crashed and was restarted.' },
      ]);
      this.initWorker();
    };

    this.workerProxy = comlink.wrap<CompilerWorker>(this.worker);
  }

  public onContentChange(content: string) {
    if (this.debounceTimer !== undefined) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(async () => {
      if (!this.workerProxy) return;
      const requestId = ++this._compilationId;
      try {
        const result = await this.workerProxy.compile(content);
        if (requestId !== this._compilationId) return;

        if (result.errors) {
          const truncated =
            result.errors.length > MAX_DISPLAYED_ERRORS
              ? [
                  ...result.errors.slice(0, MAX_DISPLAYED_ERRORS),
                  {
                    type: 'Info',
                    message: `...and ${result.errors.length - MAX_DISPLAYED_ERRORS} more errors`,
                  } as any,
                ]
              : result.errors;
          this.compilationErrorsSignal.set(truncated);
          if (!result.ast) {
            this.compiledAstSignal.set(null);
          }
        } else {
          this.compilationErrorsSignal.set([]);
          if (result.ast) {
            this.compiledAstSignal.set(result.ast);
          }
        }
      } catch (err: unknown) {
        console.error('Worker RPC error:', err);
        const error = err as Error;
        if (!error.message?.includes('proxy has been released')) {
          this.compilationErrorsSignal.set([{ type: 'RPC Error', message: error.message }]);
        }
      }
    }, COMPILATION_DEBOUNCE_MS);
  }

  ngOnDestroy() {
    if (this.debounceTimer !== undefined) {
      window.clearTimeout(this.debounceTimer);
    }
    this.workerProxy?.[comlink.releaseProxy]();
    this.worker?.terminate();
  }
}
