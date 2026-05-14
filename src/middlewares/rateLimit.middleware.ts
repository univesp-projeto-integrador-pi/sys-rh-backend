import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

// 15 minutos em milisegundos
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');

export const globalLimiter = rateLimit({
  windowMs,
  // Aumentado para 500 em dev para evitar bloqueios chatos enquanto você coda
  max: isTest ? 0 : (isDev ? 1000 : 500), 
  message: { message: 'Muitas requisições, tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  // Se for teste, ele ignora o limite
  skip: (req) => isTest || req.method === 'OPTIONS',
});

export const authLimiter = rateLimit({
  windowMs,
  // Aumentado para 100 em dev. Em produção, 20 tentativas em 15min é um padrão seguro.
  max: isTest ? 0 : (isDev ? 100 : 20), 
  message: { message: 'Muitas tentativas de login, tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTest || req.method === 'OPTIONS',
});