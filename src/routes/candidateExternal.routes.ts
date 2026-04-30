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

export default router;