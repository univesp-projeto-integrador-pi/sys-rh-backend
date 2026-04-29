import { Router } from 'express';
import jobPositionAvailableController from '../controllers/jobPositionAvailable.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Gestão de vagas para candidatos (Público)
 */

/**
 * @swagger
 * /api/v1/jobs-available/open:
 *   get:
 *     summary: Lista todas as vagas abertas (público)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Lista de vagas abertas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobPosition'
 */
router.get('/open', jobPositionAvailableController.findAllOpen.bind(jobPositionAvailableController));

export default router;