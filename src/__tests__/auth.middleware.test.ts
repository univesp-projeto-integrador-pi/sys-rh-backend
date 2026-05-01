import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middlewares/auth.middleware';

const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = (): NextFunction => jest.fn();

const JWT_SECRET = 'test-secret';

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = JWT_SECRET;
});

describe('AuthMiddleware', () => {
  describe('quando o token é válido', () => {
    it('deve chamar next() e injetar dados no req (userId, email, role e objeto user)', () => {
      const payload = { userId: 'user-123', email: 'user@email.com', role: 'USER' };
      const token = jwt.sign(payload, JWT_SECRET);

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect((req as any).userId).toBe('user-123');
      expect((req as any).email).toBe('user@email.com');
      expect((req as any).role).toBe('USER');
      expect((req as any).user).toEqual({
        id: 'user-123',
        email: 'user@email.com',
        role: 'USER',
      });
    });
  });

  describe('quando o token está ausente ou malformatado', () => {
    it('deve retornar 401 quando Authorization header está ausente', () => {
      const req  = { headers: {} } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido ou malformatado' });
    });

    it('deve retornar 401 quando Authorization não começa com Bearer', () => {
      const req  = { headers: { authorization: 'Basic token123' } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido ou malformatado' });
    });
  });

  describe('quando o token é inválido', () => {
    it('deve retornar 401 com mensagem específica quando token está expirado', () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'user@email.com' },
        JWT_SECRET,
        { expiresIn: '0s' } 
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sua sessão expirou. Faça login novamente.' });
    });

    it('deve retornar 401 quando token tem assinatura inválida ou é malformado', () => {
      const req  = { headers: { authorization: 'Bearer token-invalido' } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não autenticado ou token inválido.' });
    });
  });

  describe('Configuração do Servidor', () => {
    it('deve retornar 500 se JWT_ACCESS_SECRET não estiver definido', () => {
      delete process.env.JWT_ACCESS_SECRET;
      
      const token = jwt.sign({ userId: '1' }, 'any-secret');
      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno de configuração no servidor' });

      process.env.JWT_ACCESS_SECRET = JWT_SECRET;
    });
  });
});