import jobApplicationRepository from "../repositories/jobApplication.repository";
import jobPositionRepository from "../repositories/jobPosition.repository";
import candidateRepository from "../repositories/candidate.repository";
import { AppError } from "../middlewares/errorHandler.middleware";

class JobApplicationService {
  async findAll() {
    return await jobApplicationRepository.findAll();
  }

  async findById(id: string) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) {
      throw new AppError("Candidatura não encontrada", 404);
    }
    return application;
  }

  async create(positionId: string, userEmail: string) {
    const candidate = await candidateRepository.findByEmail(userEmail);
    if (!candidate)
      throw new AppError("Perfil de candidato não encontrado.", 404);

    const position = await jobPositionRepository.findById(positionId);
    if (!position || position.status !== "OPEN") {
      throw new AppError("Vaga indisponível.", 400);
    }

    const existing = await jobApplicationRepository.checkExistingApplication(
      candidate.id,
      positionId,
    );
    if (existing)
      throw new AppError("Você já se candidatou para esta vaga", 409);

    return await jobApplicationRepository.create({
      candidateId: candidate.id,
      positionId: positionId,
    });
  }

  async updateStage(id: string, data: { currentStage: any }, userId: string) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) throw new AppError("Candidatura não encontrada", 404);

    const updated = await jobApplicationRepository.update(id, data);

    return updated;
  }

  async delete(id: string) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) throw new AppError("Candidatura não encontrada", 404);
    return await jobApplicationRepository.delete(id);
  }
}

export default new JobApplicationService();
