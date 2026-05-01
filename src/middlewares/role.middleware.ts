import { Request, Response, NextFunction } from 'express';

type Role = 'ADMIN' | 'RECRUITER' | 'VIEWER' | 'USER';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      res.status(403).json({
        message: 'Seu perfil ainda não possui permissões. Aguarde a configuração pelo administrador.'
      });
      return;
    }

    if (!roles.includes(req.role as Role)) {
      res.status(403).json({
        message: `Acesso negado. Requer perfil: ${roles.join(' ou ')}`
      });
      return;
    }

    next();
  };
}