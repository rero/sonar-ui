/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const root = resolve(__dirname, '.');
const workspaceRoot = resolve(__dirname, '../..');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  cacheDir: resolve(workspaceRoot, 'node_modules/.vite'),
  plugins: [
    angular({
      tsconfig: resolve(root, 'tsconfig.spec.json'),
      include: ['/projects/sonar/src/**/*.spec.ts', '/projects/sonar/tests/**/*.ts'],
    }),
    viteTsConfigPaths({
      root: resolve(root, '../..'),
    }),
  ],

  resolve: {
    alias: {
      'projects/sonar/tests/utils': resolve(root, 'tests/utils.ts'),
    },
    dedupe: [
      '@angular/core',
      '@angular/common',
      '@angular/common/http',
      '@angular/router',
      '@angular/forms',
      '@angular/platform-browser',
      '@ngx-translate/core',
    ],
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(root, 'src/test-setup.ts')],
    include: [resolve(root, 'src/**/*.spec.ts')],
    reporters: ['default'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
