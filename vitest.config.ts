import { defineConfig } from 'vitest/config';

// Unit tests for pure modules (src/lib). They do not import astro:* modules.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
});
