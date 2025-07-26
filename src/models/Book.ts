export interface Book {
  id: string;
  titre: string;
  auteur: string;
  isbn: string;
  anneePublication: number;
  genre: string;
  disponible: boolean;
  dateAjout: Date;
  nombreExemplaires: number;
}

export interface CreateBookRequest {
  titre: string;
  auteur: string;
  isbn: string;
  anneePublication: number;
  genre: string;
  nombreExemplaires: number;
}

export interface UpdateBookRequest {
  titre?: string;
  auteur?: string;
  isbn?: string;
  anneePublication?: number;
  genre?: string;
  disponible?: boolean;
  nombreExemplaires?: number;
}
