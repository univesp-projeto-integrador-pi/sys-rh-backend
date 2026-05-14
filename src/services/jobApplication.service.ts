import jobApplicationRepository from '../repositories/jobApplication.repository';
import jobPositionRepository from '../repositories/jobPosition.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import prisma from '../config/client'; 

class JobApplicationService {
  
  async findAll() {
    console.log("===> [Service] Iniciando findAll de Candidaturas");
    
    const apps = await prisma.jobApplication.findMany({
      where: {
        deletedAt: null
      },
      include: {
        candidate: true,
        position: {
          include: {
            department: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    console.log(`===> [Service] Candidaturas encontradas no banco local: ${apps.length}`);
    return apps;
  }

  async findByEmail(email: string) {
    return await prisma.jobApplication.findMany({
      where: {
        candidate: {
          email: email
        }
      },
      include: {
        position: {
          include: {
            department: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
  }  

  async findByCandidateId(candidateId: string) {
    console.log(`===> [Service] Buscando candidaturas para o candidato: ${candidateId}`);
    
    const apps = await prisma.jobApplication.findMany({
      where: {
        candidateId,
        deletedAt: null
      },
      include: {
        candidate: true,
        position: {
          include: {
            department: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    console.log(`===> [Service] Candidaturas encontradas: ${apps.length}`);
    return apps;
  }

  async create(positionId: string, userEmail: string) {
    console.log(`===> [Service] Criando candidatura para ${userEmail} na vaga ${positionId}`);
    
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
      positionId: positionId,
    });
  }

  async findById(id: string) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) throw new AppError('Candidatura não encontrada', 404);
    return application;
  }

  async updateStage(id: string, data: { currentStage: string }, userId: string) {
    console.log(`===> [Service] Atualizando etapa da candidatura ${id} para ${data.currentStage} por usuário ${userId}`);
    
    const application = await jobApplicationRepository.findById(id);
    if (!application) {
      throw new AppError('Candidatura não encontrada', 404);
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        currentStage: data.currentStage,
        updatedAt: new Date()
      },
      include: {
        candidate: true,
        position: {
          include: {
            department: true
          }
        }
      }
    });

    console.log(`===> [Service] Candidatura atualizada com sucesso`);
    return updated;
  }

  async delete(id: string) {
    return await jobApplicationRepository.delete(id);
  }
}

export default new JobApplicationService();