import jobApplicationRepository from '../repositories/jobApplication.repository';
import candidateRepository from '../repositories/candidate.repository';
import jobPositionRepository from '../repositories/jobPosition.repository';
import internalNoteService from './internalNote.service';
import { AppError } from '../middlewares/errorHandler.middleware';
import { CreateJobApplicationDTO, UpdateJobApplicationDTO } from '../dto/jobApplication.dto';

class JobApplicationService {
  async findAll() {
    return jobApplicationRepository.findAll();
  }

  async findById(id: string) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) throw new AppError('Candidatura não encontrada', 404);
    return application;
  }

  async findByCandidateId(candidateId: string) {
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) throw new AppError('Candidato não encontrado', 404);
    return jobApplicationRepository.findByCandidateId(candidateId);
  }

  async create(data: CreateJobApplicationDTO) {
    const candidate = await candidateRepository.findById(data.candidateId);
    if (!candidate) throw new AppError('Candidato não encontrado', 404);

    const position = await jobPositionRepository.findById(data.positionId);
    if (!position) throw new AppError('Vaga não encontrada', 404);

    if (position.status !== 'OPEN') throw new AppError('Vaga não está aberta', 400);

    const existing = await jobApplicationRepository.findByCandidateId(data.candidateId);
    const alreadyApplied = existing.some(app => app.positionId === data.positionId);
    if (alreadyApplied) throw new AppError('Candidato já se candidatou para esta vaga', 409);

    return jobApplicationRepository.create(data);
  }

  async updateStage(id: string, data: UpdateJobApplicationDTO, requestingUserId: string) {
    await this.findById(id);

    await internalNoteService.createAuditNote(
      id,
      requestingUserId,
      `Etapa alterada para ${data.currentStage}`
    );

    return jobApplicationRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return jobApplicationRepository.softDelete(id);
  }
}

export default new JobApplicationService();