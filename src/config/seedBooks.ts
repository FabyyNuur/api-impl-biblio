import { database } from './database';
import { BookService } from '../services/BookService';
import { BOOKS_SEED } from '../data/books.seed';

export interface SeedBooksResult {
  created: number;
  skipped: number;
  total: number;
}

export async function seedBooks(force = false): Promise<SeedBooksResult> {
  await database.ready();

  if (process.env.NODE_ENV === 'test' || process.env.VERCEL === '1') {
    return { created: 0, skipped: 0, total: BOOKS_SEED.length };
  }

  const bookService = new BookService();
  let created = 0;
  let skipped = 0;

  for (const book of BOOKS_SEED) {
    const existing = await bookService.getBookByIsbn(book.isbn);

    if (existing && !force) {
      skipped++;
      continue;
    }

    if (existing && force) {
      await bookService.deleteBook(existing.id);
    }

    await bookService.createBook(book);
    created++;
  }

  return { created, skipped, total: BOOKS_SEED.length };
}
