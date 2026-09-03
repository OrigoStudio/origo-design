import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  worker: {
    format: 'es', // Emit workers as ES modules (standalone files, not inlined)
  },
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  plugins: [angular()],
});
