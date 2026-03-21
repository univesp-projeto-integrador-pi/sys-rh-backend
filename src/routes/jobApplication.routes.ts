import { Router } from 'express';
import jobApplicationController from '../controllers/jobApplication.controller';
import internalNoteController from '../controllers/internalNote.controller';

const router = Router();

router.get('/',       jobApplicationController.findAll.bind(jobApplicationController));
router.get('/:id',    jobApplicationController.findById.bind(jobApplicationController));
router.post('/',      jobApplicationController.create.bind(jobApplicationController));
router.patch('/:id/stage', jobApplicationController.updateStage.bind(jobApplicationController));
router.delete('/:id', jobApplicationController.delete.bind(jobApplicationController));

// notes aninhadas sob application
router.get('/:applicationId/notes',  internalNoteController.findByApplicationId.bind(internalNoteController));
router.post('/:applicationId/notes', internalNoteController.create.bind(internalNoteController));
router.delete('/:applicationId/notes/:id', internalNoteController.delete.bind(internalNoteController));

export default router;