import { Request, Response, NextFunction } from "express";
import candidateService from "../services/candidate.service";
import { AppError } from "../middlewares/errorHandler.middleware";

class CandidateExternalController {
  
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const candidate = await candidateService.findById(id);
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async findByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params as { email: string };

      if (!email) {
        throw new AppError("O e-mail é obrigatório para a busca", 400);
      }

      const candidate = await candidateService.findByEmail(email);

      if (!candidate) {
        throw new AppError("Candidato não encontrado", 404);
      }

      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = await candidateService.create(req.body);
      res.status(201).json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const candidate = await candidateService.update(id, req.body);
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await candidateService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidateExternalController();
