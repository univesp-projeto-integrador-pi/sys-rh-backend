import { Request, Response, NextFunction } from 'express';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';

const richTextFields = ['content', 'summary', 'description', 'rawText'];

function sanitizeValue(key: string, value: any): any {
  if (typeof value !== 'string') return value;
  return richTextFields.includes(key)
    ? sanitizeRichText(value)
    : sanitizeText(value);
}

function sanitizeBody(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null
          ? sanitizeBody(item)
          : sanitizeValue(key, item)
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeBody(value);
    } else {
      result[key] = sanitizeValue(key, value);
    }
  }
  return result;
}

export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeBody(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      const value = req.query[key];
      if (typeof value === 'string') {
        req.query[key] = sanitizeText(value);
      }
    }
  }

  next();
}