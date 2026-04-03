import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');

export const globalLimiter = rateLimit({
  windowMs,
  max: isTest ? 0 : 100,
  message: { message: 'Muitas requisições, tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

export const authLimiter = rateLimit({
  windowMs,
  max: isTest ? 0 : 10,
  message: { message: 'Muitas tentativas de login, tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});