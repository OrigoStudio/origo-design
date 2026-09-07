import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  worker: {
    format: 'es', // Emit workers as ES modules (standalone files, not inlined)
  },
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  plugins: [angular(), nxViteTsPaths()],
});
