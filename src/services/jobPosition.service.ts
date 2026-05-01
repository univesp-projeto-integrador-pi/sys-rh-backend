import jobPositionRepository from '../repositories/jobPosition.repository';
import departmentRepository from '../repositories/department.repository';
import { CreateJobPositionDTO, UpdateJobPositionDTO } from '../dto/jobPosition.dto';

class JobPositionService {
  async findAll() {
    return jobPositionRepository.findAll();
  }

  async findAllOpen() {
    return jobPositionRepository.findAllOpen();
  }

  async findById(id: string) {
    const position = await jobPositionRepository.findById(id);
    if (!position) throw new Error('Vaga não encontrada');
    return position;
  }

  async create(data: CreateJobPositionDTO) {
    const department = await departmentRepository.findById(data.departmentId);
    if (!department) throw new Error('Departamento não encontrado');
    return jobPositionRepository.create(data);
  }

  async update(id: string, data: UpdateJobPositionDTO) {
    // Verifica se a vaga existe antes de atualizar
    const exists = await jobPositionRepository.findById(id);
    if (!exists) throw new Error('Vaga não encontrada');
    
    return jobPositionRepository.update(id, data);
  }

  async delete(id: string) {
    const exists = await jobPositionRepository.findById(id);
    if (!exists) throw new Error('Vaga não encontrada');
    
    return jobPositionRepository.delete(id);
  }
}

export default new JobPositionService();