// Acciones del servidor que llaman las páginas con `actions.*` desde `astro:actions`.
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { migrate } from '../lib/migrate';
import { importSchema, rollEntrySchema, sheetFileSchema } from '../lib/schema';
import { createCharacter, deleteCharacter, logRoll, saveCharacter } from '../lib/store';

export const server = {
  /** Guarda la ficha completa. Devuelve la nueva versión o CONFLICT si el archivo cambió entretanto. */
  saveCharacter: defineAction({
    input: z.object({ slug: z.string(), version: sheetFileSchema.shape.version, character: sheetFileSchema.shape.character }),
    handler: async ({ slug, version, character }) => {
      const result = await saveCharacter(slug, version, character);
      if (result.ok) return { version: result.version };
      if (result.reason === 'not-found') throw new ActionError({ code: 'NOT_FOUND', message: 'La ficha ya no existe.' });
      throw new ActionError({ code: 'CONFLICT', message: 'La ficha se guardó desde otra pestaña o dispositivo.' });
    },
  }),

  /** Crea una ficha nueva a partir de un archivo exportado (de esta versión o de una anterior). */
  importCharacter: defineAction({
    input: z.preprocess(migrate, importSchema),
    handler: async ({ character }) => ({ slug: await createCharacter(character) }),
  }),

  /** Valida y migra un archivo exportado sin guardarlo. La ficha lo usa para reemplazar su contenido. */
  parseCharacter: defineAction({
    input: z.preprocess(migrate, importSchema),
    handler: async ({ character }) => ({ character }),
  }),

  /** Mueve la ficha a la papelera del servidor. Desde la interfaz no se puede deshacer. */
  deleteCharacter: defineAction({
    input: z.object({ slug: z.string() }),
    handler: async ({ slug }) => {
      if (!(await deleteCharacter(slug))) throw new ActionError({ code: 'NOT_FOUND', message: 'La ficha ya no existe.' });
    },
  }),

  /** Apunta una tirada en el historial compartido que ve la mesa. No toca la ficha. */
  logRoll: defineAction({
    input: rollEntrySchema.omit({ date: true }),
    handler: (roll) => logRoll(roll),
  }),
};
