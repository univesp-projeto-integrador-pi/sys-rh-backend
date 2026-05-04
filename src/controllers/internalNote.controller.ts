import { Request, Response, NextFunction } from "express";
import internalNoteService from "../services/internalNote.service";

class InternalNoteController {
  async findByApplicationId(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params as { applicationId: string };
      const notes =
        await internalNoteService.findByApplicationId(applicationId);
      res.json(notes);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await internalNoteService.create(req.body);
      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, applicationId } = req.params as {
        id: string;
        applicationId: string;
      };
      const requestingUserId = req.user!.id;
      await internalNoteService.delete(id, applicationId, requestingUserId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new InternalNoteController();
