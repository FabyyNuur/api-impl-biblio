import { EmpruntService } from '../src/services/EmpruntService';
import { UserService } from '../src/services/UserService';
import { BookService } from '../src/services/BookService';
import { database } from '../src/config/database';
import { createTestUser, createTestBook } from './helpers';

describe('EmpruntService', () => {
  let empruntService: EmpruntService;
  let userService: UserService;
  let bookService: BookService;

  beforeEach(() => {
    empruntService = new EmpruntService();
    userService = new UserService();
    bookService = new BookService();
  });

  describe('createEmprunt', () => {
    it('devrait créer un emprunt et décrémenter les exemplaires', async () => {
      const user = await createTestUser();
      const book = await createTestBook({ nombreExemplaires: 2 });

      const emprunt = await empruntService.createEmprunt({
        utilisateurId: user.id,
        livreId: book.id,
        dureeEmprunt: 7
      });

      expect(emprunt.statut).toBe('EN_COURS');
      expect(emprunt.dateRetourPrevu.getTime()).toBeGreaterThan(emprunt.dateEmprunt.getTime());

      const updatedBook = await bookService.getBookById(book.id);
      expect(updatedBook?.nombreExemplaires).toBe(1);
      expect(updatedBook?.disponible).toBe(true);
    });

    it('devrait refuser si utilisateur introuvable', async () => {
      const book = await createTestBook();
      await expect(
        empruntService.createEmprunt({ utilisateurId: 'inexistant', livreId: book.id })
      ).rejects.toThrow('Utilisateur introuvable');
    });

    it('devrait refuser si utilisateur inactif', async () => {
      const user = await createTestUser();
      await userService.updateUser(user.id, { actif: false });
      const book = await createTestBook();

      await expect(
        empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id })
      ).rejects.toThrow('Utilisateur inactif');
    });

    it('devrait refuser si livre non disponible', async () => {
      const user = await createTestUser();
      const book = await createTestBook({ nombreExemplaires: 1 });
      await bookService.updateBook(book.id, { disponible: false, nombreExemplaires: 0 });

      await expect(
        empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id })
      ).rejects.toThrow('Livre non disponible');
    });

    it('devrait refuser un second emprunt simultané', async () => {
      const user = await createTestUser();
      const book1 = await createTestBook({ isbn: '978-b1' });
      const book2 = await createTestBook({ isbn: '978-b2', nombreExemplaires: 3 });

      await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book1.id });

      await expect(
        empruntService.createEmprunt({ utilisateurId: user.id, livreId: book2.id })
      ).rejects.toThrow('déjà un emprunt en cours');
    });
  });

  describe('returnBook', () => {
    it('devrait retourner un livre et incrémenter les exemplaires', async () => {
      const user = await createTestUser();
      const book = await createTestBook({ nombreExemplaires: 1 });
      const emprunt = await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });

      const returned = await empruntService.returnBook(emprunt.id);
      expect(returned?.statut).toBe('RETOURNE');
      expect(returned?.dateRetourEffectif).toBeInstanceOf(Date);

      const updatedBook = await bookService.getBookById(book.id);
      expect(updatedBook?.nombreExemplaires).toBe(1);
      expect(updatedBook?.disponible).toBe(true);
    });

    it('devrait retourner null si emprunt inexistant', async () => {
      expect(await empruntService.returnBook('inexistant')).toBeNull();
    });

    it('devrait refuser si emprunt déjà retourné', async () => {
      const user = await createTestUser();
      const book = await createTestBook();
      const emprunt = await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });
      await empruntService.returnBook(emprunt.id);

      await expect(empruntService.returnBook(emprunt.id)).rejects.toThrow('n\'est pas en cours');
    });
  });

  describe('getEmpruntsByUserId', () => {
    it('devrait retourner l\'historique d\'un utilisateur', async () => {
      const user = await createTestUser();
      const book = await createTestBook();
      await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });

      const emprunts = await empruntService.getEmpruntsByUserId(user.id);
      expect(emprunts).toHaveLength(1);
      expect(emprunts[0].utilisateur.email).toBe(user.email);
      expect(emprunts[0].livre.titre).toBe(book.titre);
    });
  });

  describe('getAllEmpruntsEnCours', () => {
    it('devrait lister les emprunts en cours', async () => {
      const user = await createTestUser();
      const book = await createTestBook();
      await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });

      const enCours = await empruntService.getAllEmpruntsEnCours();
      expect(enCours).toHaveLength(1);
      expect(enCours[0].statut).toBe('EN_COURS');
    });
  });

  describe('getEmpruntsHistorique', () => {
    it('devrait lister uniquement les emprunts retournés', async () => {
      const user = await createTestUser();
      const book = await createTestBook();
      const emprunt = await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });
      await empruntService.returnBook(emprunt.id);

      const historique = await empruntService.getEmpruntsHistorique();
      expect(historique).toHaveLength(1);
      expect(historique[0].statut).toBe('RETOURNE');
    });
  });

  describe('getEmpruntsEnRetard', () => {
    it('devrait détecter et marquer les emprunts en retard', async () => {
      const user = await createTestUser();
      const book = await createTestBook();
      const emprunt = await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      await database.run(
        'UPDATE emprunts SET dateRetourPrevu = ? WHERE id = ?',
        [pastDate.toISOString(), emprunt.id]
      );

      const enRetard = await empruntService.getEmpruntsEnRetard();
      expect(enRetard).toHaveLength(1);
      expect(enRetard[0].statut).toBe('EN_RETARD');
    });
  });
});
