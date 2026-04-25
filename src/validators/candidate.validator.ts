import { z } from 'zod';

export const createCandidateSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  // O e-mail foi removido ou tornado opcional porque o Controller 
  // agora usa o e-mail do Token para garantir a segurança.
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos').optional(),
});

export const updateCandidateSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
});