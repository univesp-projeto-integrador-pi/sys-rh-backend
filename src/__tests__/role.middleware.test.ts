import { Request, Response, NextFunction } from 'express';
import { requireRole } from '../middlewares/role.middleware';

const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = (): NextFunction => jest.fn();

function mockReqWithRole(role?: string): Partial<Request> {
  return { role: role as any };
}

describe('RoleMiddleware', () => {
  describe('requireRole(ADMIN)', () => {
    it('deve permitir acesso para ADMIN', () => {
      const req  = mockReqWithRole('ADMIN');
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN')(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve bloquear RECRUITER com 403', () => {
      const req  = mockReqWithRole('RECRUITER');
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN')(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve bloquear VIEWER com 403', () => {
      const req  = mockReqWithRole('VIEWER');
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN')(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole(ADMIN, RECRUITER)', () => {
    it('deve permitir ADMIN', () => {
      const req  = mockReqWithRole('ADMIN');
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN', 'RECRUITER')(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('deve permitir RECRUITER', () => {
      const req  = mockReqWithRole('RECRUITER');
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN', 'RECRUITER')(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('deve bloquear VIEWER com 403', () => {
      const req  = mockReqWithRole('VIEWER');
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN', 'RECRUITER')(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('sem role no req', () => {
    it('deve retornar 401 quando role não está presente', () => {
      const req  = mockReqWithRole(undefined);
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN')(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('mensagem de erro', () => {
    it('deve informar quais roles têm acesso na mensagem', () => {
      const req  = mockReqWithRole('VIEWER');
      const res  = mockRes();
      const next = mockNext();

      requireRole('ADMIN', 'RECRUITER')(req as Request, res as Response, next);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toContain('ADMIN');
      expect(jsonCall.message).toContain('RECRUITER');
    });
  });
});