import prisma from "../config/client";
import { CreateUserDTO, UpdateUserDTO } from "../dto/user.dto";

class UserRepository {
  findAll() {
    return prisma.user.findMany();
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  create(data: CreateUserDTO) {
    return prisma.user.create({ data });
  }

  update(id: string, data: UpdateUserDTO) {
    return prisma.user.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  countByRole(role: string) {
    return prisma.user.count({ where: { role: role as any } });
  }
}

export default new UserRepository();