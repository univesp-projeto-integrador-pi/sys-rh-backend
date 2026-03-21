import { Router } from 'express';
import jobPositionController from '../controllers/jobPosition.controller';

const router = Router();

router.get('/open',   jobPositionController.findAllOpen.bind(jobPositionController));
router.get('/',       jobPositionController.findAll.bind(jobPositionController));
router.get('/:id',    jobPositionController.findById.bind(jobPositionController));
router.post('/',      jobPositionController.create.bind(jobPositionController));
router.put('/:id',    jobPositionController.update.bind(jobPositionController));
router.delete('/:id', jobPositionController.delete.bind(jobPositionController));

export default router;