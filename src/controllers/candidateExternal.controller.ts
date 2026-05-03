import { Request, Response, NextFunction } from "express";
import candidateService from "../services/candidate.service";
import { AppError } from "../middlewares/errorHandler.middleware";

class CandidateExternalController {
  // 🚀 NOVO: Método necessário para a Home.tsx funcionar
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // O e-mail vem do token decodificado pelo authMiddleware
      const email = req.user?.email;

      if (!email) {
        throw new AppError("Usuário não autenticado ou token inválido.", 401);
      }

      const candidate = await candidateService.findByEmail(email);

      if (!candidate) {
        // Retornamos 404 para o frontend saber que o perfil não existe
        return res
          .status(404)
          .json({ message: "Perfil de candidato não encontrado." });
      }

      return res.status(200).json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const candidate = await candidateService.findById(id);
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // Se o usuário estiver logado, garantimos que o perfil seja criado com o e-mail do token
      if (req.user?.email) {
        data.email = req.user.email;
      }

      const candidate = await candidateService.create(data);
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
