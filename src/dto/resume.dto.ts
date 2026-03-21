
export interface CreateProfessionalExperienceDTO {
  companyName: string;
  jobTitle: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description?: string;
}

export interface CreateEducationDTO {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate?: Date;
}

export interface CreateResumeDTO {
  summary?: string;
  fileUrl?: string;
  skillIds: string[];
  experiences: CreateProfessionalExperienceDTO[];
  educations: CreateEducationDTO[];
}

export interface UpdateResumeDTO {
  summary?: string;
  fileUrl?: string;
  skillIds?: string[];
  experiences?: CreateProfessionalExperienceDTO[];
  educations?: CreateEducationDTO[];
}

export interface ResumeResponseDTO {
  id: string;
  summary: string | null;
  fileUrl: string | null;
  createdAt: Date;
  skills: {
    id: string;
    name: string;
  }[];
  experiences: {
    id: string;
    companyName: string;
    jobTitle: string;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
  }[];
  educations: {
    id: string;
    institution: string;
    degree: string;
    endDate: Date | null;
  }[];
}