// CA calculada desde la armadura equipada.
import { expect, saved, seed, test, tip } from './helpers';

test('equipar y quitar armadura y escudo recalcula la CA, también en la mesa', async ({ page }) => {
  const ac = page.locator('[data-bind=armorClass]');
  await page.goto(seed('armadura-brunilda', 'brunilda-martillo-de-hierro'));
  await expect(ac).toHaveText('18');
  expect(await tip(page, '[data-entry="ac:"]')).toContain('18 = Cota de mallas 16 + Escudo +2');

  await page.click('#tab-inventario');
  await page.click('#inventory li:has-text("Escudo") [data-edit]');
  await page.uncheck('#editForm [name=equipped]');
  await page.click('#editForm button.primary');
  await page.click('#tab-resumen');
  await expect(ac).toHaveText('16');
  await page.fill('[data-path=acBonus]', '1');
  await page.press('[data-path=acBonus]', 'Tab');
  await expect(ac).toHaveText('17');
  await saved(page);

  await page.goto('/');
  await expect(page.locator('.party-card[href="/personajes/armadura-brunilda"]')).toContainText('17');
});

test('una armadura del listado se equipa sola', async ({ page }) => {
  const ac = page.locator('[data-bind=armorClass]');
  await page.goto(seed('armadura-arannis', 'arannis-valebright'));
  await expect(ac).toHaveText('12');
  await page.click('#tab-inventario');
  await page.click('[data-pick="inventory"]');
  await page.selectOption('#pickerFilter', 'armadura');
  await page.fill('#pickerSearch', 'cuero tachonado');
  await page.click('#pickerList [data-add]');
  await page.click('#picker [data-close]');
  await expect(page.locator('#inventory li:has-text("Cuero tachonado")')).toContainText('Equipado');
  await page.click('#tab-resumen');
  await expect(ac).toHaveText('14');
});

test('Defensa sin armadura del bárbaro', async ({ page }) => {
  await page.goto(seed('armadura-barbaro', 'brunilda-martillo-de-hierro', (c) => {
    Object.assign(c, { name: 'Gorka', className: 'Bárbaro', inventory: [] });
    Object.assign(c.abilities, { des: 14, con: 16 });
  }));
  await expect(page.locator('[data-bind=armorClass]')).toHaveText('15');
});
