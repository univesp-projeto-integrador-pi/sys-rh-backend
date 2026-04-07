import { NextFunction, Request, Response } from 'express';
import userService from '../services/user.service';

class UserController {
    async findAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.findAll();
            res.json(users);
        } catch (error) { next(error); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            const user = await userService.findById(id);
            res.json(user);
        } catch (error) { next(error); }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await userService.create(req.body);
            res.status(201).json(user);
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            const user = await userService.update(id, req.body);
            res.json(user);
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            await userService.delete(id);
            res.status(204).send();
        } catch (error) { next(error); }
    }
}

export default new UserController();