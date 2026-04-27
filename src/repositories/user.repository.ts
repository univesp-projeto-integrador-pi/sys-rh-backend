import prisma from "../config/client";
import { CreateUserDTO, UpdateUserDTO } from "../dto/user.dto";

// Campos que podem ser expostos publicamente ou para o Admin (sem a senha)
const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

class UserRepository {
  async findAll() {
    try {
      return await prisma.user.findMany({ 
        select: userPublicSelect,
        orderBy: { createdAt: 'desc' } 
      });
    } catch (error) {
      console.error("❌ Erro no repositório ao buscar usuários:", error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.user.findUnique({ 
        where: { id }, 
        select: userPublicSelect 
      });
    } catch (error) {
      console.error(`❌ Erro ao buscar usuário ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      // Usado para login. Aqui precisamos da senha para comparar o hash.
      return await prisma.user.findUnique({ where: { email } });
    } catch (error) {
      console.error(`❌ Erro ao buscar usuário por e-mail ${email}:`, error);
      throw error;
    }
  }

  async create(data: CreateUserDTO) {
    try {
      return await prisma.user.create({ 
        data, 
        select: userPublicSelect 
      });
    } catch (error) {
      console.error("❌ Erro ao criar usuário:", error);
      throw error;
    }
  }

  async update(id: string, data: UpdateUserDTO) {
    try {
      return await prisma.user.update({ 
        where: { id }, 
        data, 
        select: userPublicSelect 
      });
    } catch (error) {
      console.error(`❌ Erro ao atualizar usuário ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (error) {
      console.error(`❌ Erro ao deletar usuário ${id}:`, error);
      throw error;
    }
  }

  async countByRole(role: string) {
    try {
      return await prisma.user.count({ 
        where: { role: role as any } 
      });
    } catch (error) {
      console.error(`❌ Erro ao contar usuários por cargo:`, error);
      throw error;
    }
  }
}

export default new UserRepository();