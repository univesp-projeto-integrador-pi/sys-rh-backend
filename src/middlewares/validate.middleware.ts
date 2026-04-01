// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      res.status(400).json({
        message: 'Dados inválidos',
        errors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
      return;
    }
    
    req.body = result.data as T;
    next();
  };
}