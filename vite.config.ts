/// <reference types="vitest" />
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
// We have urls containing dots, this plugin is needed to make the dev server handle them and return the index.html instead of a 404
import pluginRewriteAll from 'vite-plugin-rewrite-all';

export default defineConfig({
  plugins: [vue(), eslintPlugin(), pluginRewriteAll()],
  build: {
    sourcemap: true,
  },
  resolve: { dedupe: ['vue'] },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup-router-mock.ts'],
  },
});
