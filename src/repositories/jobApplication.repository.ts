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

  async checkExistingApplication(candidateId: string, positionId: string) {
    return await prisma.jobApplication.findFirst({
      where: {
        candidateId,
        positionId,
        deletedAt: null
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

  async delete(id: string) {
    prisma.jobApplication.delete({
      where: {
        id
      }
    });
  }
}

export default new JobApplicationRepository();