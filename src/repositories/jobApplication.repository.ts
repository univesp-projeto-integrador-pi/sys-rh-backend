import prisma from "../config/client";
import { CreateJobApplicationDTO, UpdateJobApplicationDTO } from "../dto/jobApplication.dto";

class JobApplicationRepository {
  findAll() {
    return prisma.jobApplication.findMany({
      where: { deletedAt: null },
      include: {
        candidate: true,
        position: true
      }
    });
  }

  findById(id: string) {
    return prisma.jobApplication.findUnique({
      where: { id },
      include: {
        candidate: true,
        position: { include: { department: true } },
        notes: { include: { author: true } }
      }
    });
  }

  findByCandidateId(candidateId: string) {
    return prisma.jobApplication.findMany({
      where: { candidateId, deletedAt: null },
      include: { position: true }
    });
  }

  create(data: CreateJobApplicationDTO) {
    return prisma.jobApplication.create({
      data,
      include: { candidate: true, position: true }
    });
  }

  update(id: string, data: UpdateJobApplicationDTO) {
    return prisma.jobApplication.update({
      where: { id },
      data,
    });
  }

  softDelete(id: string) {
    return prisma.jobApplication.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export default new JobApplicationRepository();