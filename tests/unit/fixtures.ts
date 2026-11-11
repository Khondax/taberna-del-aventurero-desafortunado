// Fichas de partida para los tests: los ejemplos de data/ejemplos (formato actual), los
// mismos ejemplos en formato v2, copiados del commit anterior a la CA calculada, y el
// Hermano Tobías en formato v3 (anterior al estado en partida y las monedas) y v4 (anterior
// a la recuperación parcial y la multiclase).
import { readFileSync } from 'node:fs';
import { itemCatalog } from '../../src/data/catalog';
import type { Character, InventoryItem } from '../../src/lib/schema';

const read = (file: string) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));

export const example = (slug: string): Character => read(`../../data/ejemplos/${slug}.json`).character;
export const v2Example = (slug: string) => read(`../fixtures/v2-${slug}.json`);
export const v3Example = (slug: string) => read(`../fixtures/v3-${slug}.json`);
export const v4Example = (slug: string) => read(`../fixtures/v4-${slug}.json`);

/** Ficha de prueba: Arannis (maga de nivel 5) sin inventario, con lo que se indique encima. */
export const character = (overrides: Partial<Character> = {}): Character => ({ ...example('arannis-valebright'), inventory: [], ...overrides });

/** Objeto del listado (armaduras incluidas), equipado. */
export const equipped = (name: string): InventoryItem => {
  const item = itemCatalog.find((entry) => entry.name === name);
  if (!item) throw new Error(`No está en el listado: ${name}`);
  return { ...structuredClone(item), equipped: true };
};
