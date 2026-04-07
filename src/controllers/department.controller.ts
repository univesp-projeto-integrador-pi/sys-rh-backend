import { NextFunction, Request, Response } from 'express';
import departmentService from '../services/department.service';

class DepartmentController {
    async findAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const departments = await departmentService.findAll();
            res.json(departments);
        } catch (error) { next(error); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            const department = await departmentService.findById(id);
            res.json(department);
        } catch (error) { next(error); }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const department = await departmentService.create(req.body);
            res.status(201).json(department);
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            const department = await departmentService.update(id, req.body);
            res.json(department);
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            await departmentService.delete(id);
            res.status(204).send();
        } catch (error) { next(error); }
    }
}

export default new DepartmentController();