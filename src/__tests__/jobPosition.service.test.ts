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
  _count: { applications: 0 } 
};

describe('JobPositionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar todas as vagas', async () => {
      mockJobPositionRepository.findAll.mockResolvedValue([mockPosition]);

      const result = await jobPositionService.findAll();

      expect(result).toHaveLength(1);
      expect(mockJobPositionRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllOpen', () => {
    it('deve retornar apenas vagas abertas', async () => {
      mockJobPositionRepository.findAllOpen.mockResolvedValue([mockPosition]);

      const result = await jobPositionService.findAllOpen();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('OPEN');
    });
  });

  describe('findById', () => {
    it('deve retornar vaga quando encontrada', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(mockPosition);

      const result = await jobPositionService.findById('uuid-1');

      expect(result).toEqual(mockPosition);
      expect(mockJobPositionRepository.findById).toHaveBeenCalledWith('uuid-1');
    });

    it('deve lançar erro quando vaga não encontrada', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(null);

      await expect(jobPositionService.findById('uuid-inexistente'))
        .rejects.toThrow('Vaga não encontrada');
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'Desenvolvedor Backend',
      departmentId: 'dept-1',
    };

    it('deve criar vaga com sucesso se o departamento existir', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      mockJobPositionRepository.create.mockResolvedValue(mockPosition);

      const result = await jobPositionService.create(createDto);

      expect(result).toEqual(mockPosition);
      expect(mockDepartmentRepository.findById).toHaveBeenCalledWith('dept-1');
      expect(mockJobPositionRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('deve lançar erro quando departamento não existe', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(null);

      await expect(jobPositionService.create(createDto))
        .rejects.toThrow('Departamento não encontrado');

      expect(mockJobPositionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Senior Backend' };

    it('deve atualizar vaga com sucesso', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(mockPosition);
      mockJobPositionRepository.update.mockResolvedValue({ ...mockPosition, ...updateDto });

      const result = await jobPositionService.update('uuid-1', updateDto);

      expect(result.title).toBe('Senior Backend');
      expect(mockJobPositionRepository.update).toHaveBeenCalledWith('uuid-1', updateDto);
    });

    it('deve lançar erro ao tentar atualizar vaga inexistente', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(null);

      await expect(jobPositionService.update('uuid-inválido', updateDto))
        .rejects.toThrow('Vaga não encontrada');
      
      expect(mockJobPositionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar vaga com sucesso', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(mockPosition);
      mockJobPositionRepository.delete.mockResolvedValue(mockPosition);

      await jobPositionService.delete('uuid-1');

      expect(mockJobPositionRepository.findById).toHaveBeenCalledWith('uuid-1');
      expect(mockJobPositionRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve lançar erro ao tentar deletar vaga inexistente', async () => {
      mockJobPositionRepository.findById.mockResolvedValue(null);

      await expect(jobPositionService.delete('uuid-inválido'))
        .rejects.toThrow('Vaga não encontrada');

      expect(mockJobPositionRepository.delete).not.toHaveBeenCalled();
    });
  });
});