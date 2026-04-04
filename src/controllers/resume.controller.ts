import { NextFunction, Request, Response } from 'express';
import resumeService from '../services/resume.service';

class ResumeController {
  async findByCandidateId(req: Request, res: Response, next: NextFunction) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const resume = await resumeService.findByCandidateId(candidateId);
      res.json(resume);
   } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const resume = await resumeService.create(candidateId, req.body);
      res.status(201).json(resume);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const resume = await resumeService.update(candidateId, req.body);
      res.json(resume);
    } catch (error) { next(error); }
  }
}

export default new ResumeController();