import candidateService from '../services/candidate.service';
import candidateRepository from '../repositories/candidate.repository';

jest.mock('../repositories/candidate.repository');

const mockCandidateRepository = candidateRepository as jest.Mocked<typeof candidateRepository>;

const mockCandidate = {
  id: 'uuid-1',
  fullName: 'Maria Souza',
  email: 'maria@email.com',
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  resume: null,          
  internalProfile: null,
};

describe('CandidateService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('deve retornar lista de candidatos', async () => {
      mockCandidateRepository.findAll.mockResolvedValue([mockCandidate]);

      const result = await candidateService.findAll();

      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('deve retornar candidato quando encontrado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);

      const result = await candidateService.findById('uuid-1');

      expect(result).toEqual(mockCandidate);
    });

    it('deve lançar erro quando candidato não encontrado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(null);

      await expect(candidateService.findById('uuid-inexistente'))
        .rejects.toThrow('Candidato não encontrado');
    });
  });

  describe('create', () => {
    it('deve criar candidato com sucesso', async () => {
      mockCandidateRepository.findByEmail.mockResolvedValue(null);
      mockCandidateRepository.create.mockResolvedValue(mockCandidate);

      const result = await candidateService.create({
        fullName: 'Maria Souza',
        email: 'maria@email.com',
      });

      expect(result).toEqual(mockCandidate);
    });

    it('deve lançar erro quando email já cadastrado', async () => {
      mockCandidateRepository.findByEmail.mockResolvedValue(mockCandidate);

      await expect(candidateService.create({
        fullName: 'Maria Souza',
        email: 'maria@email.com',
      })).rejects.toThrow('Email já cadastrado');

      expect(mockCandidateRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar candidato com sucesso', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockCandidateRepository.update.mockResolvedValue({
        ...mockCandidate,
        fullName: 'Maria Atualizada',
      });

      const result = await candidateService.update('uuid-1', { fullName: 'Maria Atualizada', email: 'maria@email.com'});

      expect(result.fullName).toBe('Maria Atualizada');
    });

    it('deve lançar erro quando candidato não encontrado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(null);

      await expect(candidateService.update('uuid-inexistente', { fullName: 'Maria', email: 'maria@email.com' }))
        .rejects.toThrow('Candidato não encontrado');
    });
  });

  describe('delete (soft delete)', () => {
    it('deve fazer soft delete com sucesso', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockCandidateRepository.softDelete.mockResolvedValue({
        ...mockCandidate,
        deletedAt: new Date(),
      });

      await candidateService.delete('uuid-1');

      expect(mockCandidateRepository.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve lançar erro quando candidato não encontrado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(null);

      await expect(candidateService.delete('uuid-inexistente'))
        .rejects.toThrow('Candidato não encontrado');
    });
  });
});