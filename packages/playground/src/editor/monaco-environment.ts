// packages/playground/src/editor/monaco-environment.ts
// This file MUST be imported before ANY other monaco-editor import (side-effect)

(window as Window & typeof globalThis & { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') {
      return new Worker(new URL('./json.worker', import.meta.url), { type: 'module' });
    }
    return new Worker(new URL('./editor.worker', import.meta.url), { type: 'module' });
  },
};
