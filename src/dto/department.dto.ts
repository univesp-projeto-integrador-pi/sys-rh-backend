
export interface CreateDepartmentDTO {
  name: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
}

export interface DepartmentResponseDTO {
  id: string;
  name: string;
}