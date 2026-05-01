import internalNoteService from '../services/internalNote.service';
import internalNoteRepository from '../repositories/internalNote.repository';
import jobApplicationRepository from '../repositories/jobApplication.repository';
import userRepository from '../repositories/user.repository';
import * as ownershipUtils from '../utils/ownership'; // Importamos para mocar

jest.mock('../repositories/internalNote.repository');
jest.mock('../repositories/jobApplication.repository');
jest.mock('../repositories/user.repository');
jest.mock('../utils/ownership');

const mockNoteRepo = internalNoteRepository as jest.Mocked<typeof internalNoteRepository>;
const mockAppRepo = jobApplicationRepository as jest.Mocked<typeof jobApplicationRepository>;
const mockUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockAssertOwnership = ownershipUtils.assertOwnership as jest.Mock;

const mockNote = {
  id: 'note-1',
  content: 'Ótimo candidato',
  applicationId: 'app-1',
  authorId: 'user-1'
};

describe('InternalNoteService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve lançar erro se o rating for inválido (ex: 6)', async () => {
      mockAppRepo.findById.mockResolvedValue({ id: 'app-1' } as any);
      mockUserRepo.findById.mockResolvedValue({ id: 'user-1' } as any);

      await expect(internalNoteService.create({
        content: 'Nota',
        rating: 6,
        applicationId: 'app-1',
        authorId: 'user-1'
      })).rejects.toThrow('Rating deve ser entre 1 e 5');
    });

    it('deve criar nota com sucesso', async () => {
      mockAppRepo.findById.mockResolvedValue({ id: 'app-1' } as any);
      mockUserRepo.findById.mockResolvedValue({ id: 'user-1' } as any);
      mockNoteRepo.create.mockResolvedValue(mockNote as any);

      const result = await internalNoteService.create({
        content: 'Ótimo candidato',
        applicationId: 'app-1',
        authorId: 'user-1'
      });

      expect(result).toEqual(mockNote);
      expect(mockNoteRepo.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar nota com sucesso se for o dono e da aplicação correta', async () => {
      mockNoteRepo.findById.mockResolvedValue(mockNote as any);
      mockNoteRepo.delete.mockResolvedValue(mockNote as any);

      await internalNoteService.delete('note-1', 'app-1', 'user-1');

      expect(mockNoteRepo.delete).toHaveBeenCalledWith('note-1');
    });

    it('deve lançar erro se a nota não pertencer à aplicação informada', async () => {
      mockNoteRepo.findById.mockResolvedValue(mockNote as any);

      await expect(internalNoteService.delete('note-1', 'app-errada', 'user-1'))
        .rejects.toThrow('Nota não pertence a esta candidatura');
      
      expect(mockNoteRepo.delete).not.toHaveBeenCalled();
    });

    it('deve lançar erro se assertOwnership falhar', async () => {
      mockNoteRepo.findById.mockResolvedValue(mockNote as any);
      mockAssertOwnership.mockImplementation(() => {
        throw new Error('Apenas o autor pode deletar esta nota');
      });

      await expect(internalNoteService.delete('note-1', 'app-1', 'outro-usuario'))
        .rejects.toThrow('Apenas o autor pode deletar esta nota');
    });
  });

  describe('createAuditNote', () => {
    it('deve criar uma nota de auditoria sem validações extras', async () => {
      mockNoteRepo.create.mockResolvedValue({ id: 'audit-1' } as any);

      const result = await internalNoteService.createAuditNote('app-1', 'system', 'Teste');

      expect(result).toBeDefined();
      expect(mockNoteRepo.create).toHaveBeenCalledWith({
        content: 'Teste',
        applicationId: 'app-1',
        authorId: 'system'
      });
    });
  });
});