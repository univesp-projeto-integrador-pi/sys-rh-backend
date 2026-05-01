import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository';
import refreshTokenRepository from '../repositories/refreshToken.repository';
import { AccessTokenPayload, LoginDTO, RegisterDTO, AuthResponseDTO } from '../dto/auth.dto';
import { AppError } from '../middlewares/errorHandler.middleware';
import { randomUUID } from 'crypto';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 10;

class AuthService {
  private generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any 
    });
  }

  private generateRefreshToken(payload: AccessTokenPayload): string {
    return jwt.sign(
      { ...payload, jti: randomUUID() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
    );
  }

  async register(data: RegisterDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email já cadastrado', 409);

    const hashPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      hashPassword,
      role: UserRole.USER,
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(data: LoginDTO) {
    console.log(`[AuthService] Tentativa de login para: ${data.email}`);
    
    const user = await userRepository.findByEmail(data.email);
    if (!user) throw new AppError('Credenciais inválidas', 401);

    const passwordMatch = await bcrypt.compare(data.password, user.hashPassword);
    if (!passwordMatch) throw new AppError('Credenciais inválidas', 401);

    const payload: AccessTokenPayload = { userId: user.id, email: user.email, role: user.role };

    const accessToken  = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    console.log(`[AuthService] Login bem-sucedido. Role: ${user.role}`);

    return {
      accessToken, // ⚠️ O Frontend deve salvar isso como 'user_token'
      refreshToken,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    };
  }

  async refresh(token: string) {
    if (!token) throw new AppError('Refresh token não fornecido', 401);
    
    const stored = await refreshTokenRepository.findByToken(token);
    if (!stored) throw new AppError('Refresh token inválido ou expirado', 401);

    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as AccessTokenPayload;
    } catch {
      throw new AppError('Refresh token inválido', 401);
    }

    const accessToken = this.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken };
  }

  async logout(token: string) {
    if (!token) throw new AppError('Refresh token não fornecido', 401);
    await refreshTokenRepository.deleteByToken(token);
  }

  async logoutAll(userId: string) {
    await refreshTokenRepository.deleteAllByUserId(userId);
  }
}

export default new AuthService();