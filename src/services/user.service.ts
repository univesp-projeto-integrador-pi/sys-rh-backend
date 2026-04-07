import bcrypt from 'bcrypt';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';
import userRepository from '../repositories/user.repository';

const SALT_ROUNDS = 10;

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

  async delete(id: string) {
    await this.findById(id);
    return userRepository.delete(id);
  }
}

export default new UserService();