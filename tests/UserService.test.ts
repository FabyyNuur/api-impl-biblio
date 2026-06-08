import { USER_ROLES } from '../src/constants/roles';
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
        email: 'jean.dupont@example.com',
        password: 'secret123'
      });

      expect(user.id).toBeDefined();
      expect(user.nom).toBe('Dupont');
      expect(user.prenom).toBe('Jean');
      expect(user.email).toBe('jean.dupont@example.com');
      expect(user.actif).toBe(true);
      expect(user.role).toBe(USER_ROLES.LECTEUR);
      expect(user.mustChangePassword).toBe(false);
      expect(user.dateInscription).toBeInstanceOf(Date);
    });

    it('devrait créer un utilisateur avec changement de mot de passe obligatoire', async () => {
      const user = await userService.createUser(
        {
          nom: 'Temp',
          prenom: 'User',
          email: 'temp.user@example.com',
        },
        USER_ROLES.LECTEUR,
        true,
        'ChangeMe123'
      );

      expect(user.mustChangePassword).toBe(true);
    });

    it('devrait créer un bibliothécaire si le rôle est spécifié', async () => {
      const user = await userService.createUser({
        nom: 'Admin',
        prenom: 'Biblio',
        email: 'admin@biblio.com',
        password: 'secret123',
        role: USER_ROLES.BIBLIOTHECAIRE
      });

      expect(user.role).toBe(USER_ROLES.BIBLIOTHECAIRE);
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
