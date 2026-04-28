import prisma from '../config/client';
import { CreateJobApplicationDTO, UpdateJobApplicationDTO } from '../dto/jobApplication.dto';

class JobApplicationRepository {
  async findAll() {
    try {
      return await prisma.jobApplication.findMany({
        where: { deletedAt: null, candidate: { deletedAt: null } },
        include: { candidate: true, position: true }
      });
    } catch (error) {
      console.error("Erro ao buscar candidaturas:", error);
      throw error;
    }
  }

  async findById(id: string) {
    if (!id) return null;
    return await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        candidate: true,
        position: { include: { department: true } },
        notes: { include: { author: true } }
      }
    });
  }

  // 🚨 NOVA FUNÇÃO: Checa se já existe uma candidatura ativa para esta vaga
  async checkExistingApplication(candidateId: string, positionId: string) {
    return await prisma.jobApplication.findFirst({
      where: {
        candidateId,
        positionId,
        deletedAt: null // Considera apenas candidaturas ativas
      }
    });
  }

  async create(data: CreateJobApplicationDTO) {
    try {
      return await prisma.jobApplication.create({
        data,
        include: { candidate: true, position: true }
      });
    } catch (error) {
      console.error("Erro ao registrar candidatura:", error);
      throw error;
    }
  }

  // ... (mantenha os outros métodos update e softDelete com try/catch)
}

export default new JobApplicationRepository();