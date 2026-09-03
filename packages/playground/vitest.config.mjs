import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['src/**/*.spec.ts'],
      server: {
        deps: {
          inline: ['monaco-editor'],
        },
      },
    },
    resolve: {
      alias: {
        'monaco-editor': 'monaco-editor/esm/vs/editor/editor.main.js',
      },
    },
  })
);
