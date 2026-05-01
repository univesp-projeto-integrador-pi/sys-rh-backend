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
 */
router.get('/open', jobPositionAvailableController.findAllOpen.bind(jobPositionAvailableController));

/**
 * @swagger
 * /api/v1/jobs-available/{id}:
 *   get:
 *     summary: Obtém detalhes de uma vaga específica
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes da vaga
 *       404:
 *         description: Vaga não encontrada
 */
router.get('/:id', jobPositionAvailableController.findById.bind(jobPositionAvailableController));

export default router;