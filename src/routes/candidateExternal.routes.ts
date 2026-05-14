import { Router } from 'express';
import candidateExternalController from '../controllers/candidateExternal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';

const router = Router();

router.get('/me', authMiddleware, (req, res, next) => candidateExternalController.getMe(req, res, next));

router.post('/', authMiddleware, validate(createCandidateSchema), (req, res, next) => candidateExternalController.create(req, res, next));

router.get('/:id', authMiddleware, (req, res, next) => candidateExternalController.findById(req, res, next));

router.put('/:id', authMiddleware, validate(updateCandidateSchema), (req, res, next) => candidateExternalController.update(req, res, next));

router.delete('/:id', authMiddleware, (req, res, next) => candidateExternalController.delete(req, res, next));
router.post('/', validate(createCandidateSchema), candidateExternalController.create.bind(candidateExternalController));
router.get('/email/:email', candidateExternalController.findByEmail.bind(candidateExternalController));
router.get('/:id', candidateExternalController.findById.bind(candidateExternalController));
router.put('/:id', validate(updateCandidateSchema), candidateExternalController.update.bind(candidateExternalController));
router.delete('/:id', candidateExternalController.delete.bind(candidateExternalController));
router.get('/:candidateId/resume', resumeController.findByCandidateId.bind(resumeController));
router.post('/:candidateId/resume', resumeController.create.bind(resumeController));
router.put('/:candidateId/resume', resumeController.update.bind(resumeController));

export default router;