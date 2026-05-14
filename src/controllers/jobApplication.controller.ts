import { NextFunction, Request, Response } from 'express';
import jobApplicationService from '../services/jobApplication.service';
import { AppError } from '../middlewares/errorHandler.middleware';
import prisma from '../config/client';

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

  async findMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userEmail = (req as any).email;
      const userId = (req as any).userId;

      console.log(`[Controller - findMyApplications] Requisição recebida - userId: ${userId} | email: ${userEmail}`);

      if (!userEmail) {
        console.warn("[Controller - findMyApplications] email ausente no token. Verifique o authMiddleware.");
        throw new AppError('Usuário não autenticado', 401);
      }

      // Candidate não tem userId — a ligacao com User é feita pelo email
      const candidate = await prisma.candidate.findUnique({
        where: { email: userEmail },
      });

      if (!candidate) {
        console.warn(`[Controller - findMyApplications] Nenhum perfil de candidato para o email: ${userEmail}`);
        // Array vazio para não quebrar o frontend (ex: usuário ADMIN sem perfil de candidato)
        return res.status(200).json([]);
      }

      console.log(`[Controller - findMyApplications] Candidato encontrado (id: ${candidate.id}). Buscando candidaturas...`);

      const applications = await jobApplicationService.findByCandidateId(candidate.id);

      console.log(`[Controller - findMyApplications] ✅ ${applications?.length ?? 0} candidatura(s) retornada(s).`);
      return res.status(200).json(applications ?? []);

    } catch (error: any) {
      console.error(`[Controller - findMyApplications] ❌ Erro: ${error.message}`);
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const userEmail = (req as any).email;
      const { positionId } = req.body;

      console.log(`[Controller - create] userId: ${userId} | email: ${userEmail} | positionId: ${positionId}`);

      if (!userId || !userEmail) {
        throw new AppError('Usuário não autenticado ou sessão incompleta', 401);
      }

      if (!positionId) {
        throw new AppError('ID da vaga não fornecido', 400);
      }

      const application = await jobApplicationService.create(positionId, userEmail);

      console.log(`[Controller - create] ✅ Candidatura criada com sucesso para a vaga: ${positionId}`);
      res.status(201).json(application);

    } catch (error: any) {
      console.error(`[Controller - create] ❌ Erro: ${error.message}`);
      next(error);
    }
  }

  // privado
  async updateStage(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const requestingUserId = (req as any).userId;
      const application = await jobApplicationService.updateStage(id, req.body, requestingUserId);
      res.json(application);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await jobApplicationService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new JobApplicationController();
