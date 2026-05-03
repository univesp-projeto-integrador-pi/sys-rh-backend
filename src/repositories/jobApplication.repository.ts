import prisma from "../config/client";
import {
  CreateJobApplicationDTO,
  UpdateJobApplicationDTO,
} from "../dto/jobApplication.dto";

class JobApplicationRepository {
  async findAll() {
    try {
      return await prisma.jobApplication.findMany({
        where: { deletedAt: null },
        include: {
          candidate: true,
          position: { include: { department: true } },
        },
        orderBy: { appliedAt: "desc" },
      });
    } catch (error) {
      console.error("Erro ao buscar candidaturas:", error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.jobApplication.findFirst({
        where: { id, deletedAt: null },
        include: {
          candidate: true,
          position: { include: { department: true } },
          notes: { include: { author: true } },
        },
      });
    } catch (error) {
      console.error(`Erro ao buscar candidatura ${id}:`, error);
      throw error;
    }
  }

  async checkExistingApplication(candidateId: string, positionId: string) {
    return await prisma.jobApplication.findFirst({
      where: {
        candidateId,
        positionId,
        deletedAt: null,
      },
    });
  }

  async create(data: CreateJobApplicationDTO) {
    try {
      return await prisma.jobApplication.create({
        data,
        include: { candidate: true, position: true },
      });
    } catch (error) {
      console.error("Erro ao registrar candidatura:", error);
      throw error;
    }
  }

  async update(id: string, data: UpdateJobApplicationDTO) {
    try {
      return await prisma.jobApplication.update({
        where: { id },
        data,
        include: {
          candidate: true,
          position: true,
        },
      });
    } catch (error) {
      console.error(`Erro ao atualizar candidatura ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.jobApplication.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      console.error(`Erro ao deletar candidatura ${id}:`, error);
      throw error;
    }
  }
}

export default new JobApplicationRepository();
