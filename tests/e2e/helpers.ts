// Utilidades compartidas por los tests de extremo a extremo.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { test as base, expect, type Page } from '@playwright/test';

export { expect };

/** DATA_DIR del servidor de pruebas (ver playwright.config.ts). */
export const dataDir = process.env.TABERNA_E2E_DATA!;

/** Archivo de ficha tal como está en el disco del servidor. */
export const disk = (slug: string) => JSON.parse(readFileSync(path.join(dataDir, `${slug}.json`), 'utf8'));

/**
 * Copia una ficha de `data/ejemplos` con otro identificador, para que cada test trabaje
 * con su propia ficha. `edit` permite cambiar el personaje antes de guardarlo.
 */
export function seed(slug: string, example: string, edit: (character: any) => void = () => {}) {
  const file = JSON.parse(readFileSync(path.join('data/ejemplos', `${example}.json`), 'utf8'));
  edit(file.character);
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(path.join(dataDir, `${slug}.json`), JSON.stringify(file));
  return `/personajes/${slug}`;
}

/** Espera a que el indicador de la cabecera vuelva a «Guardado». */
export const saved = (page: Page) => expect(page.locator('#saveState')).toHaveText('Guardado', { timeout: 5000 });

/** Texto del tooltip al pasar el ratón por el elemento. */
export async function tip(page: Page, selector: string) {
  // El tooltip se cierra con cualquier scroll: se desplaza antes y se espera un fotograma.
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.mouse.move(0, 0);
  await page.locator(selector).first().hover();
  await expect(page.locator('#tip')).toBeVisible();
  return page.locator('#tip').innerText();
}

/** `test` que falla si la página principal lanza excepciones o escribe errores en consola. */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
      await use(errors);
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});
