import { Request, Response, NextFunction } from 'express';

type Role = 'ADMIN' | 'RECRUITER' | 'VIEWER';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    if (!roles.includes(req.role)) {
      res.status(403).json({
        message: `Acesso negado. Requer perfil: ${roles.join(' ou ')}`
      });
      return;
    }

    next();
  };
}