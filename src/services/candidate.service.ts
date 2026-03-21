import { CreateCandidateDTO, UpdateCandidateDTO } from '../dto/candidate.dto';
import candidateRepository from '../repositories/candidate.repository';

class CandidateService {
  async findAll() {
    return candidateRepository.findAll();
  }

  async findById(id: string) {
    const candidate = await candidateRepository.findById(id);
    if (!candidate) throw new Error('Candidato não encontrado');
    return candidate;
  }

  async create(data: CreateCandidateDTO) {
    const existing = await candidateRepository.findByEmail(data.email);
    if (existing) throw new Error('Email já cadastrado');
    return candidateRepository.create(data);
  }

  async update(id: string, data: UpdateCandidateDTO) {
    await this.findById(id);
    return candidateRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return candidateRepository.softDelete(id);
  }
}

export default new CandidateService();