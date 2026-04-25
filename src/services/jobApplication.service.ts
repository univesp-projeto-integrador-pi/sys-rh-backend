import jobApplicationRepository from '../repositories/jobApplication.repository';
import candidateRepository from '../repositories/candidate.repository';
import jobPositionRepository from '../repositories/jobPosition.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import prisma from '../config/client'; 

class JobApplicationService {
  
  async create(positionId: string, userEmail: string) {
    console.log(`[Service] Buscando candidato para o email: ${userEmail}`);

    // 1. Buscamos o Candidato pelo e-mail
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail }
    });

    if (!candidate) {
      console.warn(`[Service] Candidato não encontrado para o email: ${userEmail}`);
      throw new AppError('Perfil de candidato não encontrado. Complete seu cadastro antes de se candidatar.', 404);
    }

    console.log(`[Service] Candidato encontrado ID: ${candidate.id}. Verificando vaga: ${positionId}`);

    // 2. Verificamos a Vaga
    const position = await jobPositionRepository.findById(positionId);
    if (!position) {
        throw new AppError('Vaga não encontrada', 404);
    }
    
    if (position.status !== 'OPEN') {
        throw new AppError('Esta vaga não está mais aceitando candidaturas.', 400);
    }

    // 3. Anti-Spam: Verifica se já existe candidatura
    const existing = await jobApplicationRepository.checkExistingApplication(candidate.id, positionId);
    if (existing) {
      console.warn(`[Service] Candidatura duplicada detectada para Candidate: ${candidate.id}`);
      throw new AppError('Você já se candidatou para esta vaga', 409);
    }

    // 4. Criação final
    console.log("[Service] Gravando nova candidatura no banco...");
    return jobApplicationRepository.create({
      candidateId: candidate.id,
      positionId: positionId
    });
  }

  // findAll, findById, updateStage e delete...
}

export default new JobApplicationService();