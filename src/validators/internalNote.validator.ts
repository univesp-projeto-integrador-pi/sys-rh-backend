import { z } from 'zod';

export const createInternalNoteSchema = z.object({
  content:       z.string().min(1, 'Conteúdo é obrigatório'),
  rating:        z.number().int().min(1).max(5).optional(),
  applicationId: z.uuid('ID de candidatura inválido'),
  authorId:      z.uuid('ID de autor inválido'),
});