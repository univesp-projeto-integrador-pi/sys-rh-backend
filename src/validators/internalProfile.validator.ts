import { z } from 'zod';

export const createInternalProfileSchema = z.object({
  candidateId:     z.string().uuid('ID de candidato inválido'),
  departmentId:    z.string().uuid('ID de departamento inválido'),
  employeeCode:    z.string().min(1, 'Código do colaborador é obrigatório'),
  currentJobTitle: z.string().min(2, 'Cargo deve ter ao menos 2 caracteres'),
  managerId:       z.string().uuid('ID de gestor inválido').optional(),
});

export const updateInternalProfileSchema = z.object({
  departmentId:    z.string().uuid().optional(),
  currentJobTitle: z.string().min(2).optional(),
  managerId:       z.string().uuid().optional(),
});

export const terminateEmployeeSchema = z.object({
  terminationReason: z.enum([
    'RESIGNATION',
    'DISMISSAL_WITH_CAUSE',
    'DISMISSAL_WITHOUT_CAUSE',
    'END_OF_CONTRACT',
    'MUTUAL_AGREEMENT',
    'RETIREMENT',
    'OTHER',
  ]),
  terminationNotes: z.string().optional(),
});