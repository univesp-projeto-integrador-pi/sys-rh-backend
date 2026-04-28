import { Router } from 'express';
import resumeController from '../controllers/resume.controller';
import { validate } from '../middlewares/validate.middleware';
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';
import candidateExternalController from '../controllers/candidateExternal.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/candidates-external:
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
 *       409:
 *         description: Email já cadastrado
 */
router.post('/', validate(createCandidateSchema), candidateExternalController.create.bind(candidateExternalController));

/**
 * @swagger
 * /api/v1/candidates-external/{id}:
 *   get:
 *     summary: Visualiza o próprio perfil
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Candidato encontrado
 *       404:
 *         description: Candidato não encontrado
 */
router.get('/:id', candidateExternalController.findById.bind(candidateExternalController));

/**
 * @swagger
 * /api/v1/candidates-external/{id}:
 *   put:
 *     summary: Atualiza o próprio perfil
 *     tags: [Candidates]
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
 *             $ref: '#/components/schemas/UpdateCandidateDTO'
 *     responses:
 *       200:
 *         description: Candidato atualizado
 *       404:
 *         description: Candidato não encontrado
 */
router.put('/:id', validate(updateCandidateSchema), candidateExternalController.update.bind(candidateExternalController));

/**
 * @swagger
 * /api/v1/candidates-external/{id}:
 *   delete:
 *     summary: Remove o próprio cadastro
 *     tags: [Candidates]
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
 *       404:
 *         description: Candidato não encontrado
 */
router.delete('/:id', candidateExternalController.delete.bind(candidateExternalController));

/**
 * @swagger
 * /api/v1/candidates-external/{candidateId}/resume:
 *   post:
 *     summary: Envia o próprio currículo
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
 * /api/v1/candidates-external/{candidateId}/resume:
 *   put:
 *     summary: Atualiza o próprio currículo
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
 *       200:
 *         description: Currículo atualizado
 *       404:
 *         description: Currículo não encontrado
 */
router.put('/:candidateId/resume', resumeController.update.bind(resumeController));

export default router;