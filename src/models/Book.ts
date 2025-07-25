export interface Book {
  id: string;
  titre: string;
  auteur: string;
  isbn: string;
  anneePublication: number;
  genre: string;
  description: string;
  disponible: boolean;
  dateAjout: Date;
}

export interface CreateBookRequest {
  titre: string;
  auteur: string;
  isbn: string;
  anneePublication: number;
  genre: string;
  description: string;
}

export interface UpdateBookRequest {
  titre?: string;
  auteur?: string;
  isbn?: string;
  anneePublication?: number;
  genre?: string;
  description?: string;
  disponible?: boolean;
}
