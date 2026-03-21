import { Request, Response } from 'express';
import jobPositionService from '../services/jobPosition.service';

class JobPositionController {
  async findAll(req: Request, res: Response) {
    try {
      const positions = await jobPositionService.findAll();
      res.json(positions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findAllOpen(req: Request, res: Response) {
    try {
      const positions = await jobPositionService.findAllOpen();
      res.json(positions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const position = await jobPositionService.findById(id);
      res.json(position);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const position = await jobPositionService.create(req.body);
      res.status(201).json(position);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const position = await jobPositionService.update(id, req.body);
      res.json(position);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await jobPositionService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new JobPositionController();