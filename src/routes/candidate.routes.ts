import { Router } from 'express';
import candidateController from '../controllers/candidate.controller';
import resumeController from '../controllers/resume.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Candidates
 *     description: Gestão de perfis de candidatos e currículo
 */

/**
 * @swagger
 * /api/candidates/me:
 *   get:
 *     summary: Obter dados do próprio perfil de candidato
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil do candidato logado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil de candidato não encontrado
 */
router.get('/me', authMiddleware, candidateController.getMe.bind(candidateController));

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Listar todos os candidatos (RH/Admin apenas)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de candidatos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (requer ADMIN ou RECRUITER)
 */
router.get('/', authMiddleware, requireRole('ADMIN', 'RECRUITER'), candidateController.findAll.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Obter candidato por ID (RH/Admin apenas)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *     responses:
 *       200:
 *         description: Dados do candidato
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Candidato não encontrado
 */
router.get('/:id', authMiddleware, requireRole('ADMIN', 'RECRUITER'), candidateController.findById.bind(candidateController));

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Criar perfil de candidato com formação educacional
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
 *               - phone
 *               - education
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Maria Souza
 *               phone:
 *                 type: string
 *                 example: '11999999999'
 *               education:
 *                 type: object
 *                 required:
 *                   - institution
 *                   - degree
 *                   - fieldOfStudy
 *                   - startDate
 *                 properties:
 *                   institution:
 *                     type: string
 *                     example: USP
 *                   degree:
 *                     type: string
 *                     example: Bacharelado
 *                   fieldOfStudy:
 *                     type: string
 *                     example: Engenharia de Software
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                     example: '2020-02-01T00:00:00.000Z'
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                     example: '2024-12-01T00:00:00.000Z'
 *                     nullable: true
 *     responses:
 *       201:
 *         description: Candidato criado com sucesso
 *       400:
 *         description: Validação falhou
 *       401:
 *         description: Não autenticado
 *       409:
 *         description: Candidato já existe para esse e-mail
 */
router.post('/', authMiddleware, validate(createCandidateSchema), candidateController.create.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Atualizar perfil de candidato (RH/Admin apenas)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidato atualizado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Candidato não encontrado
 */
router.put('/:id', authMiddleware, requireRole('ADMIN', 'RECRUITER'), validate(updateCandidateSchema), candidateController.update.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Deletar candidato (Admin apenas)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *     responses:
 *       204:
 *         description: Candidato deletado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (requer ADMIN)
 *       404:
 *         description: Candidato não encontrado
 */
router.delete('/:id', authMiddleware, requireRole('ADMIN'), candidateController.delete.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   get:
 *     summary: Obter currículo do candidato
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *     responses:
 *       200:
 *         description: Currículo do candidato
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Currículo não encontrado
 */
router.get('/:candidateId/resume', authMiddleware, resumeController.findByCandidateId.bind(resumeController));

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   post:
 *     summary: Criar currículo para o candidato
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summary:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               rawText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Currículo criado com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Candidato não encontrado
 */
router.post('/:candidateId/resume', authMiddleware, resumeController.create.bind(resumeController));

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   put:
 *     summary: Atualizar currículo do candidato (RH/Admin apenas)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summary:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               rawText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Currículo atualizado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Candidato não encontrado
 */
router.put('/:candidateId/resume', authMiddleware, requireRole('ADMIN', 'RECRUITER'), resumeController.update.bind(resumeController));

export default router;