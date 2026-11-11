// Pestaña Gestión (exportar, importar y eliminar) y copias de seguridad en el servidor.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { dataDir, disk, expect, saved, seed, test } from './helpers';

test('guardar deja una instantánea en .historial', async ({ page }) => {
  await page.goto(seed('gestion-historial', 'hermano-tobias'));
  await page.click('#hpForm button[value="-1"]');
  await saved(page);
  const dir = path.join(dataDir, '.historial', 'gestion-historial');
  const [snapshot, ...rest] = readdirSync(dir);
  expect(rest).toEqual([]);
  expect(JSON.parse(readFileSync(path.join(dir, snapshot), 'utf8')).character.hp.current).toBe(38);
  expect(disk('gestion-historial').character.hp.current).toBe(37);
});

test('exportar descarga el archivo de disco e importar reemplaza la ficha', async ({ page }) => {
  await page.goto(seed('gestion-importar', 'hermano-tobias'));
  await page.click('#tab-gestion');
  const download = page.waitForEvent('download');
  await page.click('#export');
  const file = JSON.parse(readFileSync(await (await download).path(), 'utf8'));
  expect(file).toEqual(disk('gestion-importar'));

  file.character.name = 'Tobías Importado';
  await page.setInputFiles('#gestion #importFile', { name: 'tobias.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(file)) });
  await expect(page.locator('#importStatus')).toContainText('Ficha reemplazada');
  await expect(page.locator('[data-path=name]')).toHaveValue('Tobías Importado');
  await saved(page);
  expect(disk('gestion-importar').character.name).toBe('Tobías Importado');
});

test('eliminar mueve la ficha a la papelera y vuelve a la mesa', async ({ page }) => {
  const trash = () => (existsSync(path.join(dataDir, '.papelera')) ? readdirSync(path.join(dataDir, '.papelera')) : []).filter((name) => name.startsWith('gestion-eliminar-'));
  const before = trash().length;
  await page.goto(seed('gestion-eliminar', 'hermano-tobias'));
  await page.click('#tab-gestion');
  await page.click('#openDelete');
  await expect(page.locator('#deleteName')).toHaveText('Hermano Tobías');
  await page.click('#confirmDelete');
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('.party-card[href="/personajes/gestion-eliminar"]')).toHaveCount(0);
  expect(existsSync(path.join(dataDir, 'gestion-eliminar.json'))).toBe(false);
  expect(trash()).toHaveLength(before + 1);
});
