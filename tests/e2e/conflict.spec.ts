// Dos pestañas con la misma ficha: la que guarda con una versión antigua se bloquea.
import { disk, expect, saved, seed, test } from './helpers';

test('la segunda pestaña no pisa los cambios de la primera', async ({ page, context }) => {
  const url = seed('conflicto', 'hermano-tobias'); // 38 PG
  const other = await context.newPage(); // fuera del control de errores: su 409 es lo esperado
  await page.goto(url);
  await other.goto(url);

  await page.fill('#hpForm [name=amount]', '3');
  await page.click('#hpForm button[value="-1"]');
  await saved(page);

  await other.fill('#hpForm [name=amount]', '5');
  await other.click('#hpForm button[value="-1"]');
  await expect(other.locator('#saveState')).toHaveAttribute('data-state', 'error');
  await expect(other.locator('#saveState')).toContainText('Recarga la página');
  expect(disk('conflicto').character.hp.current).toBe(35);
});
