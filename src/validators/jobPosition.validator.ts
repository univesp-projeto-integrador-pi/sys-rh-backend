import { z } from 'zod';

export const createJobPositionSchema = z.object({
  title:        z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description:  z.string().optional(),
  departmentId: z.uuid('ID de departamento inválido'),
});

export const updateJobPositionSchema = z.object({
  title:        z.string().min(3).optional(),
  description:  z.string().optional(),
  status:       z.enum(['OPEN', 'CLOSED', 'PAUSED']).optional(),
  departmentId: z.uuid().optional(),
});