import { z } from 'zod';

export const createCandidateSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  // O e-mail foi removido porque o Controller usa o e-mail do Token por segurança.
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos').optional(),
  
  // 🚀 Adicionado: O Zod agora reconhece e valida o objeto de educação
  education: z.object({
    institution: z.string().min(1, 'Instituição é obrigatória'),
    degree: z.string().min(1, 'Grau é obrigatório'),
    fieldOfStudy: z.string().min(1, 'Curso é obrigatório'),
    startDate: z.string().min(1, 'Data de início é obrigatória'),
    endDate: z.string().nullable().optional(),
  }).optional(),
});

export const updateCandidateSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
});