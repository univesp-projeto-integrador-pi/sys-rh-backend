import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../middlewares/errorHandler.middleware';

const mockReq = (): Partial<Request> => ({});
const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = (): NextFunction => jest.fn();

describe('ErrorHandler Middleware', () => {
  describe('AppError', () => {
    it('deve retornar status e mensagem corretos para AppError', () => {
      const err  = new AppError('Recurso não encontrado', 404);
      const req  = mockReq();
      const res  = mockRes();
      const next = mockNext();

      errorHandler(err, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recurso não encontrado' });
    });

    it('deve usar status 400 como padrão quando não especificado', () => {
      const err  = new AppError('Dados inválidos');
      const req  = mockReq();
      const res  = mockRes();
      const next = mockNext();

      errorHandler(err, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Dados inválidos' });
    });

    it('deve retornar 409 para conflito', () => {
      const err  = new AppError('Email já cadastrado', 409);
      const req  = mockReq();
      const res  = mockRes();
      const next = mockNext();

      errorHandler(err, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email já cadastrado' });
    });

    it('deve retornar 401 para não autorizado', () => {
      const err  = new AppError('Não autorizado', 401);
      const req  = mockReq();
      const res  = mockRes();
      const next = mockNext();

      errorHandler(err, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Erros genéricos', () => {
    it('deve retornar 500 para erros não esperados', () => {
      const err  = new Error('Erro inesperado do banco');
      const req  = mockReq();
      const res  = mockRes();
      const next = mockNext();

      errorHandler(err, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
    });

    it('não deve expor detalhes internos do erro genérico', () => {
      const err  = new Error('Connection refused at localhost:5432');
      const req  = mockReq();
      const res  = mockRes();
      const next = mockNext();

      errorHandler(err, req as Request, res as Response, next);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).not.toContain('localhost');
      expect(jsonCall.message).not.toContain('5432');
    });
  });
});