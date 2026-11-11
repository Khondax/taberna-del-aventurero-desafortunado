// Fichas guardadas como un archivo JSON por personaje en `DATA_DIR` (por defecto
// `data/personajes`, relativo al directorio desde el que se arranca el servidor).
// Si la carpeta no existe, se crea con los ejemplos de `data/ejemplos`. Los archivos de
// versiones anteriores se migran al leerlos y se reescriben en el formato actual al guardar.
import { cp, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { migrate } from './migrate';
import { currentSchemaVersion, sheetFileSchema, type Character, type SheetFile } from './schema';
import { normalize } from './sheet';

const dataDir = path.resolve(process.env.DATA_DIR ?? 'data/personajes');
const samplesDir = path.resolve('data/ejemplos');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
async function writeAtomic(file: string, sheet: SheetFile) {
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(sheet, null, 2)}\n`);
  await rename(tmp, file);
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
