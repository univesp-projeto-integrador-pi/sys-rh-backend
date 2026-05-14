import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AccessTokenPayload } from "../dto/auth.dto";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("[AuthMiddleware] Tentativa de acesso sem token ou formato inválido.");
    return res.status(401).json({ message: 'Token não fornecido ou malformatado' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      console.error("[AuthMiddleware] CRÍTICO: JWT_ACCESS_SECRET não definido no .env");
      return res.status(500).json({ message: "Erro interno de configuração no servidor" });
    }

    const payload = jwt.verify(token, secret) as AccessTokenPayload;

    const request = req as any;
    request.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    request.userId = payload.userId;
    request.email = payload.email;
    request.role = payload.role;

    console.log(`[AuthMiddleware] ✅ Token validado para: ${payload.email} (ID: ${payload.userId})`);
    next();
  } catch (err: any) {
    console.error(`[AuthMiddleware] ❌ Erro ao verificar token: ${err.message}`);

    const message = err.name === 'TokenExpiredError'
      ? 'Sua sessão expirou. Faça login novamente.'
      : 'Usuário não autenticado ou token inválido.';

    return res.status(401).json({ message });
  }
}
