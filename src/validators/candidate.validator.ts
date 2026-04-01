import { z } from 'zod';

export const createCandidateSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:    z.string().email('Email inválido'),
  phone:    z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
});

export const updateCandidateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone:    z.string().regex(/^\d{10,11}$/).optional(),
});