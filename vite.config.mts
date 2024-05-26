import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/node_modules/**', '**/commitlint.config.ts', '**/release.config.cjs', '**/index.ts'],
    },
    setupFiles: ['dotenv/config'],
    testTimeout: 10_000,
    restoreMocks: true,
    globals: true,
  },
  plugins: [tsconfigPaths()],
});
