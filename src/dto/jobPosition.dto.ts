import { JobStatus } from "@prisma/client";

export interface CreateJobPositionDTO {
  title: string;
  description?: string;
  departmentId: string;
}

export interface UpdateJobPositionDTO {
  title?: string;
  description?: string;
  status?: JobStatus;
  departmentId?: string;
}

export interface JobPositionResponseDTO {
  id: string;
  title: string;
  description: string | null;
  status: JobStatus;
  createdAt: Date;
  department: {
    id: string;
    name: string;
  };
}