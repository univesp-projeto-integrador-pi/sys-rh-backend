import { Request, Response } from 'express';
import internalNoteService from '../services/internalNote.service';

class InternalNoteController {
  async findByApplicationId(req: Request, res: Response) {
    try {
      const { applicationId } = req.params as { applicationId: string };
      const notes = await internalNoteService.findByApplicationId(applicationId);
      res.json(notes);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const note = await internalNoteService.create(req.body);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await internalNoteService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new InternalNoteController();