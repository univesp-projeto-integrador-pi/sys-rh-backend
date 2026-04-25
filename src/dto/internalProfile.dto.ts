import { TerminationReason, EmploymentStatus } from "@prisma/client";

export interface CreateInternalProfileDTO {
  candidateId:     string;
  departmentId:    string;
  employeeCode:    string;
  currentJobTitle: string;
  managerId?:      string;
}

export interface UpdateInternalProfileDTO {
  departmentId?:    string;
  currentJobTitle?: string;
  managerId?:       string;
}

export interface TerminateEmployeeDTO {
  terminationReason:  TerminationReason;
  terminationNotes?:  string;
}

export interface InternalProfileResponseDTO {
  id:               string;
  employeeCode:     string;
  currentJobTitle:  string;
  status:           EmploymentStatus;
  terminatedAt:     Date | null;
  terminationReason: TerminationReason | null;
  terminationNotes: string | null;
  createdAt:        Date;
  candidate: {
    id:       string;
    fullName: string;
    email:    string;
  };
  department: {
    id:   string;
    name: string;
  };
  manager: {
    id:              string;
    employeeCode:    string;
    currentJobTitle: string;
  } | null;
}