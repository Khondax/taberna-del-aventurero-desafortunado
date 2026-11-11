// Creación de personajes de nivel 1 (/nueva-ficha).
import { expect, test } from './helpers';

const abilities = ['fue', 'des', 'con', 'int', 'sab', 'car'];

test('matriz estándar: guerrero completo hasta crear la ficha', async ({ page }) => {
  await page.goto('/');
  await page.click('a:has-text("Nueva ficha")');
  await page.waitForURL('**/nueva-ficha');
  await expect(page.locator('#createButton')).toBeDisabled();
  expect(await page.locator('#problems li').count()).toBeGreaterThanOrEqual(2);

  await page.fill('[name=name]', 'Pruebas Valientes');
  await page.selectOption('[name=className]', 'Guerrero');
  const assign = { fue: '0', des: '1', con: '2', int: '5', sab: '3', car: '4' };
  // Por `value`: con una etiqueta, «4» podría coincidir con una tirada de 4 en vez del índice 4.
  for (const [ability, index] of Object.entries(assign)) await page.selectOption(`[data-assign=${ability}]`, { value: index });
  // Reusar el 15 en CAR lo libera de FUE.
  await page.selectOption('[data-assign=car]', { value: '0' });
  await expect(page.locator('[data-assign=fue]')).toHaveValue('');
  await page.selectOption('[data-assign=fue]', { value: '0' });
  await page.selectOption('[data-assign=car]', { value: '4' });
  await page.selectOption('[data-bonus="0"]', 'fue');
  await page.selectOption('[data-bonus="1"]', 'con');
  await page.check('[data-skill=atletismo] input');
  await page.check('[data-skill=percepcion] input');
  await expect(page.locator('[data-skill=atletismo]')).toHaveClass(/suggested/);
  await expect(page.locator('[data-skill=arcanos]')).not.toHaveClass(/suggested/);

  const summary = page.locator('#summary');
  for (const text of ['FUE 17', 'CON 14', '12 = 10 + CON +2', 'Tomar aliento']) await expect(summary).toContainText(text);
  await expect(page.locator('#createButton')).toBeEnabled();

  await page.click('#createButton');
  await page.waitForURL(/\/personajes\/pruebas-valientes(-\d+)?$/); // con sufijo si se repite el test
  await expect(page.locator('[data-path="hp.max"]')).toHaveValue('12');
  await expect(page.locator('[data-bind="skill-atletismo"]')).toHaveText('+5');
  await expect(page.locator('#resources')).toContainText('Tomar aliento');
});

test('compra de puntos y tiradas', async ({ page }) => {
  await page.goto('/nueva-ficha');
  await page.fill('[name=name]', 'Compra');
  await page.check('[name=method][value=pointbuy]');
  for (const ability of abilities) await page.fill(`[data-buy=${ability}]`, '15');
  await expect(page.locator('#problems')).toContainText('54 de 27');
  await expect(page.locator('#createButton')).toBeDisabled();
  for (const ability of abilities) await page.fill(`[data-buy=${ability}]`, '8');
  await page.fill('[data-buy=int]', '15');
  await page.fill('[data-buy=con]', '15');
  await page.fill('[data-buy=des]', '14');
  await expect(page.locator('#methodHelp')).toContainText('25 de 27');

  await page.selectOption('[name=className]', 'Mago');
  await page.check('[name=method][value=roll]');
  await page.click('#rollScores');
  expect((await page.locator('#rollDetail').innerText()).split(' · ')).toHaveLength(6);
  for (const [index, ability] of abilities.entries()) await page.selectOption(`[data-assign=${ability}]`, { value: String(index) });
  await page.check('[name=bonusMode][value="1-1-1"]');
  for (const [index, ability] of ['int', 'con', 'des'].entries()) await page.selectOption(`[data-bonus="${index}"]`, ability);
  await expect(page.locator('#problems li')).toHaveCount(0);
  const summary = page.locator('#summary');
  for (const text of ['2 de nivel 1', 'Inteligencia', 'Recuperación arcana']) await expect(summary).toContainText(text);
});
