import internalNoteService from '../services/internalNote.service';
import internalNoteRepository from '../repositories/internalNote.repository';
import userRepository from '../repositories/user.repository';
import userService from '../services/user.service';
import resumeService from '../services/resume.service';
import candidateRepository from '../repositories/candidate.repository';

jest.mock('../repositories/internalNote.repository');
jest.mock('../repositories/jobApplication.repository');
jest.mock('../repositories/user.repository');
jest.mock('../repositories/candidate.repository');
jest.mock('../repositories/resume.repository');

const mockInternalNoteRepository = internalNoteRepository as jest.Mocked<typeof internalNoteRepository>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockCandidateRepository = candidateRepository as jest.Mocked<typeof candidateRepository>;

const mockNote = {
  id: 'note-1',
  content: 'Boa candidatura',
  rating: 4,
  applicationId: 'app-1',
  authorId: 'author-1',
  createdAt: new Date(),
  author: {} as any,
};

const mockCandidate = {
  id: 'candidate-1',
  fullName: 'Maria',
  email: 'maria@email.com',
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  resume: null,
  internalProfile: null,
};

const mockDeletedCandidate = { ...mockCandidate, deletedAt: new Date() };

describe('Correções de bugs', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Fix 1 — applicationId validado no delete de nota', () => {
    it('deve lançar 404 quando nota não pertence à candidatura informada', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue({
        ...mockNote,
        applicationId: 'app-correta',
      });

      await expect(
        internalNoteService.delete('note-1', 'app-errada', 'author-1')
      ).rejects.toMatchObject({
        message: 'Nota não pertence a esta candidatura',
        statusCode: 404,
      });

      expect(mockInternalNoteRepository.delete).not.toHaveBeenCalled();
    });

    it('deve deletar nota quando applicationId bate com o da nota', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(mockNote);
      mockInternalNoteRepository.delete.mockResolvedValue(mockNote);

      await expect(
        internalNoteService.delete('note-1', 'app-1', 'author-1')
      ).resolves.not.toThrow();
    });
  });

  describe('Fix 5 — soft delete verificado no resume.service', () => {
    it('deve lançar 404 quando candidato está deletado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockDeletedCandidate);

      await expect(
        resumeService.findByCandidateId('candidate-1')
      ).rejects.toMatchObject({
        message: 'Candidato não encontrado',
        statusCode: 404,
      });
    });

    it('deve lançar 404 ao criar currículo de candidato deletado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockDeletedCandidate);

      await expect(
        resumeService.create('candidate-1', {
          skillIds: [],
          experiences: [],
          educations: [],
        })
      ).rejects.toMatchObject({
        message: 'Candidato não encontrado',
        statusCode: 404,
      });
    });
  });

  describe('Fix 10 — proteção contra remoção do único ADMIN', () => {
    it('deve lançar erro ao tentar remover o único ADMIN', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@empresa.com',
        //password: 'hash',
        role: 'ADMIN' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserRepository.countByRole.mockResolvedValue(1);

      await expect(userService.delete('admin-1')).rejects.toMatchObject({
        message: 'Não é possível remover o único administrador do sistema',
        statusCode: 400,
      });

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('deve permitir remover ADMIN quando há mais de um', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@empresa.com',
        //password: 'hash',
        role: 'ADMIN' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserRepository.countByRole.mockResolvedValue(2);
      mockUserRepository.delete.mockResolvedValue({} as any);

      await expect(userService.delete('admin-1')).resolves.not.toThrow();
      expect(mockUserRepository.delete).toHaveBeenCalledWith('admin-1');
    });

    it('deve permitir remover usuário RECRUITER sem restrição', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'recruiter-1',
        name: 'Recruiter',
        email: 'recruiter@empresa.com',
        //password: 'hash',
        role: 'RECRUITER' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserRepository.delete.mockResolvedValue({} as any);

      await expect(userService.delete('recruiter-1')).resolves.not.toThrow();
      expect(mockUserRepository.countByRole).not.toHaveBeenCalled();
    });
  });
});