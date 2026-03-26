import jobPositionService from '../services/jobPosition.service';
import jobPositionRepository from '../repositories/jobPosition.repository';
import departmentRepository from '../repositories/department.repository';

jest.mock('../repositories/jobPosition.repository');
jest.mock('../repositories/department.repository');

const mockJobPositionRepository = jobPositionRepository as jest.Mocked<typeof jobPositionRepository>;
const mockDepartmentRepository = departmentRepository as jest.Mocked<typeof departmentRepository>;

const mockDepartment = { id: 'dept-1', name: 'Tecnologia' };

const mockPosition = {
  id: 'uuid-1',
  title: 'Desenvolvedor Backend',
  description: 'Vaga para dev backend',
  status: 'OPEN' as const,
  departmentId: 'dept-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  department: mockDepartment,
};

describe('JobPositionService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findAllOpen', () => {
    it('deve retornar apenas vagas abertas', async () => {
      mockJobPositionRepository.findAllOpen.mockResolvedValue([mockPosition]);

      const result = await jobPositionService.findAllOpen();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('OPEN');
    });
  });

  describe('create', () => {
    it('deve criar vaga com sucesso', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      mockJobPositionRepository.create.mockResolvedValue(mockPosition);

      const result = await jobPositionService.create({
        title: 'Desenvolvedor Backend',
        departmentId: 'dept-1',
      });

      expect(result).toEqual(mockPosition);
    });

    it('deve lançar erro quando departamento não existe', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(null);

      await expect(jobPositionService.create({
        title: 'Desenvolvedor Backend',
        departmentId: 'dept-inexistente',
      })).rejects.toThrow('Departamento não encontrado');

      expect(mockJobPositionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('deve retornar vaga quando encontrada', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(mockPosition);

      const result = await jobPositionService.findById('uuid-1');

      expect(result).toEqual(mockPosition);
    });

    it('deve lançar erro quando vaga não encontrada', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(null);

      await expect(jobPositionService.findById('uuid-inexistente'))
        .rejects.toThrow('Vaga não encontrada');
    });
  });

  describe('delete', () => {
    it('deve deletar vaga com sucesso', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(mockPosition);
      mockJobPositionRepository.delete.mockResolvedValue(mockPosition);

      await jobPositionService.delete('uuid-1');

      expect(mockJobPositionRepository.delete).toHaveBeenCalledWith('uuid-1');
    });
  });
});