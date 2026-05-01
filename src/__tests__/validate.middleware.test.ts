import { Request, Response, NextFunction } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const mockReq = (body: object): Partial<Request> => ({ body });
const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = (): NextFunction => jest.fn();

describe('ValidateMiddleware', () => {
  const schema = z.object({
    name:  z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.email('Email inválido'),
    age:   z.number().min(18, 'Idade mínima é 18 anos').optional(),
  });

  describe('quando os dados são válidos', () => {
    it('deve chamar next() e atualizar req.body com dados parseados', () => {
      const req  = mockReq({ name: 'João', email: 'joao@email.com' });
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve aceitar campos opcionais ausentes', () => {
      const req  = mockReq({ name: 'João', email: 'joao@email.com' });
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('deve aceitar campos opcionais presentes e válidos', () => {
      const req  = mockReq({ name: 'João', email: 'joao@email.com', age: 25 });
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('quando os dados são inválidos', () => {
    it('deve retornar 400 quando campo obrigatório está ausente', () => {
      const req  = mockReq({ name: 'João' }); // email ausente
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Dados inválidos',
        errors: expect.any(Array)
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 400 com mensagem de campo específico quando email é inválido', () => {
      const req  = mockReq({ name: 'João', email: 'email-invalido' });
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors[0].field).toBe('email');
      expect(jsonCall.errors[0].message).toBe('Email inválido');
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando string é muito curta', () => {
      const req  = mockReq({ name: 'J', email: 'joao@email.com' }); // name < 2
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors[0].field).toBe('name');
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar múltiplos erros quando vários campos são inválidos', () => {
      const req  = mockReq({ name: 'J', email: 'invalido' });
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors.length).toBeGreaterThanOrEqual(2);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando campo opcional tem valor inválido', () => {
      const req  = mockReq({ name: 'João', email: 'joao@email.com', age: 16 }); // age < 18
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors[0].field).toBe('age');
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando body está vazio', () => {
      const req  = mockReq({});
      const res  = mockRes();
      const next = mockNext();

      validate(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});