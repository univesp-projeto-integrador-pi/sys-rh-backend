import resumeRepository from "../repositories/resume.repository";
import candidateRepository from "../repositories/candidate.repository";

import { AppError } from "../middlewares/errorHandler.middleware";
import { CreateResumeDTO, UpdateResumeDTO } from "../dto/resume.dto";

class ResumeService {
  async findByCandidateId(candidateId: string) {
    const candidate = await candidateRepository.findById(candidateId);

    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError("Candidato não encontrado", 404);
    }

    const resume = await resumeRepository.findByCandidateId(candidateId);
    if (!resume) throw new AppError("Currículo não encontrado", 404);
    return resume;
  }

  async create(candidateId: string, data: CreateResumeDTO) {
    const candidate = await candidateRepository.findById(candidateId);

    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError("Candidato não encontrado", 404);
    }

    const existing = await resumeRepository.findByCandidateId(candidateId);
    if (existing) throw new AppError("Candidato já possui um currículo", 409);

    return resumeRepository.create(candidateId, data);
  }

  async update(candidateId: string, data: UpdateResumeDTO) {
    const candidate = await candidateRepository.findById(candidateId);

    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError("Candidato não encontrado", 404);
    }

    const resume = await resumeRepository.findByCandidateId(candidateId);
    if (!resume) throw new AppError("Currículo não encontrado", 404);

    return resumeRepository.update(resume.id, data);
  }
}

export default new ResumeService();
