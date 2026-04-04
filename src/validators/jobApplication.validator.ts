import { z } from 'zod';

export const createJobApplicationSchema = z.object({
  candidateId: z.string().uuid('ID de candidato inválido'),
  positionId:  z.string().uuid('ID de vaga inválido'),
});

export const updateStageSchema = z.object({
  currentStage: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']),
});