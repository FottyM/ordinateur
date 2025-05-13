import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '.env.test') });

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
    globals: true,
    root: './',
    globalSetup: ['test/globals/setup-pg-test-containers.ts'],
    setupFiles: ['ts-node/register/transpile-only'],
    hookTimeout: 1000 * 60 * 5,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      src: resolve(__dirname, './src'),
      test: resolve(__dirname, './test'),
      '@': resolve(__dirname, './src'),
    },
  },
});
