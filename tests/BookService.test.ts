import { BookService } from '../src/services/BookService';
import { EmpruntService } from '../src/services/EmpruntService';
import { createTestUser, createTestBook } from './helpers';

describe('BookService', () => {
  let bookService: BookService;

  beforeEach(() => {
    bookService = new BookService();
  });

  describe('createBook', () => {
    it('devrait créer un nouveau livre', async () => {
      const book = await bookService.createBook({
        titre: '1984',
        auteur: 'George Orwell',
        isbn: '978-0451524935',
        anneePublication: 1949,
        genre: 'Dystopie',
        nombreExemplaires: 3
      });

      expect(book.id).toBeDefined();
      expect(book.titre).toBe('1984');
      expect(book.disponible).toBe(true);
      expect(book.nombreExemplaires).toBe(3);
    });
  });

  describe('getBookById', () => {
    it('devrait retourner un livre existant', async () => {
      const created = await createTestBook();
      const book = await bookService.getBookById(created.id);
      expect(book?.isbn).toBe(created.isbn);
    });

    it('devrait retourner null pour un ID inexistant', async () => {
      expect(await bookService.getBookById('inexistant')).toBeNull();
    });
  });

  describe('getAllBooks', () => {
    it('devrait lister tous les livres', async () => {
      await createTestBook({ isbn: '978-111' });
      await createTestBook({ isbn: '978-222' });
      const books = await bookService.getAllBooks();
      expect(books).toHaveLength(2);
    });
  });

  describe('getAvailableBooks', () => {
    it('devrait ne retourner que les livres disponibles', async () => {
      const disponible = await createTestBook({ isbn: '978-dispo' });
      const indisponible = await createTestBook({ isbn: '978-indispo' });
      await bookService.updateBook(indisponible.id, { disponible: false });

      const books = await bookService.getAvailableBooks();
      expect(books).toHaveLength(1);
      expect(books[0].id).toBe(disponible.id);
    });
  });

  describe('updateBook', () => {
    it('devrait mettre à jour un livre', async () => {
      const created = await createTestBook();
      const updated = await bookService.updateBook(created.id, { titre: 'Nouveau titre' });
      expect(updated?.titre).toBe('Nouveau titre');
    });
  });

  describe('deleteBook', () => {
    it('devrait supprimer un livre sans emprunt', async () => {
      const book = await createTestBook();
      expect(await bookService.deleteBook(book.id)).toBe(true);
      expect(await bookService.getBookById(book.id)).toBeNull();
    });

    it('devrait refuser la suppression si emprunts en cours', async () => {
      const user = await createTestUser();
      const book = await createTestBook();
      const empruntService = new EmpruntService();
      await empruntService.createEmprunt({ utilisateurId: user.id, livreId: book.id });

      await expect(bookService.deleteBook(book.id)).rejects.toThrow('emprunts en cours');
    });
  });

  describe('getBookByIsbn', () => {
    it('devrait retrouver un livre par ISBN', async () => {
      const created = await createTestBook({ isbn: '978-unique-isbn' });
      const book = await bookService.getBookByIsbn('978-unique-isbn');
      expect(book?.id).toBe(created.id);
    });
  });

  describe('searchBooks', () => {
    it('devrait rechercher par titre ou auteur', async () => {
      await createTestBook({ titre: 'Harry Potter', auteur: 'Rowling', isbn: '978-hp' });
      await createTestBook({ titre: 'Autre livre', auteur: 'Zola', isbn: '978-zola' });

      const results = await bookService.searchBooks('Harry');
      expect(results).toHaveLength(1);
      expect(results[0].titre).toBe('Harry Potter');
    });
  });
});
