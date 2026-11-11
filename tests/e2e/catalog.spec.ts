// Listados de conjuros y rasgos de clase, con filtros.
import { expect, seed, test, tip } from './helpers';

test('filtros de los listados y rasgos con usos', async ({ page }) => {
  await page.goto(seed('listados', 'brunilda-martillo-de-hierro'));
  await page.click('[data-pick="spells"]');
  await page.selectOption('#pickerFilter', '9');
  const level9 = await page.locator('#pickerList li strong').allInnerTexts();
  expect(level9).toContain('Deseo');
  expect(level9).toHaveLength(9);
  await page.click('#picker [data-close]');

  await page.click('[data-pick="features"]');
  await page.selectOption('#pickerFilter', 'Monje');
  const monk = await page.locator('#pickerList li strong').allInnerTexts();
  expect(monk).toContain('Artes marciales');
  expect(monk).toHaveLength(3);
  await page.selectOption('#pickerFilter', 'Bárbaro');
  await page.fill('#pickerSearch', 'furia');
  await page.click('#pickerList [data-add]');
  await page.click('#picker [data-close]');
  await expect(page.locator('#resources li:has-text("Furia") [data-field=count]')).toHaveText('2 / 2');
  expect(await tip(page, '#features li:has-text("Furia")')).toMatch(/Bárbaro 1/i); // el origen va en versalitas
});
