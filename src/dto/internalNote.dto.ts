
export interface CreateInternalNoteDTO {
  content: string;
  rating?: number;
  applicationId: string;
  authorId: string;
}

export interface InternalNoteResponseDTO {
  id: string;
  content: string;
  rating: number | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
  };
}