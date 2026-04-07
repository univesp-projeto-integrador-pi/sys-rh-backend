import prisma from "../config/client";
import { CreateUserDTO, UpdateUserDTO } from "../dto/user.dto";

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

class UserRepository {
  findAll() {
    return prisma.user.findMany({ select: userPublicSelect });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: userPublicSelect });
  }

  findByEmail(email: string) {
    // Usado internamente (validação / autenticação). Retorna senha.
    return prisma.user.findUnique({ where: { email } });
  }

  create(data: CreateUserDTO) {
    return prisma.user.create({ data, select: userPublicSelect });
  }

  update(id: string, data: UpdateUserDTO) {
    return prisma.user.update({ where: { id }, data, select: userPublicSelect });
  }

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}

export default new UserRepository();