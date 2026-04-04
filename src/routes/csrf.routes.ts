import { Router, Request, Response } from 'express';
import { generateCsrfToken } from '../config/csrf';

const router = Router();

/**
 * @swagger
 * /api/csrf-token:
 *   get:
 *     summary: Retorna o token CSRF para uso nas requisições
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token CSRF gerado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 */
router.get('/', (req: Request, res: Response) => {
  const csrfToken = generateCsrfToken(req, res);
  res.json({ csrfToken });
});

export default router;