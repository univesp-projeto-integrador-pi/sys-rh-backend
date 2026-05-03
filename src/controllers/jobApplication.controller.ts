import { NextFunction, Request, Response } from "express";
import jobApplicationService from "../services/jobApplication.service";
import { AppError } from "../middlewares/errorHandler.middleware";

// Tipagem dos params
type IdParams = {
  id: string;
};

type CandidateParams = {
  candidateId: string;
};

class JobApplicationController {
  // privado
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await jobApplicationService.findAll();
      res.json(applications);
    } catch (error) {
      next(error);
    }
  }

  // publico
  async findById(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const application = await jobApplicationService.findById(req.params.id);
      res.json(application);
    } catch (error) {
      next(error);
    }
  }

  // buscar por candidato
  async findByCandidateId(
    req: Request<CandidateParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const applications = await jobApplicationService.findById(
        req.params.candidateId,
      );
      res.json(applications);
    } catch (error) {
      next(error);
    }
  }

  // publico
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      const { positionId } = req.body;

      console.log(
        `[Controller] Iniciando candidatura - User: ${userEmail}, Vaga: ${positionId}`,
      );

      if (!userId || !userEmail) {
        throw new AppError("Usuário não autenticado ou sessão incompleta", 401);
      }

      if (!positionId) {
        throw new AppError("ID da vaga não fornecido", 400);
      }

      const application = await jobApplicationService.create(
        positionId,
        userEmail,
      );

      console.log("[Controller] Candidatura criada com sucesso!");
      res.status(201).json(application);
    } catch (error: any) {
      console.error("[Controller Error]:", error.message);
      next(error);
    }
  }

  // privado
  async updateStage(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const requestingUserId = req.user!.id;
      const application = await jobApplicationService.updateStage(
        req.params.id,
        req.body,
        requestingUserId,
      );
      res.json(application);
    } catch (error) {
      next(error);
    }
  }

  // publico
  async delete(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      await jobApplicationService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new JobApplicationController();
