import resumeRepository from '../repositories/resume.repository';
import candidateRepository from '../repositories/candidate.repository';
import { CreateResumeDTO, UpdateResumeDTO } from '../dto/resume.dto';

class ResumeService {
  async findByCandidateId(candidateId: string) {
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) throw new Error('Candidato não encontrado');

    const resume = await resumeRepository.findByCandidateId(candidateId);
    if (!resume) throw new Error('Currículo não encontrado');

    return resume;
  }

  async create(candidateId: string, data: CreateResumeDTO) {
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) throw new Error('Candidato não encontrado');

    const existing = await resumeRepository.findByCandidateId(candidateId);
    if (existing) throw new Error('Candidato já possui um currículo');

    return resumeRepository.create(candidateId, data);
  }

  async update(candidateId: string, data: UpdateResumeDTO) {
    const resume = await resumeRepository.findByCandidateId(candidateId);
    if (!resume) throw new Error('Currículo não encontrado');

    return resumeRepository.update(resume.id, data);
  }
}

export default new ResumeService();