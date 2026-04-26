import { Request, Response, NextFunction } from 'express';
import candidateService from '../services/candidate.service';

class CandidateInternalController {
  
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await candidateService.findAll();
      res.json(candidates);
    } catch (error) { next(error); }
  }

}

export default new CandidateInternalController();