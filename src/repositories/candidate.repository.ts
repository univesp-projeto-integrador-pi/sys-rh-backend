import prisma from "../config/client";
import { CreateCandidateDTO, UpdateCandidateDTO } from "../dto/candidate.dto";

class CandidateRepository {
  findAll() {
    return prisma.candidate.findMany({
      where: { deletedAt: null }
    });
  }

  findById(id: string) {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        resume: true,
        internalProfile: true
      }
    });
  }

  findByEmail(email: string) {
    return prisma.candidate.findUnique({ where: { email } });
  }

  create(data: CreateCandidateDTO) {
    return prisma.candidate.create({ data });
  }

  update(id: string, data: UpdateCandidateDTO) {
    return prisma.candidate.update({ where: { id }, data });
  }

  // soft delete — não remove do banco
  softDelete(id: string) {
    return prisma.candidate.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export default new CandidateRepository();