import { Router } from 'express';
import jobApplicationController from '../controllers/jobApplication.controller';
import internalNoteController from '../controllers/internalNote.controller';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: JobApplications
 *   description: Gestão de candidaturas
 */

/**
 * @swagger
 * /api/job-applications:
 *   get:
 *     summary: Lista todas as candidaturas
 *     tags: [JobApplications]
 *     responses:
 *       200:
 *         description: Lista de candidaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobApplication'
 */
router.get('/', jobApplicationController.findAll.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications/{id}:
 *   get:
 *     summary: Busca candidatura por ID
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Candidatura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: Candidatura não encontrada
 */
router.get('/:id', jobApplicationController.findById.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications/candidate/{candidateId}:
 *   get:
 *     summary: Lista candidaturas de um candidato
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de candidaturas do candidato
 *       404:
 *         description: Candidato não encontrado
 */
router.get('/candidate/:candidateId', jobApplicationController.findByCandidateId.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications:
 *   post:
 *     summary: Criar nova candidatura
 *     tags: [JobApplications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [candidateId, positionId]
 *             properties:
 *               candidateId:
 *                 type: string
 *                 format: uuid
 *               positionId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Candidatura criada
 *       400:
 *         description: Candidato já se candidatou para essa vaga ou vaga fechada
 */
router.post('/', jobApplicationController.create.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications/{id}/stage:
 *   patch:
 *     summary: Avançar etapa da candidatura
 *     tags: [JobApplications]
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
 *             required: [currentStage]
 *             properties:
 *               currentStage:
 *                 type: string
 *                 enum: [APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED]
 *     responses:
 *       200:
 *         description: Etapa atualizada
 *       400:
 *         description: Erro ao atualizar etapa
 */
router.patch('/:id/stage', jobApplicationController.updateStage.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications/{id}:
 *   delete:
 *     summary: Remover candidatura (soft delete)
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Candidatura removida
 *       400:
 *         description: Erro ao remover
 */
router.delete('/:id', jobApplicationController.delete.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications/{applicationId}/notes:
 *   get:
 *     summary: Lista notas de uma candidatura
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de notas
 *       404:
 *         description: Candidatura não encontrada
 */
router.get('/:applicationId/notes', internalNoteController.findByApplicationId.bind(internalNoteController));

/**
 * @swagger
 * /api/job-applications/{applicationId}/notes:
 *   post:
 *     summary: Adicionar nota a uma candidatura
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: applicationId
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
 *             required: [content, authorId]
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               authorId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Nota criada
 *       400:
 *         description: Erro ao criar nota
 */
router.post('/:applicationId/notes', internalNoteController.create.bind(internalNoteController));

/**
 * @swagger
 * /api/job-applications/{applicationId}/notes/{id}:
 *   delete:
 *     summary: Remover nota
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Nota removida
 *       400:
 *         description: Erro ao remover
 */
router.delete('/:applicationId/notes/:id', internalNoteController.delete.bind(internalNoteController));
// todos autenticados podem ver
router.get('/',    jobApplicationController.findAll.bind(jobApplicationController));
router.get('/:id', jobApplicationController.findById.bind(jobApplicationController));
router.get('/candidate/:candidateId', jobApplicationController.findByCandidateId.bind(jobApplicationController));

// ADMIN e RECRUITER podem criar e avançar stages
router.post('/',           requireRole('ADMIN', 'RECRUITER'), jobApplicationController.create.bind(jobApplicationController));
router.patch('/:id/stage', requireRole('ADMIN', 'RECRUITER'), jobApplicationController.updateStage.bind(jobApplicationController));

// apenas ADMIN pode deletar candidatura
router.delete('/:id', requireRole('ADMIN'), jobApplicationController.delete.bind(jobApplicationController));

// notas — VIEWER não acessa
router.get('/:applicationId/notes',         requireRole('ADMIN', 'RECRUITER'), internalNoteController.findByApplicationId.bind(internalNoteController));
router.post('/:applicationId/notes',        requireRole('ADMIN', 'RECRUITER'), internalNoteController.create.bind(internalNoteController));
router.delete('/:applicationId/notes/:id',  requireRole('ADMIN', 'RECRUITER'), internalNoteController.delete.bind(internalNoteController));

export default router;