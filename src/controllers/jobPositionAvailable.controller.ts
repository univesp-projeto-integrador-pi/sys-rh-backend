import { NextFunction, Request, Response } from 'express';
import jobPositionService from '../services/jobPosition.service';

class JobPositionAvailableController {

  async findAllOpen(_req: Request, res: Response, next: NextFunction) {
    try {
      console.log("[JobAvailableController] Listando todas as vagas abertas");
      const positions = await jobPositionService.findAllOpen();
      res.json(positions);
    } catch (error) { 
      next(error); 
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      console.log(`[JobAvailableController] Buscando detalhes da vaga: ${id}`);
      
      const job = await jobPositionService.findById(id);

      if (!job) {
        console.warn(`[JobAvailableController] Vaga ${id} não encontrada no banco.`);
        return res.status(404).json({ message: 'Vaga não encontrada' });
      }

      res.json(job);
    } catch (error) { 
      next(error); 
    }
  }
}

export default new JobPositionAvailableController();