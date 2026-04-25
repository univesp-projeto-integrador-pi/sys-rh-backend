import { Request, Response, NextFunction } from 'express';
import candidateService from '../services/candidate.service';
import { AppError } from '../middlewares/errorHandler.middleware';

class CandidateExternalController {

  // 🚀 NOVO: Retorna o perfil do usuário logado no momento

async getMe(req: Request, res: Response, next: NextFunction) {
  try {
    // Mudamos de req.user?.email para req.email
    const email = req.email; 
    if (!email) throw new AppError('Não autenticado', 401);

    const candidate = await candidateService.findByEmail(email);
    if (!candidate) throw new AppError('Perfil de candidato não encontrado', 404);
    
    res.json(candidate);
  } catch (error) { next(error); }
}

// --- MÉTODO CREATE ATUALIZADO ---
async create(req: Request, res: Response, next: NextFunction) {
  try {
    // Mudamos de req.user?.email para req.email
    const userEmail = req.email;
    if (!userEmail) throw new AppError('Sessão inválida', 401);

    // O restante continua igual
    const candidateData = { ...req.body, email: userEmail };
    
    const candidate = await candidateService.create(candidateData);
    res.status(201).json(candidate);
  } catch (error) { next(error); }
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

export default new CandidateExternalController();