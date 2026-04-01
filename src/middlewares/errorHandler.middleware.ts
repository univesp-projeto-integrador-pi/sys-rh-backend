import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
}