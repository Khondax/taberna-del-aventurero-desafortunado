// Espacios al subir de nivel: lanzador medio (paladín), magia de pacto (brujo) y multiclase.
import type { Page } from '@playwright/test';
import { disk, expect, saved, seed, test } from './helpers';

type Slots = Record<string, { current: number; max: number }>;
const caster = (name: string, level: number, slots: Slots, pactSlots: { level: number; current: number; max: number } | null = null) => (c: any) =>
  Object.assign(c, { classes: [{ name, subclass: '', level }], spellSlots: slots, pactSlots, spellcastingAbility: 'car', features: [], hitDice: [{ current: level, max: level, die: 'd10' }] });

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
  await page.goto(seed('espacios-brujo', 'brunilda-martillo-de-hierro', caster('Brujo', 2, {}, { level: 1, current: 0, max: 2 })));
  const summary = await levelUp(page);
  expect(summary).toContain('Espacios de pacto: 2 de nivel 2');
  expect(summary).not.toContain('Espacios:');
  const pact = page.locator('#resources [data-key="pact:"]');
  await expect(pact).toContainText('Espacios de pacto de nivel 2');
  await expect(pact).toContainText('Descanso corto');
  // Los dos espacios gastados siguen gastados aunque suban de nivel.
  await expect(pact.locator('[data-field=count]')).toHaveText('0 / 2');
  await expect(page.locator('#resources [data-key^="slot:"]')).toHaveCount(0);
  await page.click('#shortRest');
  await expect(pact.locator('[data-field=count]')).toHaveText('2 / 2');
});

test('multiclase: subir en una segunda clase y luego en ella', async ({ page }) => {
  // Brunilda: guerrera de nivel 5 (d10), sin conjuros.
  await page.goto(seed('multiclase', 'brunilda-martillo-de-hierro', (c) => (c.hp.current = 20)));
  await expect(page.locator('#levelTotal')).toBeHidden();
  await expect(page.locator('.class-level')).toBeHidden();

  await page.click('#openLevelUp');
  await expect(page.locator('#levelClass')).toHaveValue('0'); // por defecto, la clase que ya tiene
  await page.selectOption('#levelClass', 'nueva:Mago');
  await expect(page.locator('#hpAverageLabel')).toContainText('+7 (4 +3 Con)'); // dado del mago: d6
  await page.click('#stepNext');
  await page.click('#stepNext');
  await expect(page.locator('#levelUpClass')).toHaveText('Guerrera 5 / Mago 1');
  const summary = await page.locator('#levelUpSummary').innerText();
  expect(summary).toContain('Nivel 6 · Mago 1');
  expect(summary).toContain('Espacios: 2 de nivel 1');
  await page.click('#stepNext');

  // La identidad muestra una fila por clase con su nivel, y la insignia el total.
  await expect(page.locator('#levelTotal')).toHaveText('6');
  await expect(page.locator('#levelInput')).toBeHidden();
  await expect(page.locator('[data-path="classes.1.name"]')).toHaveValue('Mago');
  await expect(page.locator('[data-path="classes.1.level"]')).toHaveValue('1');
  await expect(page.locator('[data-bind=eyebrow]')).toHaveText('Nivel 6 · competencia +3');
  // Dados de golpe por tipo y espacios del mago; la aptitud mágica pasa a ser la suya.
  await expect(page.locator('#hitDice [data-spend-hit-die]')).toHaveText([/d10/, /d6/]);
  await expect(page.locator('[data-path="hitDice.1.max"]')).toHaveValue('1');
  await expect(slotCount(page, 1)).toHaveText('2 / 2');
  await expect(page.locator('[data-path=spellcastingAbility]')).toHaveValue('int');

  // Otra vez, ahora en Mago: elegirla de las que ya tiene.
  await page.click('#openLevelUp');
  await page.selectOption('#levelClass', '1');
  await page.click('#stepNext');
  await page.click('#stepNext');
  await expect(page.locator('#levelUpSummary')).toContainText('Nivel 7 · Mago 2');
  await page.click('#stepNext');
  await expect(page.locator('[data-path="classes.1.level"]')).toHaveValue('2');
  await expect(slotCount(page, 1)).toHaveText('3 / 3');
  await saved(page);
  expect(disk('multiclase').character).toMatchObject({
    classes: [{ name: 'Guerrera', level: 5 }, { name: 'Mago', level: 2 }],
    hitDice: [{ die: 'd10', max: 5 }, { die: 'd6', max: 2 }],
  });

  // La vista del máster muestra las clases con su nivel.
  await page.goto('/');
  await expect(page.locator('a.party-card[href="/personajes/multiclase"]')).toContainText('Guerrera 5 / Mago 2');
});
