import { z } from 'zod';

export const createJobApplicationSchema = z.object({
  // Removemos o candidateId daqui pois ele será injetado pelo Service 
  // através do e-mail contido no Token JWT.
  positionId: z.string().uuid('ID de vaga inválido'),
});

export const updateStageSchema = z.object({
  currentStage: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'], {
    errorMap: () => ({ message: "Etapa da candidatura inválida" })
  }),
});