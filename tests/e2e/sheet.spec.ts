// Ficha: campos editables, competencias, tooltips, tiradas, listados, recursos y subida de nivel.
// Arannis es una maga de nivel 5 (competencia +3) con FUE 10, DES 14, INT 18 y un bastón.
import { disk, expect, saved, seed, test, tip } from './helpers';

test('los campos se editan en el sitio, recalculan lo derivado y se guardan', async ({ page }) => {
  await page.goto(seed('ficha-campos', 'arannis-valebright'));
  await page.fill('[data-path=name]', 'Arannis el Desafortunado');
  await page.press('[data-path=name]', 'Enter');
  await saved(page);
  expect(disk('ficha-campos').character.name).toBe('Arannis el Desafortunado');
  await expect(page).toHaveTitle(/^Arannis el Desafortunado/);

  await page.fill('[data-path="abilities.fue"]', '16');
  await page.press('[data-path="abilities.fue"]', 'Tab');
  await expect(page.locator('[data-bind="mod-fue"]')).toHaveText('+3');
  await expect(page.locator('[data-bind="skill-atletismo"]')).toHaveText('+3');
  await expect(page.locator('#weapons li').first()).toContainText('Ataque +6');

  await page.fill('[data-path=level]', '25');
  await page.press('[data-path=level]', 'Tab');
  await expect(page.locator('[data-path=level]')).toHaveValue('20');
  await expect(page.locator('#openLevelUp')).toBeDisabled();
  await page.click('#undo');
  await expect(page.locator('[data-path=level]')).toHaveValue('5');

  await page.fill('[data-path="hp.max"]', '30');
  await page.press('[data-path="hp.max"]', 'Tab');
  await saved(page);
  expect(disk('ficha-campos').character).toMatchObject({ abilities: { fue: 16 }, level: 5, hp: { max: 30 } });
});

test('las competencias alternan entre ninguna, competente y pericia', async ({ page }) => {
  await page.goto(seed('ficha-competencias', 'arannis-valebright'));
  const mark = page.locator('[data-toggle="skills:atletismo"]');
  const bonus = page.locator('[data-bind="skill-atletismo"]');
  await mark.click();
  await expect(mark).toHaveAttribute('data-level', '1');
  await expect(bonus).toHaveText('+3');
  await mark.click();
  await expect(mark).toHaveAttribute('data-level', '2');
  await expect(bonus).toHaveText('+6');
  await mark.click();
  await expect(mark).toHaveAttribute('data-level', '0');
  await expect(bonus).toHaveText('+0');

  await page.click('[data-toggle="saves:fue"]');
  await expect(page.locator('[data-bind="save-fue"]')).toHaveText('+3');
  await saved(page);
  const { character } = disk('ficha-competencias');
  expect(character.savingThrows).toContain('fue');
  expect(character.skills.atletismo ?? 0).toBe(0);
});

test('tooltips con desglose y tirada de ataque', async ({ page }) => {
  await page.goto(seed('ficha-tooltips', 'arannis-valebright'));
  const weapon = await tip(page, '#weapons li');
  expect(weapon).toContain('FUE +0');
  expect(weapon).toContain('competencia +3');
  expect(weapon).toContain('Derribar');
  expect(await tip(page, '[data-entry="skills:arcanos"]')).toContain('pericia +6');
  expect(await tip(page, '[data-entry="ac:"]')).toContain('12 = sin armadura 10 + DES +2');

  await page.click('#weapons [data-roll]');
  await expect(page.locator('#rollResult')).toContainText('ataque d20');
});

test('armas y conjuros desde el listado, con edición y quitar', async ({ page }) => {
  await page.goto(seed('ficha-listados', 'arannis-valebright'));
  await page.click('[data-pick="weapons"]');
  await page.fill('#pickerSearch', 'daga');
  await page.click('#pickerList [data-add]');
  await expect(page.locator('#pickerStatus')).toContainText('Daga');
  await page.click('#picker [data-close]');
  const dagger = await tip(page, '#weapons li:has-text("Daga")');
  expect(dagger).toContain('Sutil');
  expect(dagger).toMatch(/Competencia\s+Sí/);
  expect(dagger).toContain('DES +2');

  await page.click('[data-pick="spells"]');
  await page.selectOption('#pickerFilter', '1');
  await page.fill('#pickerSearch', 'curar heridas');
  await page.click('#pickerList li:has-text("Curar heridas") [data-add]');
  await page.click('#picker [data-close]');
  const cure = await tip(page, '#spells li:has-text("Curar heridas")');
  expect(cure).toContain('2d8 +4 curación');
  expect(cure).toContain('suma INT +4');

  await page.selectOption('[data-path=spellcastingAbility]', 'sab');
  await expect(page.locator('[data-bind=spellDC]')).toHaveText('12');
  await page.selectOption('[data-path=spellcastingAbility]', 'int');
  await expect(page.locator('[data-bind=spellDC]')).toHaveText('15');

  await page.click('#spells li:has-text("Curar heridas") [data-edit]');
  await expect(page.locator('#editDialog')).toHaveJSProperty('open', true);
  await page.fill('#editForm [name=name]', 'Curar heridas menores');
  await page.click('#editForm button.primary');
  await expect(page.locator('#spells')).toContainText('Curar heridas menores');
  await page.click('#spells li:has-text("Curar heridas menores") [data-edit]');
  await page.click('#editDelete');
  await expect(page.locator('#spells')).not.toContainText('Curar heridas');

  // «×» quita la fila sin abrir el diálogo y se puede deshacer.
  await page.click('#weapons li:has-text("Daga") [data-remove]');
  await expect(page.locator('#weapons li:has-text("Daga")')).toHaveCount(0);
  await expect(page.locator('#editDialog')).toHaveJSProperty('open', false);
  await page.click('#undo');
  await expect(page.locator('#weapons li:has-text("Daga")')).toHaveCount(1);
  await saved(page);
  expect(disk('ficha-listados').character.weapons.map((w: { name: string }) => w.name)).toEqual(['Bastón', 'Daga']);
});

test('espacios, objetos propios, rasgos con usos y descansos', async ({ page }) => {
  await page.goto(seed('ficha-recursos', 'arannis-valebright'));
  await page.click('#addSlotLevel');
  const slot4 = page.locator('#resources [data-key="slot:4"]');
  await expect(slot4).toHaveCount(1);
  await slot4.locator('.max-input input').fill('0');
  await slot4.locator('.max-input input').press('Tab');
  await expect(slot4).toHaveCount(0);

  await page.click('#tab-inventario');
  await page.click('[data-pick="inventory"]');
  await page.click('#pickerCustom');
  await page.fill('#editForm [name=name]', 'Gema de la cueva');
  await page.fill('#editForm [name=quantity]', '3');
  await page.fill('#editForm [name=weightKg]', '0.1');
  await page.click('#editForm button.primary');
  await expect(page.locator('#inventory li:has-text("Gema")')).toContainText('× 3');

  await page.click('#tab-resumen');
  await page.click('[data-pick="features"]');
  await page.fill('#pickerSearch', 'inspiración');
  await page.click('#pickerList [data-add]');
  await page.click('#picker [data-close]');
  const inspiration = page.locator('#resources li:has-text("Inspiración heroica")');
  await expect(inspiration).toHaveCount(1);
  await inspiration.locator('[data-delta="-1"]').click();
  await page.click('#longRest');
  await expect(inspiration.locator('[data-field=count]')).toHaveText('0 / 1');

  // «×» en Recursos deja el rasgo sin usos: sale de Recursos pero sigue entre los rasgos.
  await inspiration.locator('[data-remove-resource]').click();
  await expect(inspiration).toHaveCount(0);
  await expect(page.locator('#features')).toContainText('Inspiración heroica');
});

test('subida de nivel con espacios de lanzador completo', async ({ page }) => {
  await page.goto(seed('ficha-nivel', 'arannis-valebright'));
  await page.click('#openLevelUp');
  await page.click('#stepNext');
  await expect(page.locator('#levelUpUses input')).toHaveCount(1);
  await page.click('#stepNext');
  await expect(page.locator('#levelUpSummary')).toContainText('Espacios: 4 de nivel 1, 3 de nivel 2, 3 de nivel 3');
  await page.click('#stepNext');
  await expect(page.locator('[data-path=level]')).toHaveValue('6');
  await saved(page);
  const file = disk('ficha-nivel');
  expect(file).toMatchObject({ schemaVersion: 4, character: { level: 6, spellSlots: { 3: { max: 3 } } } });
});

test('importar un archivo v1 desde la mesa lo migra', async ({ page }) => {
  const v1 = {
    schemaVersion: 1, version: 3,
    character: {
      name: 'Viejo Formato', species: 'Mediano', className: 'Pícaro', subclass: '', background: '', alignment: '', level: 2, xp: 300,
      abilities: { fue: 8, des: 16, con: 12, int: 12, sab: 10, car: 14 }, armorClass: 14, speed: '9 m', perceptionProficient: true,
      hp: { current: 13, max: 13 }, hitDice: { current: 2, max: 2, die: 'd8' }, spellSlots: {}, resources: [], features: [], spells: [],
      inventory: [{ name: 'Daga', kind: 'Arma', weightKg: 1, tag: '× 2' }], history: [], notes: '',
    },
  };
  await page.goto('/');
  await page.setInputFiles('#importFile', { name: 'viejo.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(v1)) });
  await page.waitForURL(/\/personajes\/viejo-formato(-\d+)?$/); // con sufijo si se repite el test
  await expect(page.locator('#weapons li')).toHaveCount(2);
  await expect(page.locator('[data-bind="skill-percepcion"]')).toHaveText('+2');
  await expect(page.locator('[data-bind=armorClass]')).toHaveText('14');
  expect(await tip(page, '#weapons li')).toContain('DES +3');
});

test('en móvil no hay scroll horizontal', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const url of ['/', '/nueva-ficha', seed('ficha-movil', 'hermano-tobias')]) {
    await page.goto(url);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), url).toBe(false);
  }
  await page.close();
});
