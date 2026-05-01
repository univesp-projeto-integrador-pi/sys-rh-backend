export interface CreateCandidateDTO {
  fullName: string;
  email: string;
  phone?: string;
  // 🚀 Adicionado: Estrutura para criação aninhada
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string | null;
  };
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