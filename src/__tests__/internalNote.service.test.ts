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

const mockUser = {
  id: 'user-1',
  name: 'Recrutador',
  email: 'recrutador@empresa.com',
  hashPassword: 'hashed-password',
  role: 'RECRUITER' as any,   
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCandidate = {
  id: 'candidate-1',
  fullName: 'Maria Souza',
  email: 'maria@email.com',
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  resume: null,         
  internalProfile: null,
};

const mockPosition = {
  id: 'position-1',
  title: 'Dev Backend',
  description: null,
  status: 'OPEN' as const,
  departmentId: 'dept-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  department: { id: 'dept-1', name: 'Tecnologia' },
};

const mockNote = {
  id: 'note-1',
  content: 'Candidato com bom perfil técnico',
  rating: 4,
  applicationId: 'app-1',
  authorId: 'user-1',
  createdAt: new Date(),
  author: mockUser,
};

const mockApplication = {
  id: 'app-1',
  candidateId: 'candidate-1',
  positionId: 'position-1',
  currentStage: 'APPLIED' as const,
  appliedAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  candidate: mockCandidate,
  position: mockPosition,
  notes: [],
};

describe('InternalNoteService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findByApplicationId', () => {
    it('deve retornar notas da candidatura', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(mockApplication);
      mockInternalNoteRepository.findByApplicationId.mockResolvedValue([mockNote]);

      const result = await internalNoteService.findByApplicationId('app-1');

      expect(result).toHaveLength(1);
    });

    it('deve lançar erro quando candidatura não encontrada', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(null);

      await expect(internalNoteService.findByApplicationId('inexistente'))
        .rejects.toThrow('Candidatura não encontrada');
    });
  });

  describe('create', () => {
    it('deve criar nota com sucesso', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(mockApplication);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockInternalNoteRepository.create.mockResolvedValue(mockNote);

      const result = await internalNoteService.create({
        content: 'Candidato com bom perfil técnico',
        rating: 4,
        applicationId: 'app-1',
        authorId: 'user-1',
      });

      expect(result).toEqual(mockNote);
    });

    it('deve lançar erro quando candidatura não encontrada', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(null);

      await expect(internalNoteService.create({
        content: 'Nota',
        applicationId: 'inexistente',
        authorId: 'user-1',
      })).rejects.toThrow('Candidatura não encontrada');
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(mockApplication);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(internalNoteService.create({
        content: 'Nota',
        applicationId: 'app-1',
        authorId: 'inexistente',
      })).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro quando rating inválido', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(mockApplication);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(internalNoteService.create({
        content: 'Nota',
        rating: 6,
        applicationId: 'app-1',
        authorId: 'user-1',
      })).rejects.toThrow('Rating deve ser entre 1 e 5');
    });
  });

  describe('delete', () => {
    it('deve deletar nota com sucesso quando autor é o mesmo', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(mockNote);
      mockInternalNoteRepository.delete.mockResolvedValue(mockNote);

      await internalNoteService.delete('note-1', 'app-1', 'user-1');

      expect(mockInternalNoteRepository.delete).toHaveBeenCalledWith('note-1');
    });

    it('deve lançar erro quando nota não pertence à candidatura', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(mockNote);

      await expect(internalNoteService.delete('note-1', 'app-errada', 'user-1'))
        .rejects.toMatchObject({
          message: 'Nota não pertence a esta candidatura',
          statusCode: 404,
        });

      expect(mockInternalNoteRepository.delete).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando outro usuário tenta deletar a nota', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(mockNote);

      await expect(internalNoteService.delete('note-1', 'app-1', 'outro-usuario'))
        .rejects.toMatchObject({
          message: 'Apenas o autor pode deletar esta nota',
          statusCode: 403,
        });

      expect(mockInternalNoteRepository.delete).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando nota não encontrada', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(null);

      await expect(internalNoteService.delete('nota-inexistente', 'app-1', 'user-1'))
        .rejects.toMatchObject({
          message: 'Nota não encontrada',
          statusCode: 404,
        });
    });
  });
});