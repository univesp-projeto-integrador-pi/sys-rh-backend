import userService from '../services/user.service';
import userRepository from '../repositories/user.repository';

jest.mock('../repositories/user.repository');

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

const mockUser = {
  id: 'uuid-1',
  name: 'João Silva',
  email: 'joao@email.com',
  hashPassword: 'hashed-password',
  role: 'RECRUITER' as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('deve retornar lista de usuários', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser]);

      const result = await userService.findAll();

      expect(result).toHaveLength(1);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById('uuid-1');

      expect(result).toEqual(mockUser);
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.findById('uuid-inexistente'))
        .rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('create', () => {
    it('deve criar usuário com sucesso e hashear senha', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.create({
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'Senha@123',
      });

      expect(result).toEqual(mockUser);
      // garante que a senha foi hasheada antes de salvar
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.not.stringContaining('Senha@123')
        })
      );
    });

    it('deve lançar erro quando email já cadastrado', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.create({
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'Senha@123',
      })).rejects.toThrow('Email já cadastrado');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar usuário com sucesso', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, name: 'João Atualizado' });

      const result = await userService.update('uuid-1', { name: 'João Atualizado' });

      expect(result.name).toBe('João Atualizado');
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.update('uuid-inexistente', { name: 'João' }))
        .rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('delete', () => {
    it('deve deletar usuário RECRUITER com sucesso', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(mockUser);

      await userService.delete('uuid-1');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('uuid-1');
      expect(mockUserRepository.countByRole).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.delete('uuid-inexistente'))
        .rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro ao tentar remover o único ADMIN', async () => {
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, role: 'ADMIN' as any });
      mockUserRepository.countByRole.mockResolvedValue(1);

      await expect(userService.delete('uuid-1'))
        .rejects.toThrow('Não é possível remover o único administrador do sistema');

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('deve permitir remover ADMIN quando há mais de um', async () => {
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, role: 'ADMIN' as any });
      mockUserRepository.countByRole.mockResolvedValue(2);
      mockUserRepository.delete.mockResolvedValue(mockUser);

      await userService.delete('uuid-1');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('uuid-1');
    });
  });
});