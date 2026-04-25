import { NextFunction, Request, Response } from 'express';
import jobPositionService from '../services/jobPosition.service';

class JobPositionAvailableController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const positions = await jobPositionService.findAll();
      res.json(positions);
    } catch (error) { next(error); }
  }

  async findAllOpen(_req: Request, res: Response, next: NextFunction) {
    try {
      const positions = await jobPositionService.findAllOpen();
      res.json(positions);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const position = await jobPositionService.findById(id);
      res.json(position);
    } catch (error) { next(error); }
  }

}

export default new JobPositionAvailableController();