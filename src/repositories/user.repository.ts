import { UserRole, Prisma } from "@prisma/client";
import prisma from "../config/client";

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  internalProfile: {
    select: {
      currentJobTitle: true,
      employeeCode: true,
      status: true,
      department: {
        select: { name: true }
      }
    }
  }
};

class UserRepository {
  async findAll() {
    return await prisma.user.findMany({ 
      select: userPublicSelect,
      orderBy: { createdAt: 'desc' } 
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({ 
      where: { id }, 
      select: userPublicSelect 
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ 
      data, 
      select: userPublicSelect 
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({ 
      where: { id }, 
      data, 
      select: userPublicSelect 
    });
  }

  async delete(id: string) {
    return await prisma.user.delete({ where: { id } });
  }

  async countByRole(role: UserRole) {
    return await prisma.user.count({ 
      where: { role } 
    });
  }
}

export default new UserRepository();