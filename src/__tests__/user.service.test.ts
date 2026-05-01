import userService from '../services/user.service';
import userRepository from '../repositories/user.repository';
import { UserRole } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler.middleware';

jest.mock('../repositories/user.repository');

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

const mockUser = {
  id: 'uuid-1',
  name: 'João Silva',
  email: 'joao@email.com',
  hashPassword: 'hashed-password',
  role: UserRole.RECRUITER,
  createdAt: new Date(),
  updatedAt: null,
  internalProfile: null,
};

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('deve retornar lista de usuários', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser as any]);

      const result = await userService.findAll();

      expect(result).toHaveLength(1);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser as any);

      const result = await userService.findById('uuid-1');

      expect(result).toEqual(mockUser);
    });

    it('deve lançar AppError quando usuário não encontrado', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.findById('uuid-inexistente'))
        .rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('deve criar usuário com sucesso e hashear senha', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser as any);

      const result = await userService.create({
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'Senha@123',
      });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hashPassword: expect.any(String),
          email: 'joao@email.com'
        })
      );
 
      const calledArgs = mockUserRepository.create.mock.calls[0][0];
      expect(calledArgs.hashPassword).not.toBe('Senha@123');
    });

    it('deve lançar erro quando email já cadastrado', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(userService.create({
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'Senha@123',
      })).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('updateRole', () => {
    it('deve lançar erro ao tentar rebaixar o único ADMIN', async () => {
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, role: UserRole.ADMIN } as any);
      mockUserRepository.countByRole.mockResolvedValue(1);

      await expect(userService.updateRole('uuid-1', UserRole.USER))
        .rejects.toThrow('Não é possível rebaixar o único administrador do sistema');
    });

    it('deve permitir alterar role se houver outros ADMINs', async () => {
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, role: UserRole.ADMIN } as any);
      mockUserRepository.countByRole.mockResolvedValue(2);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, role: UserRole.USER } as any);

      await userService.updateRole('uuid-1', UserRole.USER);

      expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', { role: UserRole.USER });
    });
  });

  describe('delete', () => {
    it('deve deletar usuário RECRUITER com sucesso', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockUserRepository.delete.mockResolvedValue(mockUser as any);

      await userService.delete('uuid-1');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve impedir a remoção do último ADMIN', async () => {
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, role: UserRole.ADMIN } as any);
      mockUserRepository.countByRole.mockResolvedValue(1);

      await expect(userService.delete('uuid-1'))
        .rejects.toThrow(AppError);
      
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});