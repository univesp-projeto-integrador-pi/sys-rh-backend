export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER' | 'VIEWER' | null;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}