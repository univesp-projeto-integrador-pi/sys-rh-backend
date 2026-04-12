import bcrypt from 'bcrypt';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';
import userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';

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
    if (existing) throw new Error('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const userData: CreateUserDTO = { ...data, password: hashedPassword };
    return userRepository.create(userData);
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id);

    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    return userRepository.update(id, updateData);
  }

  async updateRole(id: string, role: 'ADMIN' | 'RECRUITER' | 'VIEWER') {
    await this.findById(id);

    if (role !== 'ADMIN') {
      const user = await userRepository.findById(id);
      if (user?.role === 'ADMIN') {
        const adminCount = await userRepository.countByRole('ADMIN');
        if (adminCount <= 1) {
          throw new AppError('Não é possível rebaixar o único administrador do sistema', 400);
        }
      }
    }

    return userRepository.update(id, { role });
  }

  async delete(id: string) {
    const user = await this.findById(id);

    if (user.role === 'ADMIN') {
      const adminCount = await userRepository.countByRole('ADMIN');
      if (adminCount <= 1) {
        throw new AppError('Não é possível remover o único administrador do sistema', 400);
      }
    }

    return userRepository.delete(id);
  }
}

export default new UserService();