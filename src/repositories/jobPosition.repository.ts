import prisma from "../config/client";
import { CreateJobPositionDTO, UpdateJobPositionDTO } from "../dto/jobPosition.dto";

class JobPositionRepository {
  findAll() {
    return prisma.jobPosition.findMany({
      include: { department: true }
    });
  }

  findAllOpen() {
    return prisma.jobPosition.findMany({
      where: { status: 'OPEN' },
      include: { department: true }
    });
  }

  findById(id: string) {
    return prisma.jobPosition.findUnique({
      where: { id },
      include: { department: true }
    });
  }

  create(data: CreateJobPositionDTO) {
    return prisma.jobPosition.create({
      data,
      include: { department: true }
    });
  }

  update(id: string, data: UpdateJobPositionDTO) {
    return prisma.jobPosition.update({
      where: { id },
      data,
      include: { department: true }
    });
  }

  delete(id: string) {
    return prisma.jobPosition.delete({ where: { id } });
  }
}

export default new JobPositionRepository();