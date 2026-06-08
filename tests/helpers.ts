import { UserService } from '../src/services/UserService';
import { BookService } from '../src/services/BookService';
import { AuthService } from '../src/services/AuthService';
import { User, UserRole } from '../src/models/User';
import { USER_ROLES } from '../src/constants/roles';

const userService = new UserService();
const bookService = new BookService();
const authService = new AuthService();

const DEFAULT_PASSWORD = 'secret123';

export async function createTestUser(overrides: Partial<{
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: UserRole;
}> = {}): Promise<User> {
  return userService.createUser({
    nom: overrides.nom ?? 'Dupont',
    prenom: overrides.prenom ?? 'Jean',
    email: overrides.email ?? `user-${Date.now()}-${Math.random()}@test.com`,
    password: overrides.password ?? DEFAULT_PASSWORD,
    role: overrides.role
  });
}

export async function createTestBibliothecaire(overrides: Partial<{
  nom: string;
  prenom: string;
  email: string;
  password: string;
}> = {}): Promise<User> {
  return createTestUser({
    ...overrides,
    role: USER_ROLES.BIBLIOTHECAIRE,
    email: overrides.email ?? `biblio-${Date.now()}-${Math.random()}@test.com`
  });
}

export function getAuthToken(user: User): string {
  return authService.generateToken(user);
}

export async function createTestBook(overrides: Partial<{
  titre: string;
  auteur: string;
  isbn: string;
  anneePublication: number;
  genre: string;
  nombreExemplaires: number;
  description: string;
}> = {}) {
  return bookService.createBook({
    titre: overrides.titre ?? 'Le Petit Prince',
    auteur: overrides.auteur ?? 'Antoine de Saint-Exupéry',
    isbn: overrides.isbn ?? `978-${Date.now()}-${Math.random()}`,
    anneePublication: overrides.anneePublication ?? 1943,
    genre: overrides.genre ?? 'Conte',
    nombreExemplaires: overrides.nombreExemplaires ?? 2,
    description: overrides.description,
  });
}
