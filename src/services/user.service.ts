import bcrypt from 'bcrypt';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';
import userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 10;

/**
 * @service UserService
 * @description Gerencia os usuários internos do sistema (recrutadores e administradores).
 *
 * Responsabilidades:
 * - Criar usuários internos com senha hasheada
 * - Consultar e listar usuários
 * - Atualizar dados e senha de usuários
 * - Gerenciar roles com proteção contra remoção do único ADMIN
 * - Remover usuários com proteção contra remoção do único ADMIN
 *
 * Diferença entre User e Candidate:
 * - `User` representa membros internos da equipe de RH com acesso ao sistema
 * - `Candidate` representa pessoas que se candidatam às vagas
 * - São entidades separadas e não se confundem no sistema
 *
 * Roles disponíveis:
 * - `null`      → conta criada via `/api/auth/register`, sem permissões até ADMIN atribuir role
 * - `USER`      → acesso básico
 * - `VIEWER`    → somente leitura
 * - `RECRUITER` → operações de recrutamento
 * - `ADMIN`     → acesso total ao sistema
 *
 * Segurança:
 * - Senhas nunca são armazenadas em texto plano — sempre hasheadas com bcrypt (custo 10)
 * - Atualização de senha re-hasheia automaticamente o novo valor
 * - O sistema garante que sempre haverá ao menos um ADMIN ativo:
 *   tanto `updateRole()` quanto `delete()` verificam e bloqueiam
 *   operações que deixariam o sistema sem nenhum administrador
 *
 * Acesso:
 * - Todas as operações deste service são exclusivas para ADMIN
 */
class UserService {
  /**
   * Retorna todos os usuários cadastrados no sistema.
   *
   * @returns Lista de usuários
   */
  async findAll() {
    return userRepository.findAll();
  }

  /**
   * Busca um usuário pelo ID.
   *
   * @param id - UUID do usuário
   * @returns Usuário encontrado
   * @throws AppError 404 - Usuário não encontrado
   */
  async findById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user;
  }

  /**
   * Cria um novo usuário interno com senha hasheada.
   * Diferente do registro público (`/api/auth/register`), este método
   * permite que o ADMIN defina a role diretamente na criação.
   *
   * Validações aplicadas:
   * - Email deve ser único no sistema
   * - Senha é hasheada com bcrypt antes de persistir
   *
   * @param data - name, email, password e role (opcional)
   * @returns Usuário criado
   * @throws AppError 409 - Email já cadastrado
   */
  async create(data: CreateUserDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email já cadastrado', 409);

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const userData: CreateUserDTO = { ...data, password: hashedPassword };
    return userRepository.create(userData);
  }

  /**
   * Atualiza dados de um usuário existente.
   * Permite alterar nome e senha.
   *
   * Comportamento da senha:
   * - Se `password` for enviado, é re-hasheado automaticamente antes de persistir
   * - Se `password` não for enviado, a senha atual é mantida
   *
   * @param id   - UUID do usuário
   * @param data - Campos a atualizar: name e/ou password (ambos opcionais)
   * @returns Usuário atualizado
   * @throws AppError 404 - Usuário não encontrado
   */
  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id);

    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    return userRepository.update(id, updateData);
  }

  /**
   * Atualiza a role de um usuário.
   * Somente ADMIN pode executar esta operação.
   *
   * Proteção contra rebaixamento do único ADMIN:
   * - Se o usuário alvo é ADMIN e a nova role não é ADMIN,
   *   verifica se há outros ADMINs no sistema
   * - Se for o único ADMIN, a operação é bloqueada
   *
   * @param id   - UUID do usuário
   * @param role - Nova role: ADMIN, RECRUITER, VIEWER ou USER
   * @returns Usuário com role atualizada
   * @throws AppError 404 - Usuário não encontrado
   * @throws AppError 400 - Não é possível rebaixar o único administrador
   */
  async updateRole(id: string, role: UserRole) {
    await this.findById(id);

    if (role !== UserRole.ADMIN) {
      const user = await userRepository.findById(id);
      if (user?.role === UserRole.ADMIN) {
        const adminCount = await userRepository.countByRole('ADMIN');
        if (adminCount <= 1) {
          throw new AppError('Não é possível rebaixar o único administrador do sistema', 400);
        }
      }
    }

    return userRepository.update(id, { role });
  }

  /**
   * Remove um usuário permanentemente do sistema.
   * Remoção física — não há soft delete nesta entidade.
   *
   * Proteção contra remoção do único ADMIN:
   * - Se o usuário a ser removido é ADMIN, verifica se há outros ADMINs
   * - Se for o único ADMIN, a operação é bloqueada
   *
   * Atenção: notas internas criadas por este usuário possuem
   * relação com `authorId` — verifique integridade referencial
   * antes de remover usuários com notas vinculadas.
   *
   * @param id - UUID do usuário
   * @throws AppError 404 - Usuário não encontrado
   * @throws AppError 400 - Não é possível remover o único administrador do sistema
   */
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