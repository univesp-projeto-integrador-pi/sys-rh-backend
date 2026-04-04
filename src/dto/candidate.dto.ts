
export interface CreateCandidateDTO {
  fullName: string;
  email: string;
  phone?: string;
}

export interface UpdateCandidateDTO {
  fullName?: string;
  phone?: string;
}

export interface CandidateResponseDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
}