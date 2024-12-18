import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: {
          syntax: 'typescript',
          tsx: false,
          decorators: true,
        },
      },
    }) as any,
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
