import { Role } from "@prisma/client";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: Role;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: Date;
  updatedAt?: Date;
}