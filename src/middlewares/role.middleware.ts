import { UserRole } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Role do Usuário:', req.role);
    console.log('Roles Permitidas:', roles);
    
    if (!req.role) {
      res.status(403).json({
        message: 'Seu perfil ainda não possui permissões. Aguarde a configuração pelo administrador.'
      });
      return;
    }

    if (!roles.includes(req.role as UserRole)) {
      res.status(403).json({
        message: `Acesso negado. Requer perfil: ${roles.join(' ou ')}`
      });
      return;
    }

    next();
  };
}