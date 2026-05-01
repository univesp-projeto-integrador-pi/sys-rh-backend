import internalNoteService from '../services/internalNote.service';
import internalNoteRepository from '../repositories/internalNote.repository';
import userRepository from '../repositories/user.repository';
import userService from '../services/user.service';
import resumeService from '../services/resume.service';
import candidateRepository from '../repositories/candidate.repository';
import { UserRole } from '@prisma/client';

jest.mock('../repositories/internalNote.repository');
jest.mock('../repositories/jobApplication.repository');
jest.mock('../repositories/user.repository');
jest.mock('../repositories/candidate.repository');
jest.mock('../repositories/resume.repository');

const mockInternalNoteRepository = internalNoteRepository as jest.Mocked<typeof internalNoteRepository>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockCandidateRepository = candidateRepository as jest.Mocked<typeof candidateRepository>;

const mockFullUser = {
  id: 'user-1',
  name: 'Usuário Teste',
  email: 'teste@empresa.com',
  hashPassword: 'hashed_password_dummy',
  role: UserRole.RECRUITER,
  createdAt: new Date(),
  updatedAt: new Date(),
  internalProfile: null
};

const mockNote = {
  id: 'note-1',
  content: 'Boa candidatura',
  rating: 4,
  applicationId: 'app-1',
  authorId: 'user-1',
  createdAt: new Date(),
  author: mockFullUser,
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
      } as any);

      await expect(
        internalNoteService.delete('note-1', 'app-errada', 'user-1')
      ).rejects.toMatchObject({
        message: 'Nota não pertence a esta candidatura',
        statusCode: 404,
      });

      expect(mockInternalNoteRepository.delete).not.toHaveBeenCalled();
    });

    it('deve deletar nota quando applicationId bate com o da nota', async () => {
      mockInternalNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockInternalNoteRepository.delete.mockResolvedValue(mockNote as any);

      await expect(
        internalNoteService.delete('note-1', 'app-1', 'user-1')
      ).resolves.not.toThrow();
    });
  });

  describe('Fix 5 — soft delete verificado no resume.service', () => {
    it('deve lançar 404 quando candidato está deletado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockDeletedCandidate as any);

      await expect(
        resumeService.findByCandidateId('candidate-1')
      ).rejects.toMatchObject({
        message: 'Candidato não encontrado',
        statusCode: 404,
      });
    });
  });

  describe('Fix 10 — proteção contra remoção do único ADMIN', () => {
    it('deve lançar erro ao tentar remover o único ADMIN', async () => {
      mockUserRepository.findById.mockResolvedValue({
        ...mockFullUser,
        id: 'admin-1',
        role: UserRole.ADMIN,
      } as any);
      
      mockUserRepository.countByRole.mockResolvedValue(1);

      await expect(userService.delete('admin-1')).rejects.toMatchObject({
        message: 'Não é possível remover o único administrador do sistema',
        statusCode: 400,
      });
    });

    it('deve permitir remover ADMIN quando há mais de um', async () => {
      mockUserRepository.findById.mockResolvedValue({
        ...mockFullUser,
        id: 'admin-1',
        role: UserRole.ADMIN,
      } as any);

      mockUserRepository.countByRole.mockResolvedValue(2);
      mockUserRepository.delete.mockResolvedValue(mockFullUser as any);

      await expect(userService.delete('admin-1')).resolves.not.toThrow();
      expect(mockUserRepository.delete).toHaveBeenCalledWith('admin-1');
    });

    it('deve permitir remover usuário RECRUITER sem restrição', async () => {
      mockUserRepository.findById.mockResolvedValue({
        ...mockFullUser,
        id: 'recruiter-1',
        role: UserRole.RECRUITER,
      } as any);

      mockUserRepository.delete.mockResolvedValue(mockFullUser as any);

      await expect(userService.delete('recruiter-1')).resolves.not.toThrow();
    });
  });
});