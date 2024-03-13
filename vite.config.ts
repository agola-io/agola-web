/// <reference types="vitest" />
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [vue(), eslintPlugin()],
  build: {
    sourcemap: true,
  },
  resolve: { dedupe: ['vue'] },
  test: {
    globals: true,
    // try to prevent issue https://github.com/vitest-dev/vitest/issues/3077
    pool: 'forks',
    environment: 'jsdom',
    setupFiles: ['./tests/setup-router-mock.ts'],
  },
});
