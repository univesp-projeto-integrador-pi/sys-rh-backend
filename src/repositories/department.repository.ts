import prisma from "../config/client";
import { CreateDepartmentDTO, UpdateDepartmentDTO } from "../dto/department.dto";

class DepartmentRepository {
  findAll() {
    return prisma.department.findMany();
  }

  findById(id: string) {
    return prisma.department.findUnique({ where: { id } });
  }

  findByName(name: string) {
    return prisma.department.findUnique({ where: { name } });
  }

  create(data: CreateDepartmentDTO) {
    return prisma.department.create({ data });
  }

  update(id: string, data: UpdateDepartmentDTO) {
    return prisma.department.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.department.delete({ where: { id } });
  }
}

export default new DepartmentRepository();