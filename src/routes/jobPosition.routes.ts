import { Router } from 'express';
import jobPositionController from '../controllers/jobPosition.controller';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createJobPositionSchema, updateJobPositionSchema } from '../validators/jobPosition.validator';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Listar vagas abertas (Público)
router.get('/open', jobPositionController.findAllOpen.bind(jobPositionController));

// Listar todas as vagas (Admin/Recrutador) - Onde o contador é necessário
router.get('/', authMiddleware, jobPositionController.findAll.bind(jobPositionController));

// Buscar vaga por ID
router.get('/:id', jobPositionController.findById.bind(jobPositionController));

// Criar nova vaga
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'RECRUITER'),
  validate(createJobPositionSchema),
  jobPositionController.create.bind(jobPositionController)
);

// Atualizar vaga
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'RECRUITER'),
  validate(updateJobPositionSchema),
  jobPositionController.update.bind(jobPositionController)
);

// Remover vaga
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  jobPositionController.delete.bind(jobPositionController)
);

export default router;