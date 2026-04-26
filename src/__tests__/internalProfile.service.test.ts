import internalProfileService from '../services/internalProfile.service';
import internalProfileRepository from '../repositories/internalProfile.repository';
import candidateRepository from '../repositories/candidate.repository';
import departmentRepository from '../repositories/department.repository';

jest.mock('../repositories/internalProfile.repository');
jest.mock('../repositories/candidate.repository');
jest.mock('../repositories/department.repository');

const mockInternalProfileRepository = internalProfileRepository as jest.Mocked<typeof internalProfileRepository>;
const mockCandidateRepository = candidateRepository as jest.Mocked<typeof candidateRepository>;
const mockDepartmentRepository = departmentRepository as jest.Mocked<typeof departmentRepository>;

const mockDepartment = { id: 'dept-1', name: 'Tecnologia' };

const mockCandidate = {
  id: 'candidate-1', fullName: 'Maria', email: 'maria@email.com',
  phone: null, createdAt: new Date(), updatedAt: new Date(),
  deletedAt: null, resume: null, internalProfile: null,
};

const mockProfile = {
  id: 'profile-1',
  employeeCode: 'EMP-001',
  currentJobTitle: 'Dev Backend',
  status: 'ACTIVE' as const,
  terminatedAt: null,
  terminationReason: null,
  terminationNotes: null,
  candidateId: 'candidate-1',
  departmentId: 'dept-1',
  userId: 'user-1',
  managerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  candidate: mockCandidate,
  department: mockDepartment,
  manager: null,
  subordinates: [],
};

describe('InternalProfileService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve criar perfil interno com sucesso', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      mockInternalProfileRepository.findByCandidateId.mockResolvedValue(null);
      mockInternalProfileRepository.findByEmployeeCode.mockResolvedValue(null);
      mockInternalProfileRepository.create.mockResolvedValue(mockProfile);

      const result = await internalProfileService.create({
        candidateId:     'candidate-1',
        departmentId:    'dept-1',
        employeeCode:    'EMP-001',
        currentJobTitle: 'Dev Backend',
      });

      expect(result).toEqual(mockProfile);
    });

    it('deve lançar erro quando candidato não encontrado', async () => {
      mockCandidateRepository.findById.mockResolvedValue(null);

      await expect(internalProfileService.create({
        candidateId: 'inexistente', departmentId: 'dept-1',
        employeeCode: 'EMP-001', currentJobTitle: 'Dev',
      })).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve lançar erro quando candidato já possui perfil interno', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      mockInternalProfileRepository.findByCandidateId.mockResolvedValue(mockProfile);

      await expect(internalProfileService.create({
        candidateId: 'candidate-1', departmentId: 'dept-1',
        employeeCode: 'EMP-001', currentJobTitle: 'Dev',
      })).rejects.toMatchObject({ message: 'Candidato já possui perfil interno', statusCode: 409 });
    });

    it('deve lançar erro quando código de colaborador já existe', async () => {
      mockCandidateRepository.findById.mockResolvedValue(mockCandidate);
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      mockInternalProfileRepository.findByCandidateId.mockResolvedValue(null);
      mockInternalProfileRepository.findByEmployeeCode.mockResolvedValue(mockProfile);

      await expect(internalProfileService.create({
        candidateId: 'candidate-1', departmentId: 'dept-1',
        employeeCode: 'EMP-001', currentJobTitle: 'Dev',
      })).rejects.toMatchObject({ message: 'Código de colaborador já em uso', statusCode: 409 });
    });
  });

  describe('terminate', () => {
    it('deve desligar colaborador com sucesso e fazer soft delete no candidato', async () => {
      mockInternalProfileRepository.findById.mockResolvedValue(mockProfile);
      mockCandidateRepository.softDelete.mockResolvedValue({} as any);
      mockInternalProfileRepository.terminate.mockResolvedValue({
        ...mockProfile,
        status: 'TERMINATED' as const,
        terminatedAt: new Date(),
        terminationReason: 'RESIGNATION' as const,
      });

      const result = await internalProfileService.terminate('profile-1', {
        terminationReason: 'RESIGNATION',
      });

      expect(result.status).toBe('TERMINATED');
      expect(mockCandidateRepository.softDelete).toHaveBeenCalledWith('candidate-1');
      expect(mockInternalProfileRepository.terminate).toHaveBeenCalledWith(
        'profile-1', 'RESIGNATION', undefined
      );
    });

    it('deve lançar erro quando colaborador já foi desligado', async () => {
      mockInternalProfileRepository.findById.mockResolvedValue({
        ...mockProfile,
        status: 'TERMINATED' as const,
      });

      await expect(internalProfileService.terminate('profile-1', {
        terminationReason: 'RESIGNATION',
      })).rejects.toMatchObject({ message: 'Colaborador já foi desligado', statusCode: 400 });
    });

    it('deve lançar erro quando perfil não encontrado', async () => {
      mockInternalProfileRepository.findById.mockResolvedValue(null);

      await expect(internalProfileService.terminate('inexistente', {
        terminationReason: 'RESIGNATION',
      })).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('update', () => {
    it('deve atualizar perfil com sucesso', async () => {
      mockInternalProfileRepository.findById.mockResolvedValue(mockProfile);
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      mockInternalProfileRepository.update.mockResolvedValue({
        ...mockProfile,
        currentJobTitle: 'Tech Lead',
      });

      const result = await internalProfileService.update('profile-1', {
        currentJobTitle: 'Tech Lead',
      });

      expect(result.currentJobTitle).toBe('Tech Lead');
    });

    it('deve lançar erro quando gestor é o próprio colaborador', async () => {
      mockInternalProfileRepository.findById.mockResolvedValue(mockProfile);
      mockInternalProfileRepository.findById.mockResolvedValueOnce(mockProfile);

      await expect(internalProfileService.update('profile-1', {
        managerId: 'profile-1',
      })).rejects.toMatchObject({
        message: 'Colaborador não pode ser seu próprio gestor',
        statusCode: 400,
      });
    });
  });

  describe('createFromHiring', () => {
    it('deve criar perfil automaticamente ao contratar', async () => {
      mockInternalProfileRepository.findByCandidateId.mockResolvedValue(null);
      mockInternalProfileRepository.create.mockResolvedValue(mockProfile);

      await internalProfileService.createFromHiring('candidate-1', 'dept-1');

      expect(mockInternalProfileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          candidateId:     'candidate-1',
          departmentId:    'dept-1',
          currentJobTitle: 'A definir',
        })
      );
    });

    it('não deve criar perfil duplicado se já existir', async () => {
      mockInternalProfileRepository.findByCandidateId.mockResolvedValue(mockProfile);

      await internalProfileService.createFromHiring('candidate-1', 'dept-1');

      expect(mockInternalProfileRepository.create).not.toHaveBeenCalled();
    });
  });
});