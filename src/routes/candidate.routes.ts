import { Router } from 'express';
import candidateController from '../controllers/candidate.controller';
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
 * /api/candidates:
 *   get:
 *     summary: Lista todos os candidatos
 *     tags: [Candidates]
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
router.get('/', candidateController.findAll.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Busca candidato por ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', candidateController.findById.bind(candidateController));

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Cadastrar novo candidato
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
 *       400:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', candidateController.create.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Atualizar candidato
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
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidato atualizado
 *       400:
 *         description: Erro ao atualizar
 */
router.put('/:id', candidateController.update.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Remover candidato (soft delete)
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
 *       400:
 *         description: Erro ao remover
 */
router.delete('/:id', candidateController.delete.bind(candidateController));

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   get:
 *     summary: Busca currículo do candidato
 *     tags: [Candidates]
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
 *     summary: Criar currículo do candidato
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
 *       400:
 *         description: Candidato já possui currículo
 */
router.post('/:candidateId/resume', resumeController.create.bind(resumeController));

/**
 * @swagger
 * /api/candidates/{candidateId}/resume:
 *   put:
 *     summary: Atualizar currículo do candidato
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