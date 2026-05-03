import { NextFunction, Request, Response } from "express";
import jobPositionService from "../services/jobPosition.service";

// Tipagem dos params
type Params = {
  id: string;
};

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

  async findById(req: Request<Params>, res: Response, next: NextFunction) {
    try {
      console.log(
        `[JobAvailableController] Buscando detalhes da vaga: ${req.params.id}`,
      );

      const job = await jobPositionService.findById(req.params.id);

      if (!job) {
        console.warn(
          `[JobAvailableController] Vaga ${req.params.id} não encontrada no banco.`,
        );
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      res.json(job);
    } catch (error) {
      next(error);
    }
  }
}

export default new JobPositionAvailableController();
