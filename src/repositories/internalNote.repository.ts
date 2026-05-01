import prisma from "../config/client";
import { CreateInternalNoteDTO } from "../dto/internalNote.dto";

class InternalNoteRepository {
  async findByApplicationId(applicationId: string) {
    try {
      return await prisma.internalNote.findMany({
        where: { applicationId },
        include: { author: true }
      });
    } catch (error) {
      console.error("Erro ao buscar notas por candidatura:", error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.internalNote.findUnique({
        where: { id },
        include: { author: true }
      });
    } catch (error) {
      console.error(`Erro ao buscar nota ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateInternalNoteDTO) {
    try {
      return await prisma.internalNote.create({
        data,
        include: { author: true }
      });
    } catch (error) {
      console.error("Erro ao criar nota:", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.internalNote.delete({ where: { id } });
    } catch (error) {
      console.error(`Erro ao deletar nota ${id}:`, error);
      throw error;
    }
  }
}

export default new InternalNoteRepository();