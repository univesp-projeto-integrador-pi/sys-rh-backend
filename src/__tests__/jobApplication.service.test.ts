import jobApplicationService from '../services/jobApplication.service';
import jobApplicationRepository from '../repositories/jobApplication.repository';
import candidateRepository from '../repositories/candidate.repository';
import jobPositionRepository from '../repositories/jobPosition.repository';

jest.mock('../repositories/jobApplication.repository');
jest.mock('../repositories/candidate.repository');
jest.mock('../repositories/jobPosition.repository');

const mockJobApplicationRepository = jobApplicationRepository as jest.Mocked<typeof jobApplicationRepository>;
const mockCandidateRepository = candidateRepository as jest.Mocked<typeof candidateRepository>;
const mockJobPositionRepository = jobPositionRepository as jest.Mocked<typeof jobPositionRepository>;

const mockDepartment = { id: 'dept-1', name: 'Tecnologia' };

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
  department: mockDepartment,
};

const mockApplication = {
  id: 'uuid-1',
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

describe('JobApplicationService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve criar candidatura com sucesso', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockJobPositionRepository.findById.mockResolvedValue(mockPosition);
      mockJobApplicationRepository.findByCandidateId.mockResolvedValue([]);
      mockJobApplicationRepository.create.mockResolvedValue(mockApplication);

      const result = await jobApplicationService.create({
        candidateId: 'candidate-1',
        positionId: 'position-1',
      });

      expect(result).toEqual(mockApplication);
    });

    it('deve lançar erro quando candidato não encontrado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(null);

      await expect(jobApplicationService.create({
        candidateId: 'inexistente',
        positionId: 'position-1',
      })).rejects.toThrow('Candidato não encontrado');
    });

    it('deve lançar erro quando vaga não encontrada', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockJobPositionRepository.findById.mockResolvedValue(null);

      await expect(jobApplicationService.create({
        candidateId: 'candidate-1',
        positionId: 'inexistente',
      })).rejects.toThrow('Vaga não encontrada');
    });

    it('deve lançar erro quando vaga não está aberta', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockJobPositionRepository.findById.mockResolvedValue({
        ...mockPosition,
        status: 'CLOSED' as const,
      });

      await expect(jobApplicationService.create({
        candidateId: 'candidate-1',
        positionId: 'position-1',
      })).rejects.toThrow('Vaga não está aberta');
    });

    it('deve lançar erro quando candidato já se candidatou para a vaga', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockJobPositionRepository.findById.mockResolvedValue(mockPosition);
      mockJobApplicationRepository.findByCandidateId.mockResolvedValue([mockApplication]);

      await expect(jobApplicationService.create({
        candidateId: 'candidate-1',
        positionId: 'position-1',
      })).rejects.toThrow('Candidato já se candidatou para esta vaga');
    });
  });

  describe('updateStage', () => {
    it('deve atualizar etapa com sucesso', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(mockApplication);
      mockJobApplicationRepository.update.mockResolvedValue({
        ...mockApplication,
        currentStage: 'SCREENING' as const,
      });

      const result = await jobApplicationService.updateStage('uuid-1', {
        currentStage: 'SCREENING',
      });

      expect(result.currentStage).toBe('SCREENING');
    });

    it('deve lançar erro quando candidatura não encontrada', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(null);

      await expect(jobApplicationService.updateStage('inexistente', {
        currentStage: 'SCREENING',
      })).rejects.toThrow('Candidatura não encontrada');
    });
  });

  describe('delete (soft delete)', () => {
    it('deve fazer soft delete com sucesso', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(mockApplication);
      mockJobApplicationRepository.softDelete.mockResolvedValue({
        ...mockApplication,
        deletedAt: new Date(),
      });

      await jobApplicationService.delete('uuid-1');

      expect(mockJobApplicationRepository.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve lançar erro quando candidatura não encontrada', async () => {
      mockJobApplicationRepository.findById.mockResolvedValue(null);

      await expect(jobApplicationService.delete('uuid-inexistente'))
        .rejects.toThrow('Candidatura não encontrada');
    });
  });
});