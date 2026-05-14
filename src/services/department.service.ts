import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../dto/department.dto';
import departmentRepository from '../repositories/department.repository';

class DepartmentService {
  async findAll() {
    return departmentRepository.findAll();
  }

  async findById(id: string) {
    const department = await departmentRepository.findById(id);
    if (!department) throw new Error('Departamento não encontrado');
    return department;
  }

  async create(data: CreateDepartmentDTO) {
    const existing = await departmentRepository.findByName(data.name);
    if (existing) throw new Error('Departamento já cadastrado');
    return departmentRepository.create(data);
  }

  async update(id: string, data: UpdateDepartmentDTO) {
    await this.findById(id);
    return departmentRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return departmentRepository.delete(id);
  }
}

export default new DepartmentService();