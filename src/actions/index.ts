// Acciones del servidor que llaman las páginas con `actions.*` desde `astro:actions`.
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { migrate } from '../lib/migrate';
import { importSchema, sheetFileSchema } from '../lib/schema';
import { createCharacter, saveCharacter } from '../lib/store';

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
};
