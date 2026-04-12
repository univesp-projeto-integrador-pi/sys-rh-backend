import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';

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
    if (existing) throw new AppError('Email já cadastrado', 409);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return userRepository.create({ ...data, password: hashedPassword });
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id);
    return userRepository.update(id, data);
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