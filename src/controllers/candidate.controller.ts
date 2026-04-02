import { Request, Response, NextFunction } from 'express';
import candidateService from '../services/candidate.service';

class CandidateController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await candidateService.findAll();
      res.json(candidates);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const candidate = await candidateService.findById(id);
      res.json(candidate);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = await candidateService.create(req.body);
      res.status(201).json(candidate);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const candidate = await candidateService.update(id, req.body);
      res.json(candidate);
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await candidateService.delete(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

export default new CandidateController();