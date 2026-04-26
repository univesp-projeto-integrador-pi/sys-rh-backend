import internalProfileRepository from '../repositories/internalProfile.repository';
import candidateRepository from '../repositories/candidate.repository';
import departmentRepository from '../repositories/department.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { TerminationReason } from '@prisma/client';
import {
  CreateInternalProfileDTO,
  UpdateInternalProfileDTO,
  TerminateEmployeeDTO,
} from '../dto/internalProfile.dto';

/**
 * @service InternalProfileService
 * @description Gerencia os perfis internos de colaboradores contratados.
 *
 * Responsabilidades:
 * - Criar perfis internos manual ou automaticamente via contratação
 * - Consultar colaboradores por diferentes critérios (id, candidato, departamento, gestor)
 * - Atualizar dados funcionais do colaborador (cargo, departamento, gestor)
 * - Registrar desligamentos com motivo e data, aplicando soft delete no candidato vinculado
 *
 * Criação automática vs manual:
 * - `create()` → criação manual pelo ADMIN com todos os dados obrigatórios
 * - `createFromHiring()` → chamado automaticamente pelo JobApplicationService
 *   quando uma candidatura atinge a etapa HIRED. Cria o perfil com dados mínimos
 *   (cargo "A definir") para o RH completar posteriormente via `update()`
 *
 * Hierarquia organizacional:
 * - Cada colaborador pode ter um gestor (managerId → outro InternalProfile)
 * - Um colaborador não pode ser gestor de si mesmo
 * - O gestor deve estar com status ACTIVE para ser atribuído
 * - `findSubordinates()` retorna os subordinados diretos ativos de um gestor
 *
 * Desligamento:
 * - Ao desligar um colaborador via `terminate()`, dois efeitos são aplicados:
 *   1. InternalProfile recebe status TERMINATED, data e motivo do desligamento
 *   2. Candidate vinculado recebe soft delete (deletedAt preenchido)
 * - Motivos disponíveis: RESIGNATION, DISMISSAL_WITH_CAUSE, DISMISSAL_WITHOUT_CAUSE,
 *   END_OF_CONTRACT, MUTUAL_AGREEMENT, RETIREMENT, OTHER
 *
 * Acesso:
 * - Leitura: qualquer usuário autenticado
 * - Criação, edição e desligamento: exclusivo para ADMIN
 */
class InternalProfileService {
  /**
   * Retorna todos os perfis internos independente do status.
   * Inclui dados do candidato, departamento e gestor.
   *
   * @returns Lista completa de perfis internos
   */
  async findAll() {
    return internalProfileRepository.findAll();
  }

  /**
   * Retorna apenas colaboradores com status ACTIVE.
   * Útil para listagens operacionais que não devem incluir
   * colaboradores desligados ou afastados.
   *
   * @returns Lista de perfis com status ACTIVE
   */
  async findAllActive() {
    return internalProfileRepository.findAllActive();
  }

  /**
   * Busca um perfil interno pelo ID.
   *
   * @param id - UUID do perfil interno
   * @returns Perfil encontrado com candidato, departamento e gestor
   * @throws AppError 404 - Perfil interno não encontrado
   */
  async findById(id: string) {
    const profile = await internalProfileRepository.findById(id);
    if (!profile) throw new AppError('Perfil interno não encontrado', 404);
    return profile;
  }

  /**
   * Busca o perfil interno pelo ID do candidato vinculado.
   * Útil para verificar se um candidato já foi contratado.
   *
   * @param candidateId - UUID do candidato
   * @returns Perfil interno vinculado ao candidato
   * @throws AppError 404 - Perfil interno não encontrado
   */
  async findByCandidateId(candidateId: string) {
    const profile = await internalProfileRepository.findByCandidateId(candidateId);
    if (!profile) throw new AppError('Perfil interno não encontrado', 404);
    return profile;
  }

  /**
   * Lista colaboradores ativos de um departamento específico.
   *
   * @param departmentId - UUID do departamento
   * @returns Lista de perfis ativos do departamento
   * @throws AppError 404 - Departamento não encontrado
   */
  async findByDepartmentId(departmentId: string) {
    const department = await departmentRepository.findById(departmentId);
    if (!department) throw new AppError('Departamento não encontrado', 404);
    return internalProfileRepository.findByDepartmentId(departmentId);
  }

  /**
   * Lista os subordinados diretos ativos de um gestor.
   *
   * @param managerId - UUID do perfil interno do gestor
   * @returns Lista de subordinados ativos
   * @throws AppError 404 - Gestor não encontrado
   */
  async findSubordinates(managerId: string) {
    await this.findById(managerId);
    return internalProfileRepository.findSubordinates(managerId);
  }

  /**
   * Cria um perfil interno manualmente pelo ADMIN.
   *
   * Validações aplicadas (em ordem):
   * 1. Candidato deve existir e não estar deletado
   * 2. Departamento deve existir
   * 3. Candidato não pode ter perfil interno duplicado
   * 4. Código de colaborador deve ser único no sistema
   * 5. Gestor, quando informado, deve existir e estar ACTIVE
   *
   * @param data - candidateId, departmentId, employeeCode, currentJobTitle e managerId (opcional)
   * @returns Perfil interno criado
   * @throws AppError 404 - Candidato, departamento ou gestor não encontrado
   * @throws AppError 400 - Gestor não está ativo
   * @throws AppError 409 - Candidato já possui perfil interno ou código duplicado
   */
  async create(data: CreateInternalProfileDTO) {
    const candidate = await candidateRepository.findById(data.candidateId);
    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError('Candidato não encontrado', 404);
    }

    const department = await departmentRepository.findById(data.departmentId);
    if (!department) throw new AppError('Departamento não encontrado', 404);

    const existing = await internalProfileRepository.findByCandidateId(data.candidateId);
    if (existing) throw new AppError('Candidato já possui perfil interno', 409);

    const existingCode = await internalProfileRepository.findByEmployeeCode(data.employeeCode);
    if (existingCode) throw new AppError('Código de colaborador já em uso', 409);

    if (data.managerId) {
      const manager = await internalProfileRepository.findById(data.managerId);
      if (!manager) throw new AppError('Gestor não encontrado', 404);
      if (manager.status !== 'ACTIVE') throw new AppError('Gestor não está ativo', 400);
    }

    return internalProfileRepository.create(data);
  }

  /**
   * Cria um perfil interno automaticamente quando uma candidatura atinge HIRED.
   * Chamado internamente pelo JobApplicationService — não deve ser chamado diretamente.
   *
   * Comportamento:
   * - Se o candidato já possui perfil interno, retorna o existente sem criar duplicata
   * - Cria com dados mínimos: employeeCode gerado via timestamp e cargo "A definir"
   * - O ADMIN deve completar os dados via `update()` após a contratação
   *
   * @param candidateId  - UUID do candidato contratado
   * @param departmentId - UUID do departamento da vaga que originou a contratação
   * @returns Perfil interno existente ou recém-criado
   */
  async createFromHiring(candidateId: string, departmentId: string) {
    const existing = await internalProfileRepository.findByCandidateId(candidateId);
    if (existing) return existing;

    const employeeCode = `EMP-${Date.now()}`;

    return internalProfileRepository.create({
      candidateId,
      departmentId,
      employeeCode,
      currentJobTitle: 'A definir',
    });
  }

  /**
   * Atualiza dados funcionais de um colaborador.
   * Permite alterar departamento, cargo e gestor.
   *
   * Validações aplicadas:
   * - Perfil deve existir
   * - Novo departamento, quando informado, deve existir
   * - Novo gestor, quando informado, deve existir e estar ACTIVE
   * - Colaborador não pode ser atribuído como seu próprio gestor
   *
   * @param id   - UUID do perfil interno
   * @param data - Campos a atualizar: departmentId, currentJobTitle e/ou managerId (todos opcionais)
   * @returns Perfil atualizado
   * @throws AppError 404 - Perfil, departamento ou gestor não encontrado
   * @throws AppError 400 - Gestor inativo ou auto-referência
   */
  async update(id: string, data: UpdateInternalProfileDTO) {
    await this.findById(id);

    if (data.departmentId) {
      const department = await departmentRepository.findById(data.departmentId);
      if (!department) throw new AppError('Departamento não encontrado', 404);
    }

    if (data.managerId) {
      const manager = await internalProfileRepository.findById(data.managerId);
      if (!manager) throw new AppError('Gestor não encontrado', 404);
      if (manager.status !== 'ACTIVE') throw new AppError('Gestor não está ativo', 400);
      if (manager.id === id) throw new AppError('Colaborador não pode ser seu próprio gestor', 400);
    }

    return internalProfileRepository.update(id, data);
  }

  /**
   * Registra o desligamento de um colaborador.
   *
   * Efeitos aplicados em sequência:
   * 1. Soft delete no candidato vinculado (deletedAt preenchido)
   *    — remove o candidato das listagens e bloqueia novas candidaturas
   * 2. Atualiza o perfil interno com:
   *    - status: TERMINATED
   *    - terminatedAt: data/hora atual
   *    - terminationReason: motivo informado
   *    - terminationNotes: observações livres (opcional)
   *
   * Motivos de desligamento disponíveis:
   * - RESIGNATION           → pedido de demissão pelo colaborador
   * - DISMISSAL_WITH_CAUSE  → demissão por justa causa
   * - DISMISSAL_WITHOUT_CAUSE → demissão sem justa causa
   * - END_OF_CONTRACT       → fim de contrato
   * - MUTUAL_AGREEMENT      → acordo entre as partes
   * - RETIREMENT            → aposentadoria
   * - OTHER                 → outros motivos
   *
   * @param id   - UUID do perfil interno
   * @param data - terminationReason e terminationNotes (opcional)
   * @returns Perfil interno atualizado com status TERMINATED
   * @throws AppError 404 - Perfil interno não encontrado
   * @throws AppError 400 - Colaborador já foi desligado
   */
  async terminate(id: string, data: TerminateEmployeeDTO) {
    const profile = await this.findById(id);

    if (profile.status === 'TERMINATED') {
      throw new AppError('Colaborador já foi desligado', 400);
    }

    await candidateRepository.softDelete(profile.candidateId);

    return internalProfileRepository.terminate(
      id,
      data.terminationReason as TerminationReason,
      data.terminationNotes
    );
  }
}

export default new InternalProfileService();