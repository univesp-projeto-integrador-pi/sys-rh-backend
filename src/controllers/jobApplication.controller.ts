import { NextFunction, Request, Response } from 'express';
import jobApplicationService from '../services/jobApplication.service';

class JobApplicationController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await jobApplicationService.findAll();
      res.json(applications);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const application = await jobApplicationService.findById(id);
      res.json(application);
    } catch (error) { next(error); }
  }

  async findByCandidateId(req: Request, res: Response, next: NextFunction) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const applications = await jobApplicationService.findByCandidateId(candidateId);
      res.json(applications);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await jobApplicationService.create(req.body);
      res.status(201).json(application);
    } catch (error) { next(error); }
  }

  async updateStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const requestingUserId = req.userId!;
      const application = await jobApplicationService.updateStage(id, req.body, requestingUserId);
      res.json(application);
    } catch (error) { next(error); }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await jobApplicationService.delete(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

export default new JobApplicationController();