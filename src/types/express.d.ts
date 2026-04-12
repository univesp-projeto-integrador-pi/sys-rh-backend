import { UserRole } from '@prisma/client';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
      role?:   UserRole;
    }
  }
}