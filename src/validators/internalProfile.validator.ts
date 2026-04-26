import { z } from 'zod';

export const createInternalProfileSchema = z.object({
  candidateId:     z.uuid('ID de candidato inválido'),
  departmentId:    z.uuid('ID de departamento inválido'),
  employeeCode:    z.string().min(1, 'Código do colaborador é obrigatório'),
  currentJobTitle: z.string().min(2, 'Cargo deve ter ao menos 2 caracteres'),
  managerId:       z.uuid('ID de gestor inválido').optional(),
});

export const updateInternalProfileSchema = z.object({
  departmentId:    z.uuid().optional(),
  currentJobTitle: z.string().min(2).optional(),
  managerId:       z.uuid().optional(),
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