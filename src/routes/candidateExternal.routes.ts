import { Router } from 'express';
import resumeController from '../controllers/resume.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware'; // 👈 Adicionado
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';
import candidateExternalController from '../controllers/candidateExternal.controller';

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
 *   post:
 *     summary: Cadastrar novo candidato (público)
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCandidateDTO'
 *     responses:
 *       201:
 *         description: Candidato criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createCandidateSchema), candidateExternalController.create.bind(candidateExternalController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Atualizar candidato
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidato atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Candidato não encontrado
 */
router.put('/:id', validate(updateCandidateSchema), candidateExternalController.update.bind(candidateExternalController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Remover candidato (soft delete)
 *     tags: [Candidates]
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
 *         description: Candidato removido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Candidato não encontrado
 */
router.delete('/:id', candidateExternalController.delete.bind(candidateExternalController));

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
 *         description: Candidato criado
 */

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