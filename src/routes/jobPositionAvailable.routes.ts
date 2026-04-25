import { Router } from 'express';
import jobPositionAvailableController from '../controllers/jobPositionAvailable.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Gestão de vagas
 */

/**
 * @swagger
 * /api/jobs/open:
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

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Lista todas as vagas
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vagas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobPosition'
 */
router.get('/', jobPositionAvailableController.findAll.bind(jobPositionAvailableController));

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Busca vaga por ID (público)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vaga encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobPosition'
 *       404:
 *         description: Vaga não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', jobPositionAvailableController.findById.bind(jobPositionAvailableController));

export default router;