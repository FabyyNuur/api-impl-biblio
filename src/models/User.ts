export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  dateInscription: Date;
  actif: boolean;
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  actif?: boolean;
}
