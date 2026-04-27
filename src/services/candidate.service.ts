import { CreateCandidateDTO, UpdateCandidateDTO } from '../dto/candidate.dto';
import candidateRepository from '../repositories/candidate.repository';
import { AppError } from '../middlewares/errorHandler.middleware';

/**
 * @service CandidateService
 * @description Gerencia o ciclo de vida dos candidatos no sistema de recrutamento.
 *
 * Responsabilidades:
 * - Cadastrar novos candidatos (externos ou internos)
 * - Consultar e listar candidatos ativos
 * - Atualizar dados básicos do candidato
 * - Soft delete — preserva o histórico para auditoria
 *
 * Regras de negócio:
 * - Email é único no sistema — não permite duplicatas
 * - Candidatos deletados via soft delete não aparecem nas listagens
 * - Email não pode ser alterado após o cadastro
 * - O soft delete é encadeado automaticamente pelo InternalProfileService
 *   quando um colaborador é desligado
 *
 * Acesso:
 * - Criação: rota pública (candidatos externos se cadastram sem autenticação)
 * - Consulta, edição e remoção: rotas internas (RECRUITER ou ADMIN)
 */
class CandidateService {
  /**
   * Retorna todos os candidatos ativos.
   * Candidatos com `deletedAt` preenchido são excluídos automaticamente
   * pelo repositório via filtro `where: { deletedAt: null }`.
   *
   * @returns Lista de candidatos com currículo e perfil interno incluídos
   */
  async findAll() {
    return candidateRepository.findAll();
  }

  /**
   * Busca um candidato pelo ID com todos os relacionamentos.
   * Inclui currículo e perfil interno quando existentes.
   *
   * @param id - UUID do candidato
   * @returns Candidato encontrado
   * @throws AppError 404 - Candidato não encontrado
   */
  async findById(id: string) {
    const candidate = await candidateRepository.findById(id);
    if (!candidate) throw new AppError('Candidato não encontrado', 404);
    return candidate;
  }

  /**
   * Cadastra um novo candidato no sistema.
   *
   * Validações aplicadas:
   * - Email deve ser único — impede duplicatas no cadastro
   *
   * @param data - fullName, email e phone (opcional)
   * @returns Candidato criado
   * @throws AppError 409 - Email já cadastrado
   */
  async create(data: CreateCandidateDTO) {
    const existing = await candidateRepository.findByEmail(data.email);
    if (existing) throw new AppError('Você já possui um perfil de candidato cadastrado.', 409);
    
    // VERIFICAÇÃO À PROVA DE BALAS:
    // Checa se 'education' existe, se é um objeto e se tem a instituição (mesmo que vazia)
    const hasEducationData = !!(
      data.education && 
      typeof data.education === 'object' && 
      (data.education.institution || data.education.degree)
    );

    if (hasEducationData) {
      console.log("✅ [SERVICE] Rota detectada: createWithEducation()");
      return candidateRepository.createWithEducation(data);
    }

    console.log("⚠️ [SERVICE] Rota detectada: create() simples (sem educação)");
    return candidateRepository.create(data);
  }

  /**
   * Atualiza dados básicos de um candidato existente.
   * Permite alterar nome e telefone.
   *
   * Restrições:
   * - Email não pode ser alterado (use um novo cadastro se necessário)
   *
   * @param id   - UUID do candidato
   * @param data - Campos a atualizar: fullName e/ou phone (ambos opcionais)
   * @returns Candidato atualizado
   * @throws AppError 404 - Candidato não encontrado
   */
  async update(id: string, data: UpdateCandidateDTO) {
    const currentCandidate = await this.findById(id);
    if (data.email && data.email !== currentCandidate.email) {
      const emailExists = await candidateRepository.findByEmail(data.email);
      if (emailExists) throw new AppError('Este e-mail já está sendo utilizado por outro candidato', 409);
    }
    return candidateRepository.update(id, data);
  }

  /**
   * Realiza soft delete de um candidato.
   * O registro é mantido no banco com `deletedAt` preenchido —
   * não aparece mais nas listagens mas preserva o histórico de candidaturas.
   *
   * Este método também é chamado automaticamente pelo InternalProfileService
   * quando um colaborador é desligado via `terminate()`.
   *
   * @param id - UUID do candidato
   * @throws AppError 404 - Candidato não encontrado
   */
  async delete(id: string) {
    await this.findById(id);
    return candidateRepository.softDelete(id);
  }
}

export default new CandidateService();