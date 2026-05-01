import { Router } from 'express';
import candidateInternalController from '../controllers/candidateInternal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateCandidateSchema } from '../validators/candidate.validator';

const router = Router();

/**
 * @swagger
 * tags:
 * - name: Candidates Internal
 * description: Gestão administrativa de candidatos (RH e Admin)
 */

// Listar todos os candidatos (RH/Admin)
router.get('/', authMiddleware, requireRole('ADMIN', 'RECRUITER'), candidateInternalController.findAll.bind(candidateInternalController));

// Visualizar um candidato específico (RH/Admin)
router.get('/:id', authMiddleware, requireRole('ADMIN', 'RECRUITER'), candidateInternalController.findById.bind(candidateInternalController));

// Atualizar perfil de candidato (RH/Admin)
router.put('/:id', authMiddleware, requireRole('ADMIN', 'RECRUITER'), validate(updateCandidateSchema), candidateInternalController.update.bind(candidateInternalController));

// Deletar candidato (Apenas Admin)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), candidateInternalController.delete.bind(candidateInternalController));

export default router;