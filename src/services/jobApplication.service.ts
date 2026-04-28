import jobApplicationRepository from '../repositories/jobApplication.repository';
import jobPositionRepository from '../repositories/jobPosition.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import prisma from '../config/client'; 

class JobApplicationService {
  
  // Lista todas as candidaturas com os relacionamentos necessários para o Admin
  async findAll() {
    console.log("[Service] Buscando candidaturas com relações (candidate e jobPosition)...");
    
    return await prisma.jobApplication.findMany({
      include: {
        candidate: true,    // Traz os dados da tabela Candidate
        position: {         // Traz os dados da tabela JobPosition (alias para jobPosition)
          include: {
            department: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'   // Mais recentes primeiro (usar appliedAt, não createdAt)
      }
    });
  }

  // Criação de candidatura (Corrigido para receber argumentos separados)
  async create(positionId: string, userEmail: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail }
    });

    if (!candidate) {
      throw new AppError('Perfil de candidato não encontrado.', 404);
    }

    const position = await jobPositionRepository.findById(positionId);
    if (!position || position.status !== 'OPEN') {
      throw new AppError('Vaga indisponível.', 400);
    }

    const existing = await jobApplicationRepository.checkExistingApplication(candidate.id, positionId);
    if (existing) {
      throw new AppError('Você já se candidatou para esta vaga', 409);
    }

    return jobApplicationRepository.create({
      candidateId: candidate.id,
      positionId: positionId
    });
  }

  async findById(id: string) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) throw new AppError('Candidatura não encontrada', 404);
    return application;
  }

  async delete(id: string) {
    return await jobApplicationRepository.delete(id);
  }
}

export default new JobApplicationService();