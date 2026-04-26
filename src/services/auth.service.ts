import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository';
import refreshTokenRepository from '../repositories/refreshToken.repository';
import { AccessTokenPayload, LoginDTO, RegisterDTO } from '../dto/auth.dto';
import { AppError } from '../middlewares/errorHandler.middleware';
import { randomUUID } from 'crypto';

/**
 * @service AuthService
 * @description Gerencia autenticação e sessão dos usuários internos do sistema.
 *
 * Responsabilidades:
 * - Registrar novos usuários com senha hasheada
 * - Autenticar usuários e emitir par de tokens (access + refresh)
 * - Renovar access token usando refresh token válido
 * - Invalidar sessão individual (logout)
 * - Invalidar todas as sessões do usuário (logout em todos os dispositivos)
 *
 * Estratégia de autenticação — JWT com Refresh Token:
 *
 * Access Token:
 * - Duração configurável via JWT_ACCESS_EXPIRES_IN (padrão: 24h)
 * - Contém: userId, email e role do usuário
 * - Enviado no header Authorization: Bearer <token>
 * - Stateless — não é armazenado no banco
 *
 * Refresh Token:
 * - Duração configurável via JWT_REFRESH_EXPIRES_IN (padrão: 7 dias)
 * - Contém jti (JWT ID) único via `randomUUID()` para evitar colisões
 *   em logins rápidos e consecutivos
 * - Armazenado no banco (tabela refresh_tokens) para suporte a logout real
 * - Enviado ao cliente via cookie HttpOnly — não acessível via JavaScript
 * - Filtrado no banco por expiração — tokens vencidos não são retornados
 *
 * Registro de usuários:
 * - Contas criadas via `register()` ficam com role `null`
 * - Um ADMIN deve atribuir a role via `PATCH /api/users/:id/role`
 * - Enquanto sem role, o usuário não tem acesso às rotas internas
 *
 * Variáveis de ambiente necessárias:
 * - JWT_ACCESS_SECRET      → chave secreta do access token
 * - JWT_REFRESH_SECRET     → chave secreta do refresh token
 * - JWT_ACCESS_EXPIRES_IN  → duração do access token (ex: "24h")
 * - JWT_REFRESH_EXPIRES_IN → duração do refresh token (ex: "7d")
 */
class AuthService {
  /**
   * Gera um access token JWT com os dados do usuário.
   * Token de curta duração usado em todas as requisições autenticadas.
   *
   * @param payload - userId, email e role
   * @returns Access token assinado
   */
  private generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });
  }

  /**
   * Gera um refresh token JWT com jti (JWT ID) único.
   * O jti é gerado via `randomUUID()` para garantir unicidade
   * mesmo em logins consecutivos com o mesmo payload.
   * Token de longa duração armazenado no banco para suporte a logout real.
   *
   * @param payload - userId, email e role
   * @returns Refresh token assinado com jti único
   */
  private generateRefreshToken(payload: AccessTokenPayload): string {
    return jwt.sign(
      { ...payload, jti: randomUUID() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
  }

  /**
   * Registra um novo usuário interno no sistema.
   * Conta criada sem role — ADMIN deve atribuir via `PATCH /api/users/:id/role`.
   *
   * Validações aplicadas:
   * - Email deve ser único no sistema
   * - Senha é hasheada com bcrypt (custo 10) antes de persistir
   *
   * Retorno intencional sem password:
   * - A senha nunca é retornada na resposta, mesmo hasheada
   *
   * @param data - name, email e password
   * @returns Dados públicos do usuário criado: id, name, email e role (null)
   * @throws AppError 409 - Email já cadastrado
   */
  async register(data: RegisterDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email já cadastrado', 409);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      name:     data.name,
      email:    data.email,
      password: hashedPassword,
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  /**
   * Autentica um usuário e retorna par de tokens.
   *
   * Fluxo de autenticação:
   * 1. Busca usuário pelo email
   * 2. Compara senha informada com hash armazenado via bcrypt
   * 3. Gera access token (curta duração) e refresh token (longa duração)
   * 4. Persiste refresh token no banco com data de expiração
   * 5. Retorna access token no body e refresh token para o cookie HttpOnly
   *
   * Mensagem de erro genérica:
   * - "Credenciais inválidas" é retornado tanto para email inexistente
   *   quanto para senha incorreta — evita enumeração de usuários
   *
   * @param data - email e password
   * @returns accessToken, refreshToken e dados públicos do usuário
   * @throws AppError 401 - Credenciais inválidas
   */
  async login(data: LoginDTO) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) throw new AppError('Credenciais inválidas', 401);

    const passwordMatch = await bcrypt.compare(data.password, user.hashPassword);
    if (!passwordMatch) throw new AppError('Credenciais inválidas', 401);

    const payload: AccessTokenPayload = {
      userId: user.id,
      email:  user.email,
      role:   user.role,
    };

    const accessToken  = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      }
    };
  }

  /**
   * Renova o access token usando um refresh token válido.
   *
   * Fluxo de renovação:
   * 1. Valida presença do token
   * 2. Busca token no banco — retorna null se não existir ou estiver expirado
   *    (o repositório filtra por `expiresAt > now()` diretamente na query)
   * 3. Verifica assinatura JWT do refresh token
   * 4. Gera e retorna novo access token com os mesmos dados do payload
   *
   * Proteção dupla contra tokens expirados:
   * - Banco: `findByToken()` filtra tokens com `expiresAt` no passado
   * - JWT: `jwt.verify()` rejeita tokens com `exp` vencido
   *
   * @param token - Refresh token extraído do cookie HttpOnly
   * @returns Novo access token
   * @throws AppError 401 - Refresh token não fornecido
   * @throws AppError 401 - Refresh token inválido ou expirado (não encontrado no banco)
   * @throws AppError 401 - Refresh token inválido (assinatura JWT inválida)
   */
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
      email:  payload.email,
      role:   payload.role,
    });

    return { accessToken };
  }

  /**
   * Invalida a sessão atual do usuário removendo o refresh token do banco.
   * O access token continua válido até expirar naturalmente (máx 24h),
   * mas sem refresh token o usuário não consegue renovar a sessão.
   *
   * @param token - Refresh token extraído do cookie HttpOnly
   * @throws AppError 401 - Refresh token não fornecido
   */
  async logout(token: string) {
    if (!token) throw new AppError('Refresh token não fornecido', 401);
    await refreshTokenRepository.deleteByToken(token);
  }

  /**
   * Invalida todas as sessões ativas do usuário em todos os dispositivos.
   * Remove todos os refresh tokens associados ao userId do banco.
   * Útil em casos de comprometimento de conta ou troca de senha.
   *
   * @param userId - UUID do usuário
   */
  async logoutAll(userId: string) {
    await refreshTokenRepository.deleteAllByUserId(userId);
  }
}

export default new AuthService();