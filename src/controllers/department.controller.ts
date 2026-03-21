import { Request, Response } from 'express';
import departmentService from '../services/department.service';

class DepartmentController {
    async findAll(req: Request, res: Response) {
        try {
            const departments = await departmentService.findAll();
            res.json(departments);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const department = await departmentService.findById(id);
            res.json(department);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const department = await departmentService.create(req.body);
            res.status(201).json(department);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const department = await departmentService.update(id, req.body);
            res.json(department);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            await departmentService.delete(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new DepartmentController();