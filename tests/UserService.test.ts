import { UserService } from '../src/services/UserService';
import { CreateUserRequest } from '../src/models/User';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const userData: CreateUserRequest = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com'
      };

      const user = await userService.createUser(userData);

      expect(user.id).toBeDefined();
      expect(user.nom).toBe(userData.nom);
      expect(user.prenom).toBe(userData.prenom);
      expect(user.email).toBe(userData.email);
      expect(user.actif).toBe(true);
      expect(user.dateInscription).toBeInstanceOf(Date);
    });
  });

  describe('getUserById', () => {
    it('devrait retourner null pour un ID inexistant', async () => {
      const user = await userService.getUserById('id-inexistant');
      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('devrait retourner un tableau d\'utilisateurs', async () => {
      const users = await userService.getAllUsers();
      expect(Array.isArray(users)).toBe(true);
    });
  });
});

