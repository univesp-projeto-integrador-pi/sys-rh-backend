import { Router } from 'express';
import candidateInternalController from '../controllers/candidateInternal.controller';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Gestão de candidatos
 */

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Lista todos os candidatos
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de candidatos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 */
router.get('/', requireRole('ADMIN', 'RECRUITER'), candidateInternalController.findAll.bind(candidateInternalController));

export default router;