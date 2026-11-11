// En partida: PG temporales, salvaciones contra la muerte y concentración.
// El Hermano Tobías es un clérigo de nivel 5 con 38 PG, CON 14 (+2, sin competencia en su salvación).
import type { Page } from '@playwright/test';
import { disk, expect, saved, seed, test } from './helpers';

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
