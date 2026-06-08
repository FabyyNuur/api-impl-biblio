import { UserService } from '../src/services/UserService';
import { BookService } from '../src/services/BookService';

const userService = new UserService();
const bookService = new BookService();

export async function createTestUser(overrides: Partial<{ nom: string; prenom: string; email: string }> = {}) {
  return userService.createUser({
    nom: overrides.nom ?? 'Dupont',
    prenom: overrides.prenom ?? 'Jean',
    email: overrides.email ?? `user-${Date.now()}-${Math.random()}@test.com`
  });
}

export async function createTestBook(overrides: Partial<{
  titre: string;
  auteur: string;
  isbn: string;
  anneePublication: number;
  genre: string;
  nombreExemplaires: number;
}> = {}) {
  return bookService.createBook({
    titre: overrides.titre ?? 'Le Petit Prince',
    auteur: overrides.auteur ?? 'Antoine de Saint-Exupéry',
    isbn: overrides.isbn ?? `978-${Date.now()}-${Math.random()}`,
    anneePublication: overrides.anneePublication ?? 1943,
    genre: overrides.genre ?? 'Conte',
    nombreExemplaires: overrides.nombreExemplaires ?? 2
  });
}
