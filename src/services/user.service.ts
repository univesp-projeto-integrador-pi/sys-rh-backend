import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';
import userRepository from '../repositories/user.repository';

class UserService {
  async findAll() {
    return userRepository.findAll();
  }

  async findById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  }

  async create(data: CreateUserDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new Error('Email já cadastrado');
    return userRepository.create(data);
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id);
    return userRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return userRepository.delete(id);
  }
}

export default new UserService();