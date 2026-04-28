import prisma from "../config/client";
import { CreateJobPositionDTO, UpdateJobPositionDTO } from "../dto/jobPosition.dto";

class JobPositionRepository {
  async findAll() {
    try {
      return await prisma.jobPosition.findMany({
        include: { department: true },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error("Erro ao buscar todas as vagas:", error);
      throw error;
    }
  }

  async findAllOpen() {
    try {
      return await prisma.jobPosition.findMany({
        where: { 
          status: 'OPEN' 
        },
        include: { 
          department: true 
        },
        orderBy: { 
          createdAt: 'desc' 
        }
      });
    } catch (error) {
      console.error("Erro ao buscar vagas abertas:", error);
      return []; // Retorna array vazio em caso de erro para não quebrar o frontend
    }
  }

  async findById(id: string) {
    try {
      return await prisma.jobPosition.findUnique({
        where: { id },
        include: { department: true }
      });
    } catch (error) {
      console.error(`Erro ao buscar vaga ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateJobPositionDTO) {
    try {
      return await prisma.jobPosition.create({
        data,
        include: { department: true }
      });
    } catch (error) {
      console.error("Erro ao criar vaga:", error);
      throw error;
    }
  }

  async update(id: string, data: UpdateJobPositionDTO) {
    try {
      return await prisma.jobPosition.update({
        where: { id },
        data,
        include: { department: true }
      });
    } catch (error) {
      console.error(`Erro ao atualizar vaga ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.jobPosition.delete({ 
        where: { id } 
      });
    } catch (error) {
      console.error(`Erro ao deletar vaga ${id}:`, error);
      throw error;
    }
  }
}

export default new JobPositionRepository();