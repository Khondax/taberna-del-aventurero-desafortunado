// store.ts lee DATA_DIR al cargarse: se apunta a una carpeta temporal antes de importarlo.
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

let root: string;
let dataDir: string;
let store: typeof import('../../src/lib/store');

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'taberna-store-'));
  dataDir = path.join(root, 'personajes');
  process.env.DATA_DIR = dataDir;
  store = await import('../../src/lib/store');
});
afterAll(() => rm(root, { recursive: true, force: true }));
afterEach(() => vi.useRealTimers());

const snapshots = async (slug: string) => (await readdir(path.join(dataDir, '.historial', slug))).sort();
const onDisk = async (slug: string) => JSON.parse(await readFile(path.join(dataDir, `${slug}.json`), 'utf8'));

describe('store', () => {
  it('crea la carpeta con las fichas de ejemplo y las lista por nombre', async () => {
    const list = await store.listSheets();
    expect(list.map((entry) => entry.slug)).toEqual(['arannis-valebright', 'brunilda-martillo-de-hierro', 'hermano-tobias']);
  });

  it('guarda, sube la versión y rechaza una versión desactualizada', async () => {
    const sheet = (await store.readSheet('hermano-tobias'))!;
    const character = { ...sheet.character, hp: { ...sheet.character.hp, current: 1 } };
    expect(await store.saveCharacter('hermano-tobias', sheet.version, character)).toEqual({ ok: true, version: sheet.version + 1 });
    expect((await onDisk('hermano-tobias')).character.hp.current).toBe(1);
    expect(await store.saveCharacter('hermano-tobias', sheet.version, sheet.character)).toEqual({ ok: false, reason: 'conflict' });
    expect(await store.saveCharacter('no-existe', 0, sheet.character)).toEqual({ ok: false, reason: 'not-found' });
    expect((await onDisk('hermano-tobias')).character.hp.current).toBe(1);
  });

  it('crea fichas con un identificador único derivado del nombre', async () => {
    const { character } = (await store.readSheet('arannis-valebright'))!;
    const renamed = { ...character, name: 'Ñandú Pérez' };
    expect(await store.createCharacter(renamed)).toBe('nandu-perez');
    expect(await store.createCharacter(renamed)).toBe('nandu-perez-2');
    expect(await store.createCharacter({ ...character, name: '¡¿?!' })).toBe('ficha');
    expect((await onDisk('nandu-perez-2')).version).toBe(0);
  });

  it('conserva como mucho una instantánea cada 10 minutos y solo las últimas 30', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    const slug = await store.createCharacter((await store.readSheet('arannis-valebright'))!.character);
    const save = async (hp: number) => {
      const sheet = (await store.readSheet(slug))!;
      return store.saveCharacter(slug, sheet.version, { ...sheet.character, hp: { ...sheet.character.hp, current: hp } });
    };

    await save(1);
    await save(2);
    expect(await snapshots(slug)).toEqual(['2026-01-01T10-00-00.000Z.json']);
    // La instantánea es el archivo anterior al guardado: la versión 0 recién creada.
    expect(JSON.parse(await readFile(path.join(dataDir, '.historial', slug, '2026-01-01T10-00-00.000Z.json'), 'utf8')).version).toBe(0);

    vi.setSystemTime(new Date('2026-01-01T10:09:59Z'));
    await save(3);
    expect(await snapshots(slug)).toHaveLength(1);
    vi.setSystemTime(new Date('2026-01-01T10:10:01Z'));
    await save(4);
    expect(await snapshots(slug)).toHaveLength(2);

    for (let n = 1; n <= 40; n++) {
      vi.setSystemTime(new Date(Date.parse('2026-01-01T11:00:00Z') + n * store.snapshotInterval));
      await save(n);
    }
    const kept = await snapshots(slug);
    expect(kept).toHaveLength(store.snapshotLimit);
    expect(kept.at(-1)).toBe('2026-01-01T17-40-00.000Z.json');
  });

  it('elimina moviendo a la papelera y no lista las subcarpetas', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-02-03T04:05:06Z'));
    expect(await store.deleteCharacter('brunilda-martillo-de-hierro')).toBe(true);
    expect(await store.deleteCharacter('brunilda-martillo-de-hierro')).toBe(false);
    expect(existsSync(path.join(dataDir, '.papelera', 'brunilda-martillo-de-hierro-2026-02-03T04-05-06.000Z.json'))).toBe(true);
    await writeFile(path.join(dataDir, '.historial', 'suelto.json'), '{}');
    const slugs = (await store.listSheets()).map((entry) => entry.slug);
    expect(slugs).not.toContain('brunilda-martillo-de-hierro');
    expect(slugs.every((slug) => !slug.startsWith('.'))).toBe(true);
    expect(await store.readSheet('brunilda-martillo-de-hierro')).toBeNull();
  });

  it('apunta las tiradas aparte, conserva las últimas y no las confunde con una ficha', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-04T20:00:00Z'));
    const before = (await store.listSheets()).map((entry) => entry.slug);
    for (let n = 1; n <= store.rollLimit + 5; n++) {
      await store.logRoll({ slug: 'hermano-tobias', name: 'Hermano Tobías', label: `Tirada ${n}`, result: String(n) });
    }
    const rolls = await store.recentRolls();
    expect(rolls).toHaveLength(store.rollLimit);
    expect(rolls[0]).toEqual({ date: '2026-03-04T20:00:00.000Z', slug: 'hermano-tobias', name: 'Hermano Tobías', label: `Tirada ${store.rollLimit + 5}`, result: String(store.rollLimit + 5) });
    expect(rolls.at(-1)!.label).toBe('Tirada 6');
    expect(existsSync(path.join(dataDir, '.tiradas.json'))).toBe(true);
    expect((await store.listSheets()).map((entry) => entry.slug)).toEqual(before);
  });

  it('las tiradas simultáneas no se pisan', async () => {
    await Promise.all(Array.from({ length: 10 }, (_, n) => store.logRoll({ slug: 'arannis-valebright', name: 'Arannis', label: `Simultánea ${n}`, result: '1' })));
    const labels = (await store.recentRolls()).map((roll) => roll.label);
    for (let n = 0; n < 10; n++) expect(labels).toContain(`Simultánea ${n}`);
  });
});
