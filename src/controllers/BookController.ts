import { Request, Response } from 'express';
import { BookService } from '../services/BookService';
import { CreateBookRequest, UpdateBookRequest } from '../models/Book';

export class BookController {
  private bookService = new BookService();

  async createBook(req: Request, res: Response): Promise<void> {
    try {
      const bookData: CreateBookRequest = req.body;

      // Validation basique
      if (!bookData.titre || !bookData.auteur || !bookData.isbn || !bookData.anneePublication || !bookData.genre) {
        res.status(400).json({ 
          error: 'Tous les champs sont obligatoires (titre, auteur, isbn, anneePublication, genre)' 
        });
        return;
      }

      // Vérifier si l'ISBN existe déjà
      const existingBook = await this.bookService.getBookByIsbn(bookData.isbn);
      if (existingBook) {
        res.status(409).json({ 
          error: 'Un livre avec cet ISBN existe déjà' 
        });
        return;
      }

      const book = await this.bookService.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const book = await this.bookService.getBookById(id);

      if (!book) {
        res.status(404).json({ error: 'Livre non trouvé' });
        return;
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const { disponible, search } = req.query;

      let books;

      if (search) {
        books = await this.bookService.searchBooks(search as string);
      } else if (disponible === 'true') {
        books = await this.bookService.getAvailableBooks();
      } else {
        books = await this.bookService.getAllBooks();
      }

      res.json(books);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bookData: UpdateBookRequest = req.body;

      // Vérifier si l'ISBN est déjà utilisé par un autre livre
      if (bookData.isbn) {
        const existingBook = await this.bookService.getBookByIsbn(bookData.isbn);
        if (existingBook && existingBook.id !== id) {
          res.status(409).json({ 
            error: 'Un autre livre utilise déjà cet ISBN' 
          });
          return;
        }
      }

      const book = await this.bookService.updateBook(id, bookData);

      if (!book) {
        res.status(404).json({ error: 'Livre non trouvé' });
        return;
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.bookService.deleteBook(id);

      if (!success) {
        res.status(404).json({ error: 'Livre non trouvé' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('emprunts en cours')) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}
