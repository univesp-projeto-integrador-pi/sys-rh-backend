import prisma from "../config/client";
import {
  CreateJobApplicationDTO,
  UpdateJobApplicationDTO,
} from "../dto/jobApplication.dto";

class JobApplicationRepository {
  async findAll() {
    try {
      return await prisma.jobApplication.findMany({
        where: { deletedAt: null, candidate: { deletedAt: null } },
        include: { 
          candidate: true, 
          position: { include: { department: true } },
          notes: { include: { author: true } }
        }
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

  async findByCandidateId(candidateId: string) {
    try {
      return await prisma.jobApplication.findMany({
        where: {
          candidateId,
          deletedAt: null
        },
        include: {
          candidate: true,
          position: { include: { department: true } },
          notes: { include: { author: true } }
        },
        // 🚨 CORREÇÃO: Usando 'appliedAt' de acordo com seu schema.prisma
        orderBy: { appliedAt: 'desc' } 
      });
    } catch (error) {
      console.error("Erro ao buscar candidaturas por candidato:", error);
      throw error;
    }
  }

  // Checa se já existe uma candidatura ativa para esta vaga
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
        include: { 
          candidate: true, 
          position: { include: { department: true } },
          notes: { include: { author: true } }
        }
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
          position: { include: { department: true } },
          notes: { include: { author: true } }
        }
      });
    } catch (error) {
      console.error("Erro ao atualizar candidatura:", error);
      throw error;
    }
  }

  async softDelete(id: string) {
    try {
      return await prisma.jobApplication.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: {
          candidate: true,
          position: { include: { department: true } },
          notes: { include: { author: true } }
        }
      });
    } catch (error) {
      console.error("Erro ao soft delete candidatura:", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await this.softDelete(id);
    } catch (error) {
      console.error("Erro ao deletar candidatura:", error);
      throw error;
    }
  }
}

export default new JobApplicationRepository();
