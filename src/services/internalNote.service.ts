import { CreateInternalNoteDTO } from '../dto/internalNote.dto';
import internalNoteRepository from '../repositories/internalNote.repository';
import jobApplicationRepository from '../repositories/jobApplication.repository';
import userRepository from '../repositories/user.repository';

class InternalNoteService {
  async findByApplicationId(applicationId: string) {
    const application = await jobApplicationRepository.findById(applicationId);
    if (!application) throw new Error('Candidatura não encontrada');
    return internalNoteRepository.findByApplicationId(applicationId);
  }

  async create(data: CreateInternalNoteDTO) {
    const application = await jobApplicationRepository.findById(data.applicationId);
    if (!application) throw new Error('Candidatura não encontrada');

    const author = await userRepository.findById(data.authorId);
    if (!author) throw new Error('Usuário não encontrado');

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating deve ser entre 1 e 5');
    }

    return internalNoteRepository.create(data);
  }

  async delete(id: string) {
    return internalNoteRepository.delete(id);
  }
}

export default new InternalNoteService();