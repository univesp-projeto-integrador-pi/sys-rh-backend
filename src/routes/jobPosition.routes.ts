import { Router } from 'express';
import jobPositionController from '../controllers/jobPosition.controller';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createJobPositionSchema, updateJobPositionSchema } from '../validators/jobPosition.validator';

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
router.get('/open', jobPositionController.findAllOpen.bind(jobPositionController));

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
router.get('/', jobPositionController.findAll.bind(jobPositionController));

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
router.get('/:id', jobPositionController.findById.bind(jobPositionController));

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Criar nova vaga
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobPositionDTO'
 *     responses:
 *       201:
 *         description: Vaga criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobPosition'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Departamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireRole('ADMIN', 'RECRUITER'), validate(createJobPositionSchema), jobPositionController.create.bind(jobPositionController));

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Atualizar vaga
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED, PAUSED]
 *     responses:
 *       200:
 *         description: Vaga atualizada
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Vaga não encontrada
 */
router.put('/:id', requireRole('ADMIN', 'RECRUITER'), validate(updateJobPositionSchema), jobPositionController.update.bind(jobPositionController));

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Remover vaga
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Vaga removida
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Vaga não encontrada
 */
router.delete('/:id', requireRole('ADMIN'), jobPositionController.delete.bind(jobPositionController));

export default router;