import jobPositionRepository from '../repositories/jobPosition.repository';
import departmentRepository from '../repositories/department.repository';
import { CreateJobPositionDTO, UpdateJobPositionDTO } from '../dto/jobPosition.dto';
import { AppError } from '../middlewares/errorHandler.middleware';

/**
 * @service JobPositionService
 * @description Gerencia o ciclo de vida completo das vagas de emprego.
 *
 * Responsabilidades:
 * - Listar vagas (todas ou apenas abertas para rota pública)
 * - Criar vagas vinculadas a um departamento existente
 * - Atualizar dados e status de vagas (OPEN, CLOSED, PAUSED)
 * - Remover vagas permanentemente
 *
 * Este service é consumido por dois controllers distintos:
 * - `jobPosition.controller.ts` → rotas internas (requer autenticação)
 * - Rota pública `GET /api/jobs/open` → sem autenticação
 *
 * Regras de negócio:
 * - Uma vaga só pode ser criada se o departamento informado existir
 * - Não é possível operar sobre uma vaga inexistente
 */
class JobPositionService {
  /**
   * Retorna todas as vagas cadastradas independente do status.
   * Usado internamente por recrutadores e administradores.
   *
   * @returns Lista de vagas com departamento incluído
   */
  async findAll() {
    return jobPositionRepository.findAll();
  }

  /**
   * Retorna apenas vagas com status OPEN.
   * Usado na rota pública acessível por candidatos externos.
   *
   * @returns Lista de vagas abertas com departamento incluído
   */
  async findAllOpen() {
    return jobPositionRepository.findAllOpen();
  }

  /**
   * Busca uma vaga pelo ID.
   * Lança erro 404 se a vaga não for encontrada.
   *
   * @param id - UUID da vaga
   * @returns Vaga encontrada com departamento incluído
   * @throws AppError 404 - Vaga não encontrada
   */
  async findById(id: string) {
    const position = await jobPositionRepository.findById(id);
    if (!position) throw new AppError('Vaga não encontrada', 404);
    return position;
  }

  /**
   * Cria uma nova vaga vinculada a um departamento.
   *
   * Validações aplicadas:
   * - Departamento informado deve existir no sistema
   *
   * @param data - Dados da vaga: title, description (opcional), departmentId
   * @returns Vaga criada com departamento incluído
   * @throws AppError 404 - Departamento não encontrado
   */
  async create(data: CreateJobPositionDTO) {
    const department = await departmentRepository.findById(data.departmentId);
    if (!department) throw new AppError('Departamento não encontrado', 404);
    return jobPositionRepository.create(data);
  }

  /**
   * Atualiza dados de uma vaga existente.
   * Permite alterar título, descrição, status e departamento.
   *
   * Validações aplicadas:
   * - Vaga deve existir antes de ser atualizada
   *
   * @param id   - UUID da vaga
   * @param data - Campos a atualizar (todos opcionais)
   * @returns Vaga atualizada com departamento incluído
   * @throws AppError 404 - Vaga não encontrada
   */
  async update(id: string, data: UpdateJobPositionDTO) {
    await this.findById(id);
    return jobPositionRepository.update(id, data);
  }

  /**
   * Remove uma vaga permanentemente do sistema.
   *
   * Validações aplicadas:
   * - Vaga deve existir antes de ser removida
   *
   * Atenção: remoção física — não há soft delete nesta entidade.
   * Candidaturas vinculadas devem ser consideradas antes de deletar.
   *
   * @param id - UUID da vaga
   * @throws AppError 404 - Vaga não encontrada
   */
  async delete(id: string) {
    await this.findById(id);
    return jobPositionRepository.delete(id);
  }
}

export default new JobPositionService();