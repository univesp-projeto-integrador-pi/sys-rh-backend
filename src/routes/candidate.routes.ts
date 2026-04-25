import { Router } from 'express';
import candidateController from '../controllers/candidate.controller';
import resumeController from '../controllers/resume.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware'; // 👈 Adicionado
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Gestão de candidatos
 */

// 🚀 NOVO: Rota para o usuário ver o próprio perfil (Essencial para o Frontend)
router.get('/me', authMiddleware, candidateController.getMe.bind(candidateController));

// Listagem e busca por ID protegidas para RH/Admin
router.get('/', authMiddleware, requireRole('ADMIN', 'RECRUITER'), candidateController.findAll.bind(candidateController));
router.get('/:id', authMiddleware, requireRole('ADMIN', 'RECRUITER'), candidateController.findById.bind(candidateController));

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Criar perfil de candidato (vincular ao usuário logado)
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
 *       201:
 *         description: Candidato criado
 */

router.post('/', authMiddleware, validate(createCandidateSchema), candidateController.create.bind(candidateController));

router.put('/:id', authMiddleware, requireRole('ADMIN', 'RECRUITER'), validate(updateCandidateSchema), candidateController.update.bind(candidateController));
router.delete('/:id', authMiddleware, requireRole('ADMIN'), candidateController.delete.bind(candidateController));

// --- CURRÍCULOS (Protegidos) ---
router.get('/:candidateId/resume', authMiddleware, resumeController.findByCandidateId.bind(resumeController));
router.post('/:candidateId/resume', authMiddleware, resumeController.create.bind(resumeController));
router.put('/:candidateId/resume', authMiddleware, requireRole('ADMIN', 'RECRUITER'), resumeController.update.bind(resumeController));

export default router;