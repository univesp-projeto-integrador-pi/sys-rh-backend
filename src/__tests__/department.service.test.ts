import departmentService from '../services/department.service';
import departmentRepository from '../repositories/department.repository';

jest.mock('../repositories/department.repository');

const mockDepartmentRepository = departmentRepository as jest.Mocked<typeof departmentRepository>;

const mockDepartment = {
  id: 'uuid-1',
  name: 'Tecnologia',
};

describe('DepartmentService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('deve retornar lista de departamentos', async () => {
      mockDepartmentRepository.findAll.mockResolvedValue([mockDepartment]);

      const result = await departmentService.findAll();

      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('deve retornar departamento quando encontrado', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);

      const result = await departmentService.findById('uuid-1');

      expect(result).toEqual(mockDepartment);
    });

    it('deve lançar erro quando departamento não encontrado', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(null);

      await expect(departmentService.findById('uuid-inexistente'))
        .rejects.toThrow('Departamento não encontrado');
    });
  });

  describe('create', () => {
    it('deve criar departamento com sucesso', async () => {
      mockDepartmentRepository.findByName.mockResolvedValue(null);
      mockDepartmentRepository.create.mockResolvedValue(mockDepartment);

      const result = await departmentService.create({ name: 'Tecnologia' });

      expect(result).toEqual(mockDepartment);
    });

    it('deve lançar erro quando departamento já cadastrado', async () => {
      mockDepartmentRepository.findByName.mockResolvedValue(mockDepartment);

      await expect(departmentService.create({ name: 'Tecnologia' }))
        .rejects.toThrow('Departamento já cadastrado');

      expect(mockDepartmentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar departamento com sucesso', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      mockDepartmentRepository.delete.mockResolvedValue(mockDepartment);

      await departmentService.delete('uuid-1');

      expect(mockDepartmentRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve lançar erro quando departamento não encontrado', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(null);

      await expect(departmentService.delete('uuid-inexistente'))
        .rejects.toThrow('Departamento não encontrado');
    });
  });
});