import { z } from 'zod';

// Sugestão: Se você tiver um Enum no Prisma, pode usar z.nativeEnum(PrismaEnum)
// Caso contrário, usamos o z.enum com os valores exatos do banco de dados.
export const ApplicationStatusEnum = z.enum([
  'APPLIED', 
  'SCREENING', 
  'INTERVIEW', 
  'OFFER', 
  'HIRED', 
  'REJECTED'
]);

export const createJobApplicationSchema = z.object({
  positionId: z.string().uuid('ID de vaga inválido'),
  // Caso precise enviar o status na criação
  status: ApplicationStatusEnum.optional().default('APPLIED'),
});

export const updateStageSchema = z.object({
  currentStage: ApplicationStatusEnum,
}).strict(); // .strict() impede campos extras não mapeados
