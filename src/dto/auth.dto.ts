export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'RECRUITER' | 'VIEWER';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER' | 'VIEWER'; // ← adicionado
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