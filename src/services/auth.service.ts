import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository';
import refreshTokenRepository from '../repositories/refreshToken.repository';
import { AccessTokenPayload, LoginDTO, RegisterDTO } from '../dto/auth.dto';

class AuthService {
  private generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });
  }

  private generateRefreshToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });
  }

  async register(data: RegisterDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new Error('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  async login(data: LoginDTO) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) throw new Error('Credenciais inválidas');

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) throw new Error('Credenciais inválidas');

    const payload: AccessTokenPayload = { userId: user.id, email: user.email };

    const accessToken  = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // salva o refresh token no banco com expiração de 7 dias
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email }
    };
  }

  async refresh(token: string) {
    if (!token) throw new Error('Refresh token não fornecido');

    // verifica se o token existe no banco
    const stored = await refreshTokenRepository.findByToken(token);
    if (!stored) throw new Error('Refresh token inválido');

    // verifica se está expirado
    if (stored.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(token);
      throw new Error('Refresh token expirado');
    }

    // valida a assinatura do token
    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as AccessTokenPayload;
    } catch {
      throw new Error('Refresh token inválido');
    }

    // gera novo access token
    const accessToken = this.generateAccessToken({
      userId: payload.userId,
      email: payload.email
    });

    return { accessToken };
  }

  async logout(token: string) {
    if (!token) throw new Error('Refresh token não fornecido');
    await refreshTokenRepository.deleteByToken(token);
  }

  async logoutAll(userId: string) {
    await refreshTokenRepository.deleteAllByUserId(userId);
  }
}

export default new AuthService();