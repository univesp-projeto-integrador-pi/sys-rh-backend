import jobApplicationService from '../services/jobApplication.service';
import jobApplicationRepository from '../repositories/jobApplication.repository';
import candidateRepository from '../repositories/candidate.repository';
import jobPositionRepository from '../repositories/jobPosition.repository';

jest.mock('../repositories/jobApplication.repository');
jest.mock('../repositories/candidate.repository');
jest.mock('../repositories/jobPosition.repository');

const mockJobApplicationRepo = jobApplicationRepository as jest.Mocked<typeof jobApplicationRepository>;
const mockCandidateRepo = candidateRepository as jest.Mocked<typeof candidateRepository>;
const mockJobPositionRepo = jobPositionRepository as jest.Mocked<typeof jobPositionRepository>;

const mockCandidate = { id: 'cand-1', email: 'maria@email.com', fullName: 'Maria' };
const mockPosition = { id: 'pos-1', title: 'Dev', status: 'OPEN' as const };
const mockApplication = { id: 'app-1', candidateId: 'cand-1', positionId: 'pos-1', currentStage: 'APPLIED' as const };

describe('JobApplicationService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve criar candidatura com sucesso', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(mockCandidate as any);
      mockJobPositionRepo.findById.mockResolvedValue(mockPosition as any);
      mockJobApplicationRepo.checkExistingApplication.mockResolvedValue(null);
      mockJobApplicationRepo.create.mockResolvedValue(mockApplication as any);

      const result = await jobApplicationService.create('pos-1', 'maria@email.com');

      expect(result).toEqual(mockApplication);
      expect(mockJobApplicationRepo.create).toHaveBeenCalled();
    });

    it('deve lançar erro quando candidato não encontrado', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(null);

      await expect(jobApplicationService.create('pos-1', 'err@email.com'))
        .rejects.toThrow('Perfil de candidato não encontrado.');
    });

    it('deve lançar erro quando vaga está fechada', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(mockCandidate as any);
      mockJobPositionRepo.findById.mockResolvedValue({ ...mockPosition, status: 'CLOSED' } as any);

      await expect(jobApplicationService.create('pos-1', 'maria@email.com'))
        .rejects.toThrow('Vaga indisponível.');
    });

    it('deve lançar erro quando o candidato já está inscrito', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(mockCandidate as any);
      mockJobPositionRepo.findById.mockResolvedValue(mockPosition as any);
      mockJobApplicationRepo.checkExistingApplication.mockResolvedValue(mockApplication as any);

      await expect(jobApplicationService.create('pos-1', 'maria@email.com'))
        .rejects.toThrow('Você já se candidatou para esta vaga');
    });
  });

  describe('delete', () => {
    it('deve realizar a exclusão lógica com sucesso', async () => {
      mockJobApplicationRepo.findById.mockResolvedValue(mockApplication as any);
      mockJobApplicationRepo.delete.mockResolvedValue({ ...mockApplication, deletedAt: new Date() } as any);

      await jobApplicationService.delete('app-1');

      expect(mockJobApplicationRepo.delete).toHaveBeenCalledWith('app-1');
    });

    it('deve lançar erro se a candidatura não existir', async () => {
      mockJobApplicationRepo.findById.mockResolvedValue(null);

      await expect(jobApplicationService.delete('app-invalid'))
        .rejects.toThrow('Candidatura não encontrada');
    });
  });
});