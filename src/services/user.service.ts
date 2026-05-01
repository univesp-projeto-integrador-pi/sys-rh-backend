import bcrypt from 'bcrypt';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';
import userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { UserRole, Prisma } from '@prisma/client';

const SALT_ROUNDS = 10;

class UserService {
  async findAll() {
    return userRepository.findAll();
  }

  async findById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user;
  }

  async create(data: CreateUserDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email já cadastrado', 400);

    const hashPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const userData: Prisma.UserCreateInput = {
      name: data.name,
      email: data.email,
      hashPassword,
      role: UserRole.USER
    };

    return userRepository.create(userData);
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id);

    const updateData: Prisma.UserUpdateInput = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    
    if (data.password) {
      updateData.hashPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    return userRepository.update(id, updateData);
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findById(id);

    if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const adminCount = await userRepository.countByRole(UserRole.ADMIN);
      if (adminCount <= 1) {
        throw new AppError('Não é possível rebaixar o único administrador do sistema', 400);
      }
    }

    return userRepository.update(id, { role });
  }

  async delete(id: string) {
    const user = await this.findById(id);

    if (user.role === UserRole.ADMIN) {
      const adminCount = await userRepository.countByRole(UserRole.ADMIN);
      if (adminCount <= 1) {
        throw new AppError('Não é possível remover o único administrador do sistema', 400);
      }
    }

    return userRepository.delete(id);
  }
}

export default new UserService();