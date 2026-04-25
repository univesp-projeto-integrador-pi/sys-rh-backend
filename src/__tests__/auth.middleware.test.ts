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
    it('deve chamar next() e setar userId e email no req', () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'user@email.com', role: 'USER' },
        JWT_SECRET
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect((req as any).userId).toBe('user-123');
      expect((req as any).email).toBe('user@email.com');
      expect((req as any).role).toBe('USER');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve setar role como null quando token não contém role', () => {
      const token = jwt.sign(
        { userId: 'user-456', email: 'user456@email.com' },
        JWT_SECRET
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect((req as any).userId).toBe('user-456');
      expect((req as any).role).toBe(null);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('quando o token está ausente', () => {
    it('deve retornar 401 quando Authorization header está ausente', () => {
      const req  = { headers: {} } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 quando Authorization não começa com Bearer', () => {
      const req  = { headers: { authorization: 'Basic token123' } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('quando o token é inválido', () => {
    it('deve retornar 401 quando token está expirado', () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'user@email.com' },
        JWT_SECRET,
        { expiresIn: -1 } // já expirado
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 quando token tem assinatura inválida', () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'user@email.com' },
        'chave-errada'
      );

      const req  = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 quando token é uma string aleatória', () => {
      const req  = { headers: { authorization: 'Bearer token-invalido-qualquer' } } as Partial<Request>;
      const res  = mockRes();
      const next = mockNext();

      authMiddleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});