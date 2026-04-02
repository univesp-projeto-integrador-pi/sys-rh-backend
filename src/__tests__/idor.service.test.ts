import internalNoteService from '../services/internalNote.service';
import internalNoteRepository from '../repositories/internalNote.repository';
import jobApplicationRepository from '../repositories/jobApplication.repository';
import userRepository from '../repositories/user.repository';

jest.mock('../repositories/internalNote.repository');
jest.mock('../repositories/jobApplication.repository');
jest.mock('../repositories/user.repository');

const mockInternalNoteRepository = internalNoteRepository as jest.Mocked<typeof internalNoteRepository>;
const mockJobApplicationRepository = jobApplicationRepository as jest.Mocked<typeof jobApplicationRepository>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

const mockAuthor = {
  id: 'author-1',
  name: 'Recrutador A',
  email: 'a@empresa.com',
  password: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockNote = {
  id: 'note-1',
  content: 'Boa candidatura',
  rating: 4,
  applicationId: 'app-1',
  authorId: 'author-1',
  createdAt: new Date(),
  author: mockAuthor,
};

const mockApplication = {
  id: 'app-1',
  candidateId: 'candidate-1',
  positionId: 'position-1',
  currentStage: 'APPLIED' as const,
  appliedAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  candidate: {} as any,
  position: {} as any,
  notes: [],
};

describe('IDOR Protection', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('InternalNote — delete', () => {
    it('deve permitir que o autor delete sua própria nota', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(mockNote);
      mockInternalNoteRepository.delete.mockResolvedValue(mockNote);

      await expect(
        internalNoteService.delete('noteId', 'applicationId', 'requestingUserId')
      ).resolves.not.toThrow();

      expect(mockInternalNoteRepository.delete).toHaveBeenCalledWith('note-1');
    });

    it('deve lançar 403 quando outro usuário tenta deletar a nota', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(mockNote);

      await expect(
        internalNoteService.delete('noteId', 'applicationId', 'requestingUserId')
      ).rejects.toMatchObject({
        message: 'Apenas o autor pode deletar esta nota',
        statusCode: 403,
      });

      expect(mockInternalNoteRepository.delete).not.toHaveBeenCalled();
    });

    it('deve lançar 404 quando nota não existe', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(null);

      await expect(
        internalNoteService.delete('noteId', 'applicationId', 'requestingUserId')
      ).rejects.toMatchObject({
        message: 'Nota não encontrada',
        statusCode: 404,
      });
    });
  });
});