import { Request, Response, NextFunction } from "express";
import candidateService from "../services/candidate.service";

// Tipagem dos parâmetros da rota
type Params = {
  id: string;
};

class CandidateInternalController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await candidateService.findAll();
      return res.status(200).json(candidates);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request<Params>, res: Response, next: NextFunction) {
    try {
      const candidate = await candidateService.findById(req.params.id);
      return res.status(200).json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<Params>, res: Response, next: NextFunction) {
    try {
      const candidate = await candidateService.update(req.params.id, req.body);
      return res.status(200).json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<Params>, res: Response, next: NextFunction) {
    try {
      await candidateService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidateInternalController();
