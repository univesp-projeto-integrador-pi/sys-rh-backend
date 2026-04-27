import { Request, Response, NextFunction } from 'express';
import candidateService from '../services/candidate.service';
import { AppError } from '../middlewares/errorHandler.middleware';

class CandidateController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await candidateService.findAll();
      res.json(candidates);
    } catch (error) { next(error); }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.email; 
      if (!email) throw new AppError('Não autenticado', 401);

      const candidate = await candidateService.findByEmail(email);
      if (!candidate) throw new AppError('Perfil de candidato não encontrado', 404);
      
      res.json(candidate);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("-------------------------------------------------");
      console.log("📥 [CONTROLLER] Requisição POST /api/candidates iniciada.");
      
      const userEmail = req.email;
      if (!userEmail) throw new AppError('Sessão inválida', 401);

      console.log("📥 [CONTROLLER] E-mail autenticado:", userEmail);
      console.log("📥 [CONTROLLER] Corpo da requisição (req.body):", JSON.stringify(req.body, null, 2));

      // Montamos o payload
      const candidateData = { 
        ...req.body, 
        email: userEmail 
      };
      
      console.log("📥 [CONTROLLER] Enviando para o Service:", JSON.stringify(candidateData, null, 2));

      const candidate = await candidateService.create(candidateData);
      
      console.log("✅ [CONTROLLER] Sucesso! Retornando 201.");
      console.log("-------------------------------------------------");
      res.status(201).json(candidate);
    } catch (error) { 
      console.error("❌ [CONTROLLER] Erro capturado:", error);
      next(error); 
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const candidate = await candidateService.findById(id);
      res.json(candidate);
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