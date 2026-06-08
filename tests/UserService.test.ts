import { UserService } from '../src/services/UserService';
import { EmpruntService } from '../src/services/EmpruntService';
import { createTestUser, createTestBook } from './helpers';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const user = await userService.createUser({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com'
      });

      expect(user.id).toBeDefined();
      expect(user.nom).toBe('Dupont');
      expect(user.prenom).toBe('Jean');
      expect(user.email).toBe('jean.dupont@example.com');
      expect(user.actif).toBe(true);
      expect(user.dateInscription).toBeInstanceOf(Date);
    });
  });

  describe('getUserById', () => {
    it('devrait retourner un utilisateur existant', async () => {
      const created = await createTestUser();
      const user = await userService.getUserById(created.id);
      expect(user?.email).toBe(created.email);
    });

    it('devrait retourner null pour un ID inexistant', async () => {
      const user = await userService.getUserById('id-inexistant');
      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      await createTestUser({ email: 'a@test.com' });
      await createTestUser({ email: 'b@test.com' });
      const users = await userService.getAllUsers();
      expect(users).toHaveLength(2);
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const created = await createTestUser();
      const updated = await userService.updateUser(created.id, { nom: 'Martin', actif: false });
      expect(updated?.nom).toBe('Martin');
      expect(updated?.actif).toBe(false);
    });

    it('devrait retourner null pour un ID inexistant', async () => {
      const result = await userService.updateUser('inexistant', { nom: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('devrait supprimer un utilisateur sans emprunt', async () => {
      const user = await createTestUser();
      const success = await userService.deleteUser(user.id);
      expect(success).toBe(true);
      expect(await userService.getUserById(user.id)).toBeNull();
    });

    it('devrait refuser la suppression si emprunts en cours', async () => {
      const user = await createTestUser();
      const book = await createTestBook();
      const empruntService = new EmpruntService();
      await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });

      await expect(userService.deleteUser(user.id)).rejects.toThrow('emprunts en cours');
    });
  });

  describe('getUserByEmail', () => {
    it('devrait retrouver un utilisateur par email', async () => {
      const created = await createTestUser({ email: 'unique@test.com' });
      const user = await userService.getUserByEmail('unique@test.com');
      expect(user?.id).toBe(created.id);
    });

    it('devrait retourner null si email inexistant', async () => {
      const user = await userService.getUserByEmail('inexistant@test.com');
      expect(user).toBeNull();
    });
  });
});
