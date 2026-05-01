import prisma from "../config/client";
import { CreateJobPositionDTO, UpdateJobPositionDTO } from "../dto/jobPosition.dto";

class JobPositionRepository {
  async findAll() {
  try {
    const result = await prisma.jobPosition.findMany({
      include: {
        department: true,
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // DEBUG — remova depois de confirmar
    console.log('DEBUG _count:', JSON.stringify(result[0], null, 2));

    return result;
  } catch (error) {
    console.error("Erro ao buscar todas as vagas:", error);
    throw error;
  }
}

  async findAllOpen() {
    try {
      return await prisma.jobPosition.findMany({
        where: { status: 'OPEN' },
        include: { 
          department: true,
          _count: { select: { applications: true } } 
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error("Erro ao buscar vagas abertas:", error);
      return [];
    }
  }

  async findById(id: string) {
    try {
      return await prisma.jobPosition.findUnique({
        where: { id },
        include: { 
          department: true, 
          _count: { select: { applications: true } } 
        }
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
        include: { 
          department: true,
          _count: { select: { applications: true } } // Mantém consistência
        }
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
        include: { 
          department: true,
          _count: { select: { applications: true } } 
        }
      });
    } catch (error) {
      console.error(`Erro ao atualizar vaga ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.jobPosition.delete({ where: { id } });
    } catch (error) {
      console.error(`Erro ao deletar vaga ${id}:`, error);
      throw error;
    }
  }
}

export default new JobPositionRepository();