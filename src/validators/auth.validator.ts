import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:    z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter ao menos um caractere especial'),
    role: z.enum(['ADMIN', 'RECRUITER', 'VIEWER']).optional(),
  });

export const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});