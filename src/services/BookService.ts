import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database';
import { Book, CreateBookRequest, UpdateBookRequest } from '../models/Book';

export class BookService {
  async createBook(bookData: CreateBookRequest): Promise<Book> {
    const id = uuidv4();
    const dateAjout = new Date();

    await database.run(
      `INSERT INTO books (id, titre, auteur, isbn, anneePublication, genre, disponible, dateAjout) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bookData.titre, bookData.auteur, bookData.isbn, bookData.anneePublication, bookData.genre, 1, dateAjout.toISOString()]
    );

    return {
      id,
      titre: bookData.titre,
      auteur: bookData.auteur,
      isbn: bookData.isbn,
      anneePublication: bookData.anneePublication,
      genre: bookData.genre,
      disponible: true,
      dateAjout
    };
  }

  async getBookById(id: string): Promise<Book | null> {
    const row = await database.get('SELECT * FROM books WHERE id = ?', [id]);
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      titre: row.titre,
      auteur: row.auteur,
      isbn: row.isbn,
      anneePublication: row.anneePublication,
      genre: row.genre,
      disponible: Boolean(row.disponible),
      dateAjout: new Date(row.dateAjout)
    };
  }

  async getAllBooks(): Promise<Book[]> {
    const rows = await database.all('SELECT * FROM books ORDER BY dateAjout DESC');
    
    return rows.map(row => ({
      id: row.id,
      titre: row.titre,
      auteur: row.auteur,
      isbn: row.isbn,
      anneePublication: row.anneePublication,
      genre: row.genre,
      disponible: Boolean(row.disponible),
      dateAjout: new Date(row.dateAjout)
    }));
  }

  async getAvailableBooks(): Promise<Book[]> {
    const rows = await database.all('SELECT * FROM books WHERE disponible = 1 ORDER BY dateAjout DESC');
    
    return rows.map(row => ({
      id: row.id,
      titre: row.titre,
      auteur: row.auteur,
      isbn: row.isbn,
      anneePublication: row.anneePublication,
      genre: row.genre,
      disponible: Boolean(row.disponible),
      dateAjout: new Date(row.dateAjout)
    }));
  }

  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book | null> {
    const existingBook = await this.getBookById(id);
    if (!existingBook) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (bookData.titre !== undefined) {
      updates.push('titre = ?');
      values.push(bookData.titre);
    }
    if (bookData.auteur !== undefined) {
      updates.push('auteur = ?');
      values.push(bookData.auteur);
    }
    if (bookData.isbn !== undefined) {
      updates.push('isbn = ?');
      values.push(bookData.isbn);
    }
    if (bookData.anneePublication !== undefined) {
      updates.push('anneePublication = ?');
      values.push(bookData.anneePublication);
    }
    if (bookData.genre !== undefined) {
      updates.push('genre = ?');
      values.push(bookData.genre);
    }
    if (bookData.disponible !== undefined) {
      updates.push('disponible = ?');
      values.push(bookData.disponible ? 1 : 0);
    }

    if (updates.length === 0) {
      return existingBook;
    }

    values.push(id);

    await database.run(
      `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getBookById(id);
  }

  async deleteBook(id: string): Promise<boolean> {
    // Vérifier s'il y a des emprunts en cours pour ce livre
    const empruntsEnCours = await database.get(
      'SELECT COUNT(*) as count FROM emprunts WHERE livreId = ? AND statut = "EN_COURS"',
      [id]
    );

    if (empruntsEnCours.count > 0) {
      throw new Error('Impossible de supprimer un livre ayant des emprunts en cours');
    }

    const result = await database.run('DELETE FROM books WHERE id = ?', [id]);
    return result.changes! > 0;
  }

  async getBookByIsbn(isbn: string): Promise<Book | null> {
    const row = await database.get('SELECT * FROM books WHERE isbn = ?', [isbn]);
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      titre: row.titre,
      auteur: row.auteur,
      isbn: row.isbn,
      anneePublication: row.anneePublication,
      genre: row.genre,
      disponible: Boolean(row.disponible),
      dateAjout: new Date(row.dateAjout)
    };
  }

  async searchBooks(query: string): Promise<Book[]> {
    const searchQuery = `%${query}%`;
    const rows = await database.all(
      'SELECT * FROM books WHERE titre LIKE ? OR auteur LIKE ? OR genre LIKE ? ORDER BY dateAjout DESC',
      [searchQuery, searchQuery, searchQuery]
    );
    
    return rows.map(row => ({
      id: row.id,
      titre: row.titre,
      auteur: row.auteur,
      isbn: row.isbn,
      anneePublication: row.anneePublication,
      genre: row.genre,
      disponible: Boolean(row.disponible),
      dateAjout: new Date(row.dateAjout)
    }));
  }
}
