import internalProfileRepository from '../repositories/internalProfile.repository';
import candidateRepository from '../repositories/candidate.repository';
import departmentRepository from '../repositories/department.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { TerminationReason } from '@prisma/client';
import { CreateInternalProfileDTO, UpdateInternalProfileDTO, TerminateEmployeeDTO } from '../dto/internalProfile.dto';


class InternalProfileService {
  async findAll() {
    return internalProfileRepository.findAll();
  }

  async findAllActive() {
    return internalProfileRepository.findAllActive();
  }

  async findById(id: string) {
    const profile = await internalProfileRepository.findById(id);
    if (!profile) throw new AppError('Perfil interno não encontrado', 404);
    return profile;
  }

  async findByCandidateId(candidateId: string) {
    const profile = await internalProfileRepository.findByCandidateId(candidateId);
    if (!profile) throw new AppError('Perfil interno não encontrado', 404);
    return profile;
  }

  async findByDepartmentId(departmentId: string) {
    const department = await departmentRepository.findById(departmentId);
    if (!department) throw new AppError('Departamento não encontrado', 404);
    return internalProfileRepository.findByDepartmentId(departmentId);
  }

  async findSubordinates(managerId: string) {
    await this.findById(managerId);
    return internalProfileRepository.findSubordinates(managerId);
  }

  async create(data: CreateInternalProfileDTO) {
    const candidate = await candidateRepository.findById(data.candidateId);
    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError('Candidato não encontrado', 404);
    }

    const department = await departmentRepository.findById(data.departmentId);
    if (!department) throw new AppError('Departamento não encontrado', 404);

    const existing = await internalProfileRepository.findByCandidateId(data.candidateId);
    if (existing) throw new AppError('Candidato já possui perfil interno', 409);

    const existingCode = await internalProfileRepository.findByEmployeeCode(data.employeeCode);
    if (existingCode) throw new AppError('Código de colaborador já em uso', 409);

    if (data.managerId) {
      const manager = await internalProfileRepository.findById(data.managerId);
      if (!manager) throw new AppError('Gestor não encontrado', 404);
      if (manager.status !== 'ACTIVE') throw new AppError('Gestor não está ativo', 400);
    }

    return internalProfileRepository.create(data);
  }

  async createFromHiring(candidateId: string, departmentId: string) {
    const existing = await internalProfileRepository.findByCandidateId(candidateId);
    if (existing) return existing;

    const employeeCode = `EMP-${Date.now()}`;

    return internalProfileRepository.create({
      candidateId,
      departmentId,
      employeeCode,
      currentJobTitle: 'A definir',
    });
  }

  async update(id: string, data: UpdateInternalProfileDTO) {
    await this.findById(id);

    if (data.departmentId) {
      const department = await departmentRepository.findById(data.departmentId);
      if (!department) throw new AppError('Departamento não encontrado', 404);
    }

    if (data.managerId) {
      const manager = await internalProfileRepository.findById(data.managerId);
      if (!manager) throw new AppError('Gestor não encontrado', 404);
      if (manager.status !== 'ACTIVE') throw new AppError('Gestor não está ativo', 400);
      if (manager.id === id) throw new AppError('Colaborador não pode ser seu próprio gestor', 400);
    }

    return internalProfileRepository.update(id, data);
  }

  async terminate(id: string, data: TerminateEmployeeDTO) {
    const profile = await this.findById(id);

    if (profile.status === 'TERMINATED') {
      throw new AppError('Colaborador já foi desligado', 400);
    }

    // soft delete no candidato vinculado
    await candidateRepository.softDelete(profile.candidateId);

    // termina o perfil interno
    return internalProfileRepository.terminate(
      id,
      data.terminationReason as TerminationReason,
      data.terminationNotes
    );
  }
}

export default new InternalProfileService();