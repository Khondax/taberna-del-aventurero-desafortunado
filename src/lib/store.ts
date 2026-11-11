// Fichas guardadas como un archivo JSON por personaje en `DATA_DIR` (por defecto
// `data/personajes`, relativo al directorio desde el que se arranca el servidor).
// Si la carpeta no existe, se crea con los ejemplos de `data/ejemplos`. Los archivos de
// versiones anteriores se migran al leerlos y se reescriben en el formato actual al guardar.
// Antes de guardar se conserva una instantánea del archivo en `.historial/<slug>/`, y al
// eliminar una ficha se mueve a `.papelera/`. Ambas carpetas están dentro de `DATA_DIR`.
// Las últimas tiradas de todas las fichas se guardan aparte, en `.tiradas.json`.
import { copyFile, cp, mkdir, readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { migrate } from './migrate';
import { z } from 'astro/zod';
import { currentSchemaVersion, rollEntrySchema, sheetFileSchema, type Character, type RollEntry, type SheetFile } from './schema';
import { normalize } from './sheet';

const dataDir = path.resolve(process.env.DATA_DIR ?? 'data/personajes');
const samplesDir = path.resolve('data/ejemplos');
const historyDir = path.join(dataDir, '.historial');
const trashDir = path.join(dataDir, '.papelera');
const rollsFile = path.join(dataDir, '.tiradas.json');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Como mucho una instantánea por ficha en este intervalo, y solo las últimas `snapshotLimit`. */
export const snapshotInterval = 10 * 60 * 1000;
export const snapshotLimit = 30;
/** Tiradas que se conservan en `.tiradas.json`. */
export const rollLimit = 50;

export type StoredSheet = { slug: string; sheet: SheetFile } | { slug: string; error: string };
export type SaveResult = { ok: true; version: number } | { ok: false; reason: 'not-found' | 'conflict' };

let ready: Promise<void> | undefined;
const ensureDataDir = () =>
  (ready ??= (async () => {
    if (existsSync(dataDir)) return;
    if (existsSync(samplesDir)) await cp(samplesDir, dataDir, { recursive: true });
    else await mkdir(dataDir, { recursive: true });
  })());

// Encadena las operaciones sobre una misma clave para que leer-comprobar-escribir no se solape.
const queues = new Map<string, Promise<unknown>>();
function serialized<T>(key: string, task: () => Promise<T>): Promise<T> {
  const run = (queues.get(key) ?? Promise.resolve()).then(task, task);
  queues.set(key, run.catch(() => undefined));
  return run;
}

const fileFor = (slug: string) => {
  if (!slugPattern.test(slug)) throw new Error(`Identificador de ficha no válido: ${slug}`);
  return path.join(dataDir, `${slug}.json`);
};

/** Escribe en un temporal y lo renombra, para que un corte nunca deje un archivo a medias. */
async function writeAtomic(file: string, data: unknown) {
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`);
  await rename(tmp, file);
}

/** Marca de tiempo para nombres de archivo: ISO sin «:», que se ordena igual que las fechas. */
const stamp = (time = Date.now()) => new Date(time).toISOString().replaceAll(':', '-');

/**
 * Copia el archivo actual de la ficha a su historial si la última copia tiene más de
 * `snapshotInterval`, y borra las que pasen de `snapshotLimit`.
 */
async function snapshot(slug: string) {
  const dir = path.join(historyDir, slug);
  await mkdir(dir, { recursive: true });
  const names = (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
  if (names.length && names[names.length - 1] > `${stamp(Date.now() - snapshotInterval)}.json`) return;
  const name = `${stamp()}.json`;
  await copyFile(fileFor(slug), path.join(dir, name));
  for (const old of [...names, name].slice(0, -snapshotLimit)) await unlink(path.join(dir, old));
}

async function readFileSheet(file: string): Promise<SheetFile> {
  return sheetFileSchema.parse(migrate(JSON.parse(await readFile(file, 'utf8'))));
}

/** Devuelve la ficha o `null` si no existe. Lanza si el archivo existe pero no es válido. */
export async function readSheet(slug: string): Promise<SheetFile | null> {
  await ensureDataDir();
  if (!slugPattern.test(slug)) return null;
  try {
    return await readFileSheet(fileFor(slug));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

/** Todas las fichas, ordenadas por nombre. Las inválidas se devuelven con su error. */
export async function listSheets(): Promise<StoredSheet[]> {
  await ensureDataDir();
  const slugs = (await readdir(dataDir))
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -'.json'.length))
    .filter((slug) => slugPattern.test(slug));
  const sheets = await Promise.all(
    slugs.map(async (slug): Promise<StoredSheet> => {
      try {
        return { slug, sheet: await readFileSheet(fileFor(slug)) };
      } catch (error) {
        return { slug, error: error instanceof Error ? error.message : String(error) };
      }
    }),
  );
  const label = (entry: StoredSheet) => ('sheet' in entry ? entry.sheet.character.name : entry.slug);
  return sheets.sort((a, b) => label(a).localeCompare(label(b), 'es'));
}

/** Guarda si `expectedVersion` coincide con la del archivo; si no, otra copia guardó antes. */
export function saveCharacter(slug: string, expectedVersion: number, character: Character): Promise<SaveResult> {
  return serialized(slug, async () => {
    const current = await readSheet(slug);
    if (!current) return { ok: false, reason: 'not-found' };
    if (current.version !== expectedVersion) return { ok: false, reason: 'conflict' };
    const version = expectedVersion + 1;
    await snapshot(slug);
    await writeAtomic(fileFor(slug), { schemaVersion: currentSchemaVersion, version, character });
    return { ok: true, version };
  });
}

/** Crea una ficha nueva con un identificador derivado del nombre y la devuelve. */
export function createCharacter(character: Character): Promise<string> {
  return serialized('__create__', async () => {
    await ensureDataDir();
    const base = normalize(character.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ficha';
    let slug = base;
    for (let n = 2; existsSync(fileFor(slug)); n++) slug = `${base}-${n}`;
    await writeAtomic(fileFor(slug), { schemaVersion: currentSchemaVersion, version: 0, character });
    return slug;
  });
}

/** Mueve la ficha a la papelera como `<slug>-<fecha>.json`. Devuelve `false` si ya no existía. */
export function deleteCharacter(slug: string): Promise<boolean> {
  return serialized(slug, async () => {
    await ensureDataDir();
    try {
      await mkdir(trashDir, { recursive: true });
      await rename(fileFor(slug), path.join(trashDir, `${slug}-${stamp()}.json`));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw error;
    }
  });
}

/** Tiradas guardadas, de la más antigua a la más reciente. Si el archivo falta o está dañado, no hay ninguna. */
async function readRolls(): Promise<RollEntry[]> {
  try {
    return z.array(rollEntrySchema).parse(JSON.parse(await readFile(rollsFile, 'utf8')));
  } catch {
    return [];
  }
}

/** Las últimas tiradas de todas las fichas, la más reciente primero. */
export async function recentRolls(): Promise<RollEntry[]> {
  await ensureDataDir();
  return (await readRolls()).reverse();
}

/** Añade una tirada con la hora del servidor y conserva solo las últimas `rollLimit`. */
export function logRoll(roll: Omit<RollEntry, 'date'>): Promise<void> {
  return serialized(rollsFile, async () => {
    await ensureDataDir();
    const rolls = [...(await readRolls()), { date: new Date().toISOString(), ...roll }];
    await writeAtomic(rollsFile, rolls.slice(-rollLimit));
  });
}
