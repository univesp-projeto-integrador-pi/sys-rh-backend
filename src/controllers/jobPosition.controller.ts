import { NextFunction, Request, Response } from 'express';
import jobPositionService from '../services/jobPosition.service';

class JobPositionController {

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const position = await jobPositionService.create(req.body);
      res.status(201).json(position);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const position = await jobPositionService.update(id, req.body);
      res.json(position);
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await jobPositionService.delete(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

export default new JobPositionController();