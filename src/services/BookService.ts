import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database';
import { Book, CreateBookRequest, UpdateBookRequest } from '../models/Book';

export class BookService {
  private mapRowToBook(row: Record<string, unknown>): Book {
    const nombreExemplaires = row.nombreExemplaires as number;

    return {
      id: row.id as string,
      titre: row.titre as string,
      auteur: row.auteur as string,
      isbn: row.isbn as string,
      anneePublication: row.anneePublication as number,
      genre: row.genre as string,
      description: (row.description as string) || '',
      nombreExemplaires,
      disponible: nombreExemplaires > 0,
      dateAjout: new Date(row.dateAjout as string),
    };
  }

  private syncDisponibilite(nombreExemplaires: number): boolean {
    return nombreExemplaires > 0;
  }

  async createBook(bookData: CreateBookRequest): Promise<Book> {
    const id = uuidv4();
    const dateAjout = new Date();
    const description = bookData.description?.trim() ?? '';

    await database.run(
      `INSERT INTO books (id, titre, auteur, isbn, anneePublication, genre, description, disponible, dateAjout, nombreExemplaires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bookData.titre,
        bookData.auteur,
        bookData.isbn,
        bookData.anneePublication,
        bookData.genre,
        description,
        1,
        dateAjout.toISOString(),
        bookData.nombreExemplaires,
      ]
    );

    return {
      id,
      titre: bookData.titre,
      auteur: bookData.auteur,
      isbn: bookData.isbn,
      anneePublication: bookData.anneePublication,
      genre: bookData.genre,
      description,
      disponible: true,
      dateAjout,
      nombreExemplaires: bookData.nombreExemplaires,
    };
  }

  async getBookById(id: string): Promise<Book | null> {
    const row = await database.get('SELECT * FROM books WHERE id = ?', [id]);

    if (!row) {
      return null;
    }

    return this.mapRowToBook(row);
  }

  async getAllBooks(): Promise<Book[]> {
    const rows = await database.all('SELECT * FROM books ORDER BY dateAjout DESC');
    return rows.map((row) => this.mapRowToBook(row));
  }

  async getAvailableBooks(): Promise<Book[]> {
    const rows = await database.all(
      'SELECT * FROM books WHERE nombreExemplaires > 0 ORDER BY dateAjout DESC'
    );
    return rows.map((row) => this.mapRowToBook(row));
  }

  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book | null> {
    const existingBook = await this.getBookById(id);
    if (!existingBook) {
      return null;
    }

    const updates: string[] = [];
    const values: unknown[] = [];

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
    if (bookData.description !== undefined) {
      updates.push('description = ?');
      values.push(bookData.description.trim());
    }
    if (bookData.nombreExemplaires !== undefined) {
      updates.push('nombreExemplaires = ?');
      values.push(bookData.nombreExemplaires);
    }

    const nextNombreExemplaires =
      bookData.nombreExemplaires ?? existingBook.nombreExemplaires;
    const nextDisponible =
      bookData.disponible !== undefined
        ? bookData.disponible
        : this.syncDisponibilite(nextNombreExemplaires);

    if (bookData.nombreExemplaires !== undefined || bookData.disponible !== undefined) {
      updates.push('disponible = ?');
      values.push(nextDisponible ? 1 : 0);
    }

    if (updates.length === 0) {
      return existingBook;
    }

    values.push(id);

    await database.run(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`, values);

    return this.getBookById(id);
  }

  async deleteBook(id: string): Promise<boolean> {
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

    return this.mapRowToBook(row);
  }

  async searchBooks(query: string): Promise<Book[]> {
    const searchQuery = `%${query}%`;
    const rows = await database.all(
      `SELECT * FROM books
       WHERE titre LIKE ? OR auteur LIKE ? OR genre LIKE ? OR description LIKE ?
       ORDER BY dateAjout DESC`,
      [searchQuery, searchQuery, searchQuery, searchQuery]
    );

    return rows.map((row) => this.mapRowToBook(row));
  }
}
