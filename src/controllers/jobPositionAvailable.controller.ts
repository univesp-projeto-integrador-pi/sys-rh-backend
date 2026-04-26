import { NextFunction, Request, Response } from 'express';
import jobPositionService from '../services/jobPosition.service';

class JobPositionAvailableController {

  async findAllOpen(_req: Request, res: Response, next: NextFunction) {
    try {
      const positions = await jobPositionService.findAllOpen();
      res.json(positions);
    } catch (error) { next(error); }
  }

}

export default new JobPositionAvailableController();