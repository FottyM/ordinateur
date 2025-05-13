import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '.env.test') });

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    globalSetup: [
      'test/globals/setup-pg-test-containers.ts',
      'test/globals/setup-redis-test-container.ts',
    ],
    setupFiles: [
      // Added this because type orm models throw error without
      'ts-node/register/transpile-only',
    ],
    hookTimeout: 1000 * 60 * 5,
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
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
