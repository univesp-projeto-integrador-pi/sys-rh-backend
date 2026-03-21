// src/dtos/candidate.dto.ts

// o que chega no POST /candidates
export interface CreateCandidateDTO {
  fullName: string;
  email: string;
  phone?: string;
}

// o que chega no PUT /candidates/:id
export interface UpdateCandidateDTO {
  fullName?: string;
  phone?: string;
}

// o que a API devolve
export interface CandidateResponseDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
}