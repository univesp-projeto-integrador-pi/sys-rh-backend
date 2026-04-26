import internalNoteRepository from '../repositories/internalNote.repository';
import jobApplicationRepository from '../repositories/jobApplication.repository';
import userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { assertOwnership } from '../utils/ownership';
import { CreateInternalNoteDTO } from '../dto/internalNote.dto';

/**
 * @service InternalNoteService
 * @description Gerencia as notas internas dos recrutadores sobre candidaturas.
 *
 * Responsabilidades:
 * - Criar notas de avaliação vinculadas a candidaturas
 * - Criar notas de auditoria automáticas a cada mudança de etapa
 * - Listar notas de uma candidatura específica
 * - Deletar notas com controle de propriedade (IDOR protection)
 *
 * Regras de negócio:
 * - Apenas RECRUITER e ADMIN podem criar e visualizar notas
 * - Somente o autor da nota pode deletá-la
 * - Notas de auditoria são criadas automaticamente pelo JobApplicationService
 *   sempre que uma candidatura avança de etapa — não devem ser criadas manualmente
 * - Rating é opcional, mas quando informado deve estar entre 1 e 5
 * - Uma nota pertence a uma candidatura específica — não pode ser deletada
 *   passando o ID de outra candidatura (proteção contra IDOR)
 *
 * Integração:
 * - `JobApplicationService.updateStage()` chama `createAuditNote()` automaticamente
 *   registrando quem alterou a etapa e para qual valor
 */
class InternalNoteService {
  /**
   * Retorna todas as notas de uma candidatura específica.
   * Inclui o autor de cada nota no retorno.
   *
   * @param applicationId - UUID da candidatura
   * @returns Lista de notas com autor incluído
   * @throws AppError 404 - Candidatura não encontrada
   */
  async findByApplicationId(applicationId: string) {
    const application = await jobApplicationRepository.findById(applicationId);
    if (!application) throw new AppError('Candidatura não encontrada', 404);
    return internalNoteRepository.findByApplicationId(applicationId);
  }

  /**
   * Cria uma nova nota interna em uma candidatura.
   *
   * Validações aplicadas:
   * - Candidatura deve existir
   * - Autor (usuário) deve existir no sistema
   * - Rating, quando informado, deve estar entre 1 e 5
   *
   * @param data - content, applicationId, authorId e rating (opcional)
   * @returns Nota criada com autor incluído
   * @throws AppError 404 - Candidatura não encontrada
   * @throws AppError 404 - Usuário não encontrado
   * @throws AppError 400 - Rating inválido (fora do intervalo 1-5)
   */
  async create(data: CreateInternalNoteDTO) {
    const application = await jobApplicationRepository.findById(data.applicationId);
    if (!application) throw new AppError('Candidatura não encontrada', 404);

    const author = await userRepository.findById(data.authorId);
    if (!author) throw new AppError('Usuário não encontrado', 404);

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new AppError('Rating deve ser entre 1 e 5', 400);
    }

    return internalNoteRepository.create(data);
  }

  /**
   * Remove uma nota interna com validação de propriedade e pertencimento.
   *
   * Validações aplicadas (em ordem):
   * 1. Nota deve existir
   * 2. Nota deve pertencer à candidatura informada (proteção IDOR)
   * 3. Apenas o autor da nota pode deletá-la (proteção IDOR)
   *
   * @param noteId           - UUID da nota a ser deletada
   * @param applicationId    - UUID da candidatura dona da nota
   * @param requestingUserId - UUID do usuário que está solicitando a remoção
   * @throws AppError 404 - Nota não encontrada
   * @throws AppError 404 - Nota não pertence a esta candidatura
   * @throws AppError 403 - Apenas o autor pode deletar esta nota
   */
  async delete(noteId: string, applicationId: string, requestingUserId: string) {
    const note = await internalNoteRepository.findById(noteId);
    if (!note) throw new AppError('Nota não encontrada', 404);

    if (note.applicationId !== applicationId) {
      throw new AppError('Nota não pertence a esta candidatura', 404);
    }

    assertOwnership(note.authorId, requestingUserId, 'Apenas o autor pode deletar esta nota');
    return internalNoteRepository.delete(noteId);
  }

  /**
   * Cria uma nota de auditoria automática sem validações extras.
   * Chamado internamente pelo JobApplicationService toda vez que
   * uma candidatura muda de etapa, registrando o histórico de movimentações.
   *
   * Não deve ser chamado diretamente por controllers ou outros services —
   * use `create()` para notas manuais de recrutadores.
   *
   * @param applicationId - UUID da candidatura
   * @param authorId      - UUID do usuário que realizou a ação
   * @param content       - Descrição da mudança (ex: "Etapa alterada para SCREENING")
   * @returns Nota de auditoria criada
   */
  async createAuditNote(applicationId: string, authorId: string, content: string) {
    return internalNoteRepository.create({
      content,
      applicationId,
      authorId,
    });
  }
}

export default new InternalNoteService();