import jobApplicationRepository from '../repositories/jobApplication.repository';
import candidateRepository from '../repositories/candidate.repository';
import jobPositionRepository from '../repositories/jobPosition.repository';
import internalNoteService from './internalNote.service';
import internalProfileService from './internalProfile.service';
import { AppError } from '../middlewares/errorHandler.middleware';
import { CreateJobApplicationDTO, UpdateJobApplicationDTO } from '../dto/jobApplication.dto';

/**
 * @service JobApplicationService
 * @description Gerencia o funil completo de candidaturas ao longo do processo seletivo.
 *
 * Responsabilidades:
 * - Submeter candidaturas a vagas abertas
 * - Movimentar candidaturas pelas etapas do funil de seleção
 * - Registrar auditoria automática a cada mudança de etapa
 * - Acionar a criação do perfil interno quando candidato é contratado (HIRED)
 * - Soft delete de candidaturas (preservação histórica)
 *
 * Integração com outros services:
 * - `internalNoteService` → cria nota de auditoria a cada mudança de etapa
 * - `internalProfileService` → cria perfil interno automaticamente ao atingir HIRED
 *
 * Funil de etapas disponíveis:
 * APPLIED → SCREENING → INTERVIEW → OFFER → HIRED | REJECTED
 */
class JobApplicationService {
  /**
   * Retorna todas as candidaturas ativas (excluindo soft deletes).
   * Filtra também candidatos que foram removidos via soft delete.
   *
   * @returns Lista de candidaturas com candidato e vaga incluídos
   */
  async findAll() {
    return jobApplicationRepository.findAll();
  }

  /**
   * Busca uma candidatura pelo ID com todos os relacionamentos.
   * Inclui candidato, vaga com departamento e notas internas com autor.
   *
   * @param id - UUID da candidatura
   * @returns Candidatura completa
   * @throws AppError 404 - Candidatura não encontrada
   */
  async findById(id: string) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) throw new AppError('Candidatura não encontrada', 404);
    return application;
  }

  /**
   * Retorna todas as candidaturas ativas de um candidato específico.
   *
   * @param candidateId - UUID do candidato
   * @returns Lista de candidaturas do candidato com vagas incluídas
   * @throws AppError 404 - Candidato não encontrado
   */
  async findByCandidateId(candidateId: string) {
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) throw new AppError('Candidato não encontrado', 404);
    return jobApplicationRepository.findByCandidateId(candidateId);
  }

  /**
   * Submete uma nova candidatura de um candidato a uma vaga.
   *
   * Validações aplicadas (em ordem):
   * 1. Candidato deve existir e não estar deletado
   * 2. Vaga deve existir
   * 3. Vaga deve estar com status OPEN
   * 4. Candidato não pode se candidatar duas vezes à mesma vaga
   *
   * @param data - candidateId e positionId
   * @returns Candidatura criada com candidato e vaga incluídos
   * @throws AppError 404 - Candidato ou vaga não encontrado
   * @throws AppError 400 - Vaga não está aberta
   * @throws AppError 409 - Candidato já se candidatou para esta vaga
   */
  async create(data: CreateJobApplicationDTO) {
    const candidate = await candidateRepository.findById(data.candidateId);
    if (!candidate) throw new AppError('Candidato não encontrado', 404);

    const position = await jobPositionRepository.findById(data.positionId);
    if (!position) throw new AppError('Vaga não encontrada', 404);

    if (position.status !== 'OPEN') throw new AppError('Vaga não está aberta', 400);

    const existing = await jobApplicationRepository.findByCandidateId(data.candidateId);
    const alreadyApplied = existing.some(app => app.positionId === data.positionId);
    if (alreadyApplied) throw new AppError('Candidato já se candidatou para esta vaga', 409);

    return jobApplicationRepository.create(data);
  }

  /**
   * Avança a etapa da candidatura no funil de seleção.
   *
   * Comportamentos automáticos disparados:
   * 1. Cria nota interna de auditoria registrando quem alterou e para qual etapa
   * 2. Se a etapa for HIRED: aciona criação automática do perfil interno do colaborador
   *    via `internalProfileService.createFromHiring()`, vinculando ao departamento da vaga
   *
   * @param id                - UUID da candidatura
   * @param data              - Nova etapa: currentStage
   * @param requestingUserId  - UUID do usuário que está realizando a alteração (para auditoria)
   * @returns Candidatura atualizada
   * @throws AppError 404 - Candidatura não encontrada
   */
  async updateStage(id: string, data: UpdateJobApplicationDTO, requestingUserId: string) {
    const application = await this.findById(id);

    await internalNoteService.createAuditNote(
      id,
      requestingUserId,
      `Etapa alterada para ${data.currentStage}`
    );

    const updated = await jobApplicationRepository.update(id, data);

    if (data.currentStage === 'HIRED') {
      await internalProfileService.createFromHiring(
        application.candidateId,
        application.position.departmentId
      );
    }

    return updated;
  }

  /**
   * Realiza soft delete de uma candidatura.
   * O registro é mantido no banco com `deletedAt` preenchido
   * para preservar o histórico de auditoria.
   *
   * @param id - UUID da candidatura
   * @throws AppError 404 - Candidatura não encontrada
   */
  async delete(id: string) {
    await this.findById(id);
    return jobApplicationRepository.softDelete(id);
  }
}

export default new JobApplicationService();