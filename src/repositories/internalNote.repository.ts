import prisma from "../config/client";
import { CreateInternalNoteDTO } from "../dto/internalNote.dto";

class InternalNoteRepository {
  findByApplicationId(applicationId: string) {
    return prisma.internalNote.findMany({
      where: { applicationId },
      include: { author: true }
    });
  }

  findById(id: string) {
    return prisma.internalNote.findUnique({
      where: { id },
      include: { author: true }
    });
  }

  create(data: CreateInternalNoteDTO) {
    return prisma.internalNote.create({
      data,
      include: { author: true }
    });
  }

  delete(id: string) {
    return prisma.internalNote.delete({ where: { id } });
  }
}

export default new InternalNoteRepository();