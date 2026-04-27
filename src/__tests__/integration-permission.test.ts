import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = (): NextFunction => jest.fn();

const JWT_SECRET = 'test-secret-integration';

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = JWT_SECRET;
});

describe('Integração: Auth + Role Middleware (Cenário de Permissão de Vaga)', () => {
  describe('Cenário: Usuário ADMIN criando vaga', () => {
    it('deve permitir usuário ADMIN acessar POST /api/jobs', () => {
      // Step 1: Criar token com role ADMIN
      const token = jwt.sign(
        { userId: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
        JWT_SECRET
      );

      // Step 2: Simular requisição com auth middleware
      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).role).toBe('ADMIN');

      // Step 3: Simular role middleware para rota de criar vaga
      jest.clearAllMocks();
      const res2  = mockRes();
      const next2 = mockNext();

      const roleMiddleware = requireRole('ADMIN', 'RECRUITER');
      roleMiddleware(req as Request, res2 as Response, next2);

      expect(next2).toHaveBeenCalled();
      expect(res2.status).not.toHaveBeenCalled();
    });

    it('deve permitir usuário RECRUITER acessar POST /api/jobs', () => {
      const token = jwt.sign(
        { userId: 'recruiter-1', email: 'recruiter@empresa.com', role: 'RECRUITER' },
        JWT_SECRET
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);
      expect((req as any).role).toBe('RECRUITER');

      jest.clearAllMocks();
      const res2  = mockRes();
      const next2 = mockNext();
      const roleMiddleware = requireRole('ADMIN', 'RECRUITER');
      roleMiddleware(req as Request, res2 as Response, next2);

      expect(next2).toHaveBeenCalled();
    });

    it('deve bloquear usuário VIEWER tentando acessar POST /api/jobs', () => {
      const token = jwt.sign(
        { userId: 'viewer-1', email: 'viewer@empresa.com', role: 'VIEWER' },
        JWT_SECRET
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);
      expect((req as any).role).toBe('VIEWER');

      jest.clearAllMocks();
      const res2  = mockRes();
      const next2 = mockNext();
      const roleMiddleware = requireRole('ADMIN', 'RECRUITER');
      roleMiddleware(req as Request, res2 as Response, next2);

      expect(res2.status).toHaveBeenCalledWith(403);
      expect(next2).not.toHaveBeenCalled();
    });

    it('deve bloquear usuário com token sem role', () => {
      // Este é o bug: token criado sem role field
      const token = jwt.sign(
        { userId: 'user-1', email: 'user@empresa.com' },
        JWT_SECRET
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);
      expect((req as any).role).toBe(null);

      jest.clearAllMocks();
      const res2  = mockRes();
      const next2 = mockNext();
      const roleMiddleware = requireRole('ADMIN', 'RECRUITER');
      roleMiddleware(req as Request, res2 as Response, next2);

      // Deve ser bloqueado com mensagem de "não configurado"
      expect(res2.status).toHaveBeenCalledWith(403);
      const jsonCall = (res2.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toContain('permissões');
    });
  });
});
