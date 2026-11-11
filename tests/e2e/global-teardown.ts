import { rmSync } from 'node:fs';
import path from 'node:path';

/** Borra la carpeta temporal que crea playwright.config.ts para el DATA_DIR. */
export default function globalTeardown() {
  const dataDir = process.env.TABERNA_E2E_DATA;
  if (dataDir) rmSync(path.dirname(dataDir), { recursive: true, force: true });
}
