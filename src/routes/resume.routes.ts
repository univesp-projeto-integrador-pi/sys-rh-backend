import { Router } from 'express';
import resumeController from '../controllers/resume.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Gestão de candidatos
 */

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   get:
 *     summary: Busca currículo do candidato
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Currículo encontrado
 *       404:
 *         description: Currículo não encontrado
 */
router.get('/:candidateId/resume', resumeController.findByCandidateId.bind(resumeController));

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   post:
 *     summary: Criar currículo do candidato (público)
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResumeDTO'
 *     responses:
 *       201:
 *         description: Currículo criado
 *       409:
 *         description: Candidato já possui currículo
 */
router.post('/:candidateId/resume', resumeController.create.bind(resumeController));

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   put:
 *     summary: Atualizar currículo do candidato
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResumeDTO'
 *     responses:
 *       200:
 *         description: Currículo atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Currículo não encontrado
 */
router.put('/:candidateId/resume', resumeController.update.bind(resumeController));

export default router;