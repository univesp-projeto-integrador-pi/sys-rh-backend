import { Request, Response } from 'express';
import candidateService from '../services/candidate.service';

class CandidateController {
    async findAll(req: Request, res: Response) {
        try {
            const candidates = await candidateService.findAll();
            res.json(candidates);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const candidate = await candidateService.findById(id);
            res.json(candidate);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const candidate = await candidateService.create(req.body);
            res.status(201).json(candidate);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const candidate = await candidateService.update(id, req.body);
            res.json(candidate);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            await candidateService.delete(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new CandidateController();