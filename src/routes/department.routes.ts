import { Router } from 'express';
import departmentController from '../controllers/department.controller';

const router = Router();

router.get('/',       departmentController.findAll.bind(departmentController));
router.get('/:id',    departmentController.findById.bind(departmentController));
router.post('/',      departmentController.create.bind(departmentController));
router.put('/:id',    departmentController.update.bind(departmentController));
router.delete('/:id', departmentController.delete.bind(departmentController));

export default router;