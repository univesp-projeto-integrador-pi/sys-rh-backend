import authService from '../services/auth.service';
import userRepository from '../repositories/user.repository';
import refreshTokenRepository from '../repositories/refreshToken.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../repositories/user.repository');
jest.mock('../repositories/refreshToken.repository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockUserRepository         = userRepository         as jest.Mocked<typeof userRepository>;
const mockRefreshTokenRepository = refreshTokenRepository as jest.Mocked<typeof refreshTokenRepository>;
const mockBcrypt                 = bcrypt                 as jest.Mocked<typeof bcrypt>;
const mockJwt                    = jwt                    as jest.Mocked<typeof jwt>;

const mockUser = {
  id:        'user-1',
  name:      'Recrutador',
  email:     'recrutador@empresa.com',
  password:  'hashed-password',
  role:      'RECRUITER' as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET      = 'access-secret';
  process.env.JWT_REFRESH_SECRET     = 'refresh-secret';
  process.env.JWT_ACCESS_EXPIRES_IN  = '24h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
});

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('deve registrar usuário com senha hasheada', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        name:     'Recrutador',
        email:    'recrutador@empresa.com',
        password: 'Senha@123',
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith('Senha@123', 10);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('recrutador@empresa.com');
    });

    it('deve lançar erro quando email já cadastrado', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register({
        name:     'Recrutador',
        email:    'recrutador@empresa.com',
        password: 'Senha@123',
      })).rejects.toThrow('Email já cadastrado');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('não deve retornar senha no objeto de resposta', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        name:     'Recrutador',
        email:    'recrutador@empresa.com',
        password: 'Senha@123',
      });

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('deve retornar tokens quando credenciais são válidas', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockResolvedValue({} as any);

      const result = await authService.login({
        email:    'recrutador@empresa.com',
        password: 'Senha@123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('recrutador@empresa.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve incluir role no payload do token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('token');
      mockRefreshTokenRepository.create.mockResolvedValue({} as any);

      await authService.login({
        email:    'recrutador@empresa.com',
        password: 'Senha@123',
      });

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'RECRUITER' }),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login({
        email:    'inexistente@email.com',
        password: 'Senha@123',
      })).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro quando senha está incorreta', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({
        email:    'recrutador@empresa.com',
        password: 'senha-errada',
      })).rejects.toThrow('Credenciais inválidas');

      expect(mockRefreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it('deve salvar refresh token no banco ao fazer login', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockResolvedValue({} as any);

      await authService.login({
        email:    'recrutador@empresa.com',
        password: 'Senha@123',
      });

      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(
        'user-1',
        'refresh-token',
        expect.any(Date)
      );
    });
  });

  describe('logout', () => {
    it('deve deletar refresh token do banco', async () => {
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue({} as any);

      await authService.logout('refresh-token');

      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith('refresh-token');
    });

    it('deve lançar erro quando token não fornecido', async () => {
      await expect(authService.logout('')).rejects.toThrow('Refresh token não fornecido');
      expect(mockRefreshTokenRepository.deleteByToken).not.toHaveBeenCalled();
    });
  });

  describe('logoutAll', () => {
    it('deve deletar todos os tokens do usuário', async () => {
      mockRefreshTokenRepository.deleteAllByUserId.mockResolvedValue({} as any);

      await authService.logoutAll('user-1');

      expect(mockRefreshTokenRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('refresh', () => {
    it('deve retornar novo access token com refresh token válido', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id:        'token-1',
        token:     'refresh-token',
        userId:    'user-1',
        expiresAt: futureDate,
        createdAt: new Date(),
        user:      mockUser,
      });
      (mockJwt.verify as jest.Mock).mockReturnValue({
        userId: 'user-1',
        email:  'recrutador@empresa.com',
        role:   'RECRUITER',
      });
      (mockJwt.sign as jest.Mock).mockReturnValue('novo-access-token');

      const result = await authService.refresh('refresh-token');

      expect(result).toHaveProperty('accessToken', 'novo-access-token');
    });

    it('deve lançar erro quando refresh token não fornecido', async () => {
      await expect(authService.refresh('')).rejects.toThrow('Refresh token não fornecido');
    });

    it('deve lançar erro quando refresh token não existe no banco', async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(authService.refresh('token-inexistente'))
        .rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('deve lançar erro quando refresh token está expirado', async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(authService.refresh('token-expirado'))
        .rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('deve lançar erro quando assinatura do token é inválida', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id:        'token-1',
        token:     'refresh-token',
        userId:    'user-1',
        expiresAt: futureDate,
        createdAt: new Date(),
        user:      mockUser,
      });
    
      (mockJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(authService.refresh('refresh-token'))
        .rejects.toThrow('Refresh token inválido');
    });
  });
});