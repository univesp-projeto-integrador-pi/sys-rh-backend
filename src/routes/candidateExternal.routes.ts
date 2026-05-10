import { Router } from 'express';
import resumeController from '../controllers/resume.controller';
import { validate } from '../middlewares/validate.middleware';
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';
import candidateExternalController from '../controllers/candidateExternal.controller';

const router = Router();

router.post('/', validate(createCandidateSchema), candidateExternalController.create.bind(candidateExternalController));
router.get('/email/:email', candidateExternalController.findByEmail.bind(candidateExternalController));
router.get('/:id', candidateExternalController.findById.bind(candidateExternalController));
router.put('/:id', validate(updateCandidateSchema), candidateExternalController.update.bind(candidateExternalController));
router.delete('/:id', candidateExternalController.delete.bind(candidateExternalController));
router.get('/:candidateId/resume', resumeController.findByCandidateId.bind(resumeController));
router.post('/:candidateId/resume', resumeController.create.bind(resumeController));
router.put('/:candidateId/resume', resumeController.update.bind(resumeController));

export default router;