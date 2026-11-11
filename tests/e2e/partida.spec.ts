// En partida: PG temporales, salvaciones contra la muerte, concentración, estados, agotamiento, monedas
// e historial de tiradas compartido.
// El Hermano Tobías es un clérigo de nivel 5 con 38 PG, CON 14 (+2, sin competencia en su salvación).
import type { Page } from '@playwright/test';
import { disk, expect, saved, seed, test, tip } from './helpers';

/** Fija el resultado de los dados: `value` entre 0 y 1 (0 → 1 natural, 0.999 → 20 natural). */
const fixDice = (page: Page, value: number) => page.addInitScript((v) => (Math.random = () => v), value);

async function hp(page: Page, direction: '-1' | '1' | 'temp', amount: number) {
  await page.fill('#hpForm [name=amount]', String(amount));
  await page.click(`#hpForm button[value="${direction}"]`);
}

test('los PG temporales se gastan primero, no se acumulan y no se curan', async ({ page }) => {
  await page.goto(seed('partida-temporales', 'hermano-tobias'));
  await hp(page, 'temp', 5);
  await expect(page.locator('[data-path="hp.temp"]')).toHaveValue('5');
  await hp(page, 'temp', 3);
  await expect(page.locator('[data-path="hp.temp"]')).toHaveValue('5');

  await hp(page, '-1', 8);
  await expect(page.locator('[data-path="hp.temp"]')).toHaveValue('0');
  await expect(page.locator('[data-path="hp.current"]')).toHaveValue('35');
  await expect(page.locator('#rollResult')).toContainText('35 PG');

  await hp(page, 'temp', 4);
  await hp(page, '1', 10);
  await expect(page.locator('[data-path="hp.current"]')).toHaveValue('38');
  await expect(page.locator('[data-path="hp.temp"]')).toHaveValue('4');
  await saved(page);
  expect(disk('partida-temporales').character.hp).toEqual({ current: 38, max: 38, temp: 4 });
});

test('a 0 PG aparecen las salvaciones contra la muerte; el daño suma fallos y curarse las reinicia', async ({ page }) => {
  await fixDice(page, 0.5); // d20 = 11: éxito
  await page.goto(seed('partida-muerte', 'hermano-tobias'));
  const box = page.locator('#deathSaves');
  await expect(box).toBeHidden();
  await hp(page, '-1', 40);
  await expect(box).toBeVisible();
  await expect(box).toContainText('Inconsciente');

  await hp(page, '-1', 1);
  await expect(page.getByRole('checkbox', { name: 'Fallo 1' })).toBeChecked();
  await expect(page.locator('#rollResult')).toContainText('fallo de salvación contra la muerte');

  await page.click('#rollDeathSave');
  await expect(page.getByRole('checkbox', { name: 'Éxito 1' })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Éxito 2' }).check();
  await page.click('#rollDeathSave');
  await expect(box).toContainText('Estabilizado');
  await expect(page.getByRole('checkbox', { name: 'Éxito 1' })).not.toBeChecked();
  await expect(page.locator('#rollDeathSave')).toBeDisabled();
  await saved(page);
  expect(disk('partida-muerte').character.deathSaves).toEqual({ successes: 0, failures: 0, stable: true });

  await hp(page, '1', 3);
  await expect(box).toBeHidden();
  await saved(page);
  expect(disk('partida-muerte').character).toMatchObject({ hp: { current: 3 }, deathSaves: { successes: 0, failures: 0, stable: false } });
});

test('un 20 natural en la salvación contra la muerte recupera 1 PG', async ({ page }) => {
  await fixDice(page, 0.999);
  await page.goto(seed('partida-veinte', 'hermano-tobias', (c) => (c.hp.current = 0)));
  await page.click('#rollDeathSave');
  await expect(page.locator('[data-path="hp.current"]')).toHaveValue('1');
  await expect(page.locator('#deathSaves')).toBeHidden();
});

test('concentración: el daño pide la salvación de Constitución y fallarla la termina', async ({ page }) => {
  await fixDice(page, 0); // d20 = 1: falla
  await page.goto(seed('partida-concentracion', 'hermano-tobias'));
  const select = page.locator('[data-path="concentration"]');
  await select.selectOption('Bendición');
  await expect(page.locator('#endConcentration')).toBeEnabled();

  await hp(page, '-1', 24);
  await expect(page.locator('#rollResult')).toContainText('salvación de Constitución CD 12');
  await page.click('#rollAction');
  await expect(page.locator('#rollResult')).toContainText('pierdes la concentración');
  await expect(select).toHaveValue('');

  // Lanzar un conjuro de concentración sustituye al anterior.
  await select.selectOption('Bendición');
  await page.click('#spells li:has-text("Espíritus guardianes") [data-roll]');
  await expect(select).toHaveValue('Espíritus guardianes');
  await expect(page.locator('#rollResult')).toContainText('sustituye a Bendición');

  await page.click('#endConcentration');
  await expect(select).toHaveValue('');
  await saved(page);
  expect(disk('partida-concentracion').character.concentration).toBeNull();
});

test('estados y agotamiento: se marcan, se explican, penalizan y se ven en la mesa', async ({ page }) => {
  await fixDice(page, 0.5); // d20 = 11
  await page.goto(seed('partida-estados', 'hermano-tobias'));
  const poisoned = page.locator('[data-condition="envenenado"]');
  await poisoned.click();
  await expect(poisoned).toHaveAttribute('aria-pressed', 'true');
  expect(await tip(page, '[data-condition="envenenado"]')).toContain('desventaja en las tiradas de ataque');

  await page.click('[data-exhaustion="1"]');
  await page.click('[data-exhaustion="1"]');
  await expect(page.locator('[data-bind="exhaustionNote"]')).toHaveText('−4 a pruebas d20 · −3 m');
  await expect(page.locator('[data-bind="speedNote"]')).toHaveText('6 m con agotamiento');
  await page.click('[data-roll="skills:religion"]'); // +3: 11 + 3 − 4
  await expect(page.locator('#rollValue')).toHaveText('10');
  await expect(page.locator('#rollLabel')).toContainText('agotamiento −4');
  await saved(page);
  expect(disk('partida-estados').character).toMatchObject({ conditions: ['envenenado'], exhaustion: 2 });

  await page.goto('/');
  const card = page.locator('.party-card[href="/personajes/partida-estados"]');
  await expect(card.locator('.party-tags')).toContainText('Envenenado');
  await expect(card.locator('.party-tags')).toContainText('Agotamiento 2');

  await page.goto('/personajes/partida-estados');
  await page.click('#longRest');
  await expect(page.locator('[data-bind="exhaustion"]')).toHaveText('1 / 6');
});

test('las monedas se editan en el inventario y cuentan para la carga', async ({ page }) => {
  await page.goto(seed('partida-monedas', 'hermano-tobias'));
  await page.click('#tab-inventario');
  await page.getByLabel('Piezas de oro').fill('120');
  await page.getByLabel('Piezas de oro').press('Tab');
  await page.getByLabel('Piezas de plata').fill('30');
  await page.getByLabel('Piezas de plata').press('Tab');
  await expect(page.locator('[data-bind=weight]')).toContainText('(monedas 1,5 kg)');
  await saved(page);
  expect(disk('partida-monedas').character.coins).toEqual({ pc: 0, pp: 30, pe: 0, po: 120, ppt: 0 });
});

test('las tiradas de la ficha se ven en la vista del máster', async ({ page }) => {
  await fixDice(page, 0.5); // d20 = 11
  await page.goto(seed('partida-tiradas', 'hermano-tobias', (c) => (c.name = 'Tobías Tirador')));
  const logged = page.waitForResponse((response) => response.url().includes('logRoll'));
  await page.click('[data-roll="skills:religion"]');
  expect((await logged).ok()).toBe(true);

  await page.goto('/');
  const last = page.locator('#rolls li').first();
  await expect(last).toContainText('Tobías Tirador');
  await expect(last).toContainText('Religión · d20 [11] +3');
  await expect(last.locator('.roll-end strong')).toHaveText('14');
  await expect(last.locator('time')).toHaveText(/^\d{2}:\d{2}$/);
  // La tirada no cambia la versión de la ficha.
  expect(disk('partida-tiradas').version).toBe(0);
});
