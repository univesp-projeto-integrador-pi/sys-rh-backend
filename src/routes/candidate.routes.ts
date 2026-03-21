import { Router } from 'express';
import candidateController from '../controllers/candidate.controller';
import resumeController from '../controllers/resume.controller';

const router = Router();

router.get('/',       candidateController.findAll.bind(candidateController));
router.get('/:id',    candidateController.findById.bind(candidateController));
router.post('/',      candidateController.create.bind(candidateController));
router.put('/:id',    candidateController.update.bind(candidateController));
router.delete('/:id', candidateController.delete.bind(candidateController));

// resume aninhado sob candidate
router.get('/:candidateId/resume',  resumeController.findByCandidateId.bind(resumeController));
router.post('/:candidateId/resume', resumeController.create.bind(resumeController));
router.put('/:candidateId/resume',  resumeController.update.bind(resumeController));

export default router;