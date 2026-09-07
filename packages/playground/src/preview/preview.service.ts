import { Injectable, signal, OnDestroy } from '@angular/core';
import * as comlink from 'comlink';
import type { CompilerWorker, CompilerError } from '../workers/compiler.worker';
import { CanonicalAST } from '@origo/core';

export const COMPILATION_DEBOUNCE_MS = 400;

@Injectable({ providedIn: 'root' })
export class PreviewService implements OnDestroy {
  public compiledAst = signal<CanonicalAST | null>(null);
  public compilationErrors = signal<CompilerError[]>([]);

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

    if (this.worker) {
      this.worker.terminate();
    }

    this.worker = new Worker(new URL('../workers/compiler.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onerror = err => {
      console.error('Compiler worker crashed:', err);
      this.compilationErrors.set([
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
      try {
        const result = await this.workerProxy.compile(content);
        if (result.errors) {
          this.compilationErrors.set(result.errors);
          if (!result.ast) {
            this.compiledAst.set(null);
          }
        } else {
          this.compilationErrors.set([]);
          if (result.ast) {
            this.compiledAst.set(result.ast);
          }
        }
      } catch (err: unknown) {
        console.error('Worker RPC error:', err);
        const error = err as Error;
        if (!error.message?.includes('proxy has been released')) {
          this.compilationErrors.set([{ type: 'RPC Error', message: error.message }]);
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
