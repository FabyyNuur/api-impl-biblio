import { UserRole } from '../constants/roles';

export type { UserRole };

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  dateInscription: Date;
  actif: boolean;
  role: UserRole;
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  actif?: boolean;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}
