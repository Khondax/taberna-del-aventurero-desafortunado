import { defineConfig } from 'vitest/config';

// Tests unitarios. Los de extremo a extremo (tests/e2e) los pasa Playwright.
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
