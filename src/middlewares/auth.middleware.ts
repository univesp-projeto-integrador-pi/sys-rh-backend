import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AccessTokenPayload } from '../dto/auth.dto';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AccessTokenPayload;
    req.userId = payload.userId;
    req.email  = payload.email;
    req.role   = payload.role ?? null;
    next();
  } catch (err: any) {
    // Esse log vai aparecer no terminal do VS Code (Backend)
    console.error("❌ ERRO NO JWT:", err.message); 
    
    // Essa mensagem vai aparecer no seu log do Front-end
    res.status(401).json({ message: `Sessão inválida: ${err.message}` });
  }
}