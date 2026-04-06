import { ApplicationStage } from "@prisma/client";

export interface CreateJobApplicationDTO {
  candidateId: string;
  positionId: string;
}

export interface UpdateJobApplicationDTO {
  currentStage: ApplicationStage;
}

export interface JobApplicationResponseDTO {
  id: string;
  currentStage: ApplicationStage;
  appliedAt: Date;
  candidate: {
    id: string;
    fullName: string;
    email: string;
  };
  position: {
    id: string;
    title: string;
  };
}