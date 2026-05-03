import { Request, Response, NextFunction } from "express";

type Role = "ADMIN" | "RECRUITER" | "VIEWER" | "USER";

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 🔥 CORREÇÃO: usar req.user
    if (!req.user?.role) {
      return res.status(403).json({
        message:
          "Seu perfil ainda não possui permissões. Aguarde a configuração pelo administrador.",
      });
    }

    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({
        message: `Acesso negado. Requer perfil: ${roles.join(" ou ")}`,
      });
    }

    next();
  };
}
