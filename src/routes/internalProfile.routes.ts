import { Router } from 'express';
import internalProfileController from '../controllers/internalProfile.controller';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createInternalProfileSchema,
  updateInternalProfileSchema,
  terminateEmployeeSchema,
} from '../validators/internalProfile.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: InternalProfiles
 *   description: Gestão de perfis internos de colaboradores
 */

/**
 * @swagger
 * /api/internal-profiles:
 *   get:
 *     summary: Lista todos os perfis internos
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de perfis internos
 */
router.get('/', internalProfileController.findAll.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles/active:
 *   get:
 *     summary: Lista apenas colaboradores ativos
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de colaboradores ativos
 */
router.get('/active', internalProfileController.findAllActive.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles/department/{departmentId}:
 *   get:
 *     summary: Lista colaboradores de um departamento
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de colaboradores do departamento
 *       404:
 *         description: Departamento não encontrado
 */
router.get('/department/:departmentId', internalProfileController.findByDepartmentId.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles/candidate/{candidateId}:
 *   get:
 *     summary: Busca perfil interno pelo candidato
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil interno encontrado
 *       404:
 *         description: Perfil não encontrado
 */
router.get('/candidate/:candidateId', internalProfileController.findByCandidateId.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles/{id}:
 *   get:
 *     summary: Busca perfil interno por ID
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil interno encontrado
 *       404:
 *         description: Perfil não encontrado
 */
router.get('/:id', internalProfileController.findById.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles/{id}/subordinates:
 *   get:
 *     summary: Lista subordinados de um gestor
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de subordinados
 *       404:
 *         description: Gestor não encontrado
 */
router.get('/:id/subordinates', internalProfileController.findSubordinates.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles:
 *   post:
 *     summary: Criar perfil interno manualmente
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [candidateId, departmentId, employeeCode, currentJobTitle]
 *             properties:
 *               candidateId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               employeeCode:
 *                 type: string
 *               currentJobTitle:
 *                 type: string
 *               managerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Perfil interno criado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Candidato ou departamento não encontrado
 *       409:
 *         description: Candidato já possui perfil interno
 */
router.post('/', requireRole('ADMIN'), validate(createInternalProfileSchema), internalProfileController.create.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles/{id}:
 *   put:
 *     summary: Atualizar perfil interno
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               currentJobTitle:
 *                 type: string
 *               managerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil não encontrado
 */
router.put('/:id', requireRole('ADMIN'), validate(updateInternalProfileSchema), internalProfileController.update.bind(internalProfileController));

/**
 * @swagger
 * /api/internal-profiles/{id}/terminate:
 *   patch:
 *     summary: Desligar colaborador
 *     tags: [InternalProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [terminationReason]
 *             properties:
 *               terminationReason:
 *                 type: string
 *                 enum: [RESIGNATION, DISMISSAL_WITH_CAUSE, DISMISSAL_WITHOUT_CAUSE, END_OF_CONTRACT, MUTUAL_AGREEMENT, RETIREMENT, OTHER]
 *               terminationNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Colaborador desligado
 *       400:
 *         description: Colaborador já foi desligado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil não encontrado
 */
router.patch('/:id/terminate', requireRole('ADMIN'), validate(terminateEmployeeSchema), internalProfileController.terminate.bind(internalProfileController));

export default router;