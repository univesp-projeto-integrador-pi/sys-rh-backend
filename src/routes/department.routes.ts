import { Router } from 'express';
import departmentController from '../controllers/department.controller';
import { requireRole } from '../middlewares/role.middleware';
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Gestão de departamentos
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Lista todos os departamentos
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: Lista de departamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 */
router.get('/', departmentController.findAll.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Busca departamento por ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Departamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Departamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', departmentController.findById.bind(departmentController));

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Criar novo departamento
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentDTO'
 *     responses:
 *       201:
 *         description: Departamento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         description: Departamento já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', departmentController.create.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Atualizar departamento
 *     tags: [Departments]
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Departamento atualizado
 *       400:
 *         description: Erro ao atualizar
 */
router.put('/:id', departmentController.update.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Remover departamento
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Departamento removido
 *       400:
 *         description: Erro ao remover
 */
router.delete('/:id', departmentController.delete.bind(departmentController));

// todos podem ver departamentos
router.get('/',    departmentController.findAll.bind(departmentController));
router.get('/:id', departmentController.findById.bind(departmentController));

// apenas ADMIN gerencia departamentos
router.post('/',      requireRole('ADMIN'), departmentController.create.bind(departmentController));
router.put('/:id',    requireRole('ADMIN'), departmentController.update.bind(departmentController));
router.delete('/:id', requireRole('ADMIN'), departmentController.delete.bind(departmentController));

export default router;