import internalNoteRepository from '../repositories/internalNote.repository';
import jobApplicationRepository from '../repositories/jobApplication.repository';
import userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { assertOwnership } from '../utils/ownership';
import { CreateInternalNoteDTO } from '../dto/internalNote.dto';

class InternalNoteService {
  async findByApplicationId(applicationId: string) {
    const application = await jobApplicationRepository.findById(applicationId);
    if (!application) throw new AppError('Candidatura não encontrada', 404);
    return internalNoteRepository.findByApplicationId(applicationId);
  }

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

  // ← applicationId adicionado como parâmetro
  async delete(noteId: string, applicationId: string, requestingUserId: string) {
    const note = await internalNoteRepository.findById(noteId);
    if (!note) throw new AppError('Nota não encontrada', 404);

    // garante que a nota pertence à candidatura informada
    if (note.applicationId !== applicationId) {
      throw new AppError('Nota não pertence a esta candidatura', 404);
    }

    assertOwnership(note.authorId, requestingUserId, 'Apenas o autor pode deletar esta nota');
    return internalNoteRepository.delete(noteId);
  }

  async createAuditNote(applicationId: string, authorId: string, content: string) {
    return internalNoteRepository.create({
      content,
      applicationId,
      authorId,
    });
  }
}

export default new InternalNoteService();