import { Request, Response, NextFunction } from 'express';
import internalProfileService from '../services/internalProfile.service';

class InternalProfileController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await internalProfileService.findAll();
      res.json(profiles);
    } catch (error) { next(error); }
  }

  async findAllActive(req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await internalProfileService.findAllActive();
      res.json(profiles);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const profile = await internalProfileService.findById(id);
      res.json(profile);
    } catch (error) { next(error); }
  }

  async findByCandidateId(req: Request, res: Response, next: NextFunction) {
    try {
      const { candidateId } = req.params as { candidateId: string };
      const profile = await internalProfileService.findByCandidateId(candidateId);
      res.json(profile);
    } catch (error) { next(error); }
  }

  async findByDepartmentId(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.params as { departmentId: string };
      const profiles = await internalProfileService.findByDepartmentId(departmentId);
      res.json(profiles);
    } catch (error) { next(error); }
  }

  async findSubordinates(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const subordinates = await internalProfileService.findSubordinates(id);
      res.json(subordinates);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await internalProfileService.create(req.body);
      res.status(201).json(profile);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const profile = await internalProfileService.update(id, req.body);
      res.json(profile);
    } catch (error) { next(error); }
  }

  async terminate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const profile = await internalProfileService.terminate(id, req.body);
      res.json(profile);
    } catch (error) { next(error); }
  }
}

export default new InternalProfileController();