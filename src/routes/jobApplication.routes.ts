import { Router } from 'express';
import jobApplicationController from '../controllers/jobApplication.controller';
import internalNoteController from '../controllers/internalNote.controller';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createJobApplicationSchema, updateStageSchema } from '../validators/jobApplication.validator';

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
 *     summary: Listar todas as candidaturas (Admin/Recruiter)
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de candidaturas retornada com sucesso
 */
router.get('/', requireRole('ADMIN', 'RECRUITER'), jobApplicationController.findAll.bind(jobApplicationController));

router.get('/candidate/:candidateId', jobApplicationController.findByCandidateId.bind(jobApplicationController));

router.get('/:id', jobApplicationController.findById.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications:
 *   post:
 *     summary: Criar nova candidatura (Baseado no usuário logado)
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - positionId
 *             properties:
 *               positionId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Candidatura criada com sucesso
 */
router.post('/', validate(createJobApplicationSchema), jobApplicationController.create.bind(jobApplicationController));

/**
 * @swagger
 * /api/job-applications/{id}/stage:
 *   patch:
 *     summary: Atualizar etapa da candidatura
 *     tags: [JobApplications]
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
 *             required:
 *               - currentStage
 *             properties:
 *               currentStage:
 *                 type: string
 *                 enum: [APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED]
 *     responses:
 *       200:
 *         description: Etapa atualizada
 */
router.patch('/:id/stage', requireRole('ADMIN', 'RECRUITER'), validate(updateStageSchema), jobApplicationController.updateStage.bind(jobApplicationController));

router.delete('/:id', requireRole('ADMIN'), jobApplicationController.delete.bind(jobApplicationController));

// --- NOTAS INTERNAS ---
router.get('/:applicationId/notes', requireRole('ADMIN', 'RECRUITER'), internalNoteController.findByApplicationId.bind(internalNoteController));
router.post('/:applicationId/notes', requireRole('ADMIN', 'RECRUITER'), internalNoteController.create.bind(internalNoteController));
router.delete('/:applicationId/notes/:id', requireRole('ADMIN', 'RECRUITER'), internalNoteController.delete.bind(internalNoteController));

export default router;