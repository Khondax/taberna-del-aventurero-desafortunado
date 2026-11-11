// Espacios al subir de nivel: lanzador medio (paladín) y magia de pacto (brujo).
import type { Page } from '@playwright/test';
import { expect, seed, test } from './helpers';

const caster = (className: string, level: number, slots: Record<string, { current: number; max: number }>) => (c: any) =>
  Object.assign(c, { className, subclass: '', level, spellSlots: slots, spellcastingAbility: 'car', features: [], hitDice: { current: level, max: level, die: 'd10' } });

/** Sube un nivel con las opciones por defecto y devuelve el resumen del asistente. */
async function levelUp(page: Page) {
  await page.click('#openLevelUp');
  await page.click('#stepNext');
  await page.click('#stepNext');
  const summary = await page.locator('#levelUpSummary').innerText();
  await page.click('#stepNext');
  return summary;
}
const slotCount = (page: Page, level: number) => page.locator(`#resources [data-key="slot:${level}"] [data-field=count]`);

test('paladín de nivel 4 a 5: gana un espacio de nivel 1 y dos de nivel 2', async ({ page }) => {
  await page.goto(seed('espacios-paladin', 'brunilda-martillo-de-hierro', caster('Paladín', 4, { 1: { current: 1, max: 3 } })));
  expect(await levelUp(page)).toContain('4 de nivel 1, 2 de nivel 2');
  await expect(slotCount(page, 1)).toHaveText('2 / 4');
  await expect(slotCount(page, 2)).toHaveText('2 / 2');
});

test('brujo de nivel 2 a 3: los espacios de pacto suben de nivel y vuelven con descanso corto', async ({ page }) => {
  await page.goto(seed('espacios-brujo', 'brunilda-martillo-de-hierro', caster('Brujo', 2, { 1: { current: 0, max: 2 } })));
  const summary = await levelUp(page);
  expect(summary).toContain('2 de nivel 2');
  expect(summary).not.toContain('nivel 1');
  await expect(page.locator('#resources [data-key="slot:1"]')).toHaveCount(0);
  await expect(slotCount(page, 2)).toHaveText('2 / 2');
  await expect(page.locator('#resources [data-key="slot:2"]')).toContainText('Descanso corto');

  await page.locator('#resources [data-key="slot:2"] [data-delta="-1"]').click();
  await page.locator('#resources [data-key="slot:2"] [data-delta="-1"]').click();
  await expect(slotCount(page, 2)).toHaveText('0 / 2');
  await page.click('#shortRest');
  await expect(slotCount(page, 2)).toHaveText('2 / 2');
});
