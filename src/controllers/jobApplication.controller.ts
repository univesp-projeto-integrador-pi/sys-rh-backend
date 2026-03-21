import { Request, Response } from 'express';
import jobApplicationService from '../services/jobApplication.service';

class JobApplicationController {
  async findAll(req: Request, res: Response) {
    try {
      const applications = await jobApplicationService.findAll();
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const application = await jobApplicationService.findById(id);
      res.json(application);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async findByCandidateId(req: Request, res: Response) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const applications = await jobApplicationService.findByCandidateId(candidateId);
      res.json(applications);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const application = await jobApplicationService.create(req.body);
      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStage(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const application = await jobApplicationService.updateStage(id, req.body);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await jobApplicationService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new JobApplicationController();