import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../dto/department.dto';
import departmentRepository from '../repositories/department.repository';
import { AppError } from '../middlewares/errorHandler.middleware';

/**
 * @service DepartmentService
 * @description Gerencia os departamentos da estrutura organizacional da empresa.
 *
 * Responsabilidades:
 * - Criar e manter departamentos que agrupam vagas e colaboradores
 * - Garantir unicidade de nomes de departamentos
 * - Servir como referência para criação de vagas e perfis internos
 *
 * Regras de negócio:
 * - Nome do departamento deve ser único no sistema(Isso aqui ainda não está com controle de nome, apenas ID)
 * - Departamentos são referenciados por vagas (JobPosition) e
 *   perfis internos (InternalProfile) — deletar um departamento
 *   que possui vínculos ativos pode causar erros de integridade referencial
 *
 * Acesso:
 * - Leitura: qualquer usuário autenticado
 * - Criação, edição e remoção: exclusivo para ADMIN
 *
 * Nota: os erros estão sendo lançados como `Error` nativo —
 * recomenda-se migrar para `AppError` para padronizar os status HTTP.
 */
class DepartmentService {
  /**
   * Retorna todos os departamentos cadastrados.
   *
   * @returns Lista de departamentos
   */
  async findAll() {
    return departmentRepository.findAll();
  }

  /**
   * Busca um departamento pelo ID.
   *
   * @param id - UUID do departamento
   * @returns Departamento encontrado
   * @throws AppError 404 - Departamento não encontrado
   */
  async findById(id: string) {
    const department = await departmentRepository.findById(id);
    if (!department) throw new AppError('Departamento não encontrado', 404);
    return department;
  }

  /**
   * Cria um novo departamento.
   *
   * Validações aplicadas:
   * - Nome deve ser único — impede departamentos duplicados
   *
   * @param data - name do departamento
   * @returns Departamento criado
   * @throws AppError 409 - Departamento já cadastrado
   */
  async create(data: CreateDepartmentDTO) {
    const existing = await departmentRepository.findByName(data.name);
    if (existing) throw new AppError('Departamento já cadastrado', 409);
    return departmentRepository.create(data);
  }

  /**
   * Atualiza o nome de um departamento existente.
   *
   * Validações aplicadas:
   * - Departamento deve existir antes de ser atualizado
   *
   * @param id   - UUID do departamento
   * @param data - Novo nome do departamento
   * @returns Departamento atualizado
   * @throws AppError 404 - Departamento não encontrado
   */
  async update(id: string, data: UpdateDepartmentDTO) {
    await this.findById(id);
    return departmentRepository.update(id, data);
  }

  /**
   * Remove um departamento permanentemente.
   *
   * Atenção: remoção física — não há soft delete nesta entidade.
   * Antes de deletar, verifique se o departamento não possui
   * vagas ativas ou colaboradores vinculados, pois isso causará
   * erro de integridade referencial no banco de dados.
   *
   * @param id - UUID do departamento
   * @throws AppError 404 - Departamento não encontrado
   */
  async delete(id: string) {
    await this.findById(id);
    return departmentRepository.delete(id);
  }
}

export default new DepartmentService();