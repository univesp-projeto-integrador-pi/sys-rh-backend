// src/validators/user.validator.ts
import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'RECRUITER', 'VIEWER']),
});