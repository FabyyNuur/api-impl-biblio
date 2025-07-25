import { Router } from 'express';
import { BookController } from '../controllers/BookController';

const router = Router();
const bookController = new BookController();

// Routes pour les livres
router.post('/', bookController.createBook.bind(bookController));
router.get('/', bookController.getAllBooks.bind(bookController));
router.get('/:id', bookController.getBookById.bind(bookController));
router.put('/:id', bookController.updateBook.bind(bookController));
router.delete('/:id', bookController.deleteBook.bind(bookController));

export default router;
