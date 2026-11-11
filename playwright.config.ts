// Tests de extremo a extremo: compila, arranca el build en un puerto de pruebas con un
// DATA_DIR temporal y pasa tests/e2e en Chromium. Se ejecutan con `pnpm test:e2e`.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const port = 4517;
// Los workers vuelven a cargar este archivo y heredan la variable del proceso principal,
// así que todos usan la misma carpeta. `global-teardown.ts` la borra al terminar.
process.env.TABERNA_E2E_DATA ??= path.join(mkdtempSync(path.join(tmpdir(), 'taberna-e2e-')), 'personajes');

export default defineConfig({
  testDir: 'tests/e2e',
  // Un solo servidor y una sola carpeta de datos: los tests van en serie.
  workers: 1,
  globalTeardown: './tests/e2e/global-teardown.ts',
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1400, height: 1000 },
  },
  webServer: {
    command: 'pnpm build && node dist/server/entry.mjs',
    url: `http://127.0.0.1:${port}/`,
    env: { HOST: '127.0.0.1', PORT: String(port), DATA_DIR: process.env.TABERNA_E2E_DATA },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
