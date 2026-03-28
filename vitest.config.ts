import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000, // 30s timeout for network requests
    include: ['test/**/*.test.ts'],
  },
});
