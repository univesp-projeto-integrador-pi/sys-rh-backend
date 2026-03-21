import { Request, Response } from 'express';
import resumeService from '../services/resume.service';

class ResumeController {
  async findByCandidateId(req: Request, res: Response) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const resume = await resumeService.findByCandidateId(candidateId);
      res.json(resume);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const resume = await resumeService.create(candidateId, req.body);
      res.status(201).json(resume);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const resume = await resumeService.update(candidateId, req.body);
      res.json(resume);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new ResumeController();