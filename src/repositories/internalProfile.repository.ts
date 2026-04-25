import { TerminationReason } from '@prisma/client';
import prisma from '../config/client';
import { CreateInternalProfileDTO, UpdateInternalProfileDTO } from '../dto/internalProfile.dto';

const include = {
  candidate:  { select: { id: true, fullName: true, email: true } },
  department: { select: { id: true, name: true } },
  manager: {
    select: {
      id: true,
      employeeCode: true,
      currentJobTitle: true,
    }
  },
};

class InternalProfileRepository {
  findAll() {
    return prisma.internalProfile.findMany({ include });
  }

  findAllActive() {
    return prisma.internalProfile.findMany({
      where:   { status: 'ACTIVE' },
      include,
    });
  }

  findById(id: string) {
    return prisma.internalProfile.findUnique({ where: { id }, include });
  }

  findByCandidateId(candidateId: string) {
    return prisma.internalProfile.findUnique({ where: { candidateId }, include });
  }

  findByEmployeeCode(employeeCode: string) {
    return prisma.internalProfile.findUnique({ where: { employeeCode } });
  }

  findByDepartmentId(departmentId: string) {
    return prisma.internalProfile.findMany({
      where: { departmentId, status: 'ACTIVE' },
      include,
    });
  }

  findSubordinates(managerId: string) {
    return prisma.internalProfile.findMany({
      where: { managerId, status: 'ACTIVE' },
      include,
    });
  }

  create(data: CreateInternalProfileDTO) {
    return prisma.internalProfile.create({ data, include });
  }

  update(id: string, data: UpdateInternalProfileDTO) {
    return prisma.internalProfile.update({ where: { id }, data, include });
  }

  terminate(id: string, reason: TerminationReason, notes?: string) {
    return prisma.internalProfile.update({
      where: { id },
      data: {
        status:            'TERMINATED',
        terminatedAt:      new Date(),
        terminationReason: reason,
        terminationNotes:  notes ?? null,
      },
      include,
    });
  }
}

export default new InternalProfileRepository();