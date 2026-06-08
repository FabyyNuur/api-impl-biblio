import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const bookController = new BookController();

router.post('/', authenticateToken, requireRole('BIBLIOTHECAIRE'), bookController.createBook.bind(bookController));
router.get('/available', bookController.getAvailableBooks.bind(bookController));
router.get('/search', bookController.searchBooks.bind(bookController));
router.get('/', bookController.getAllBooks.bind(bookController));
router.get('/:id', bookController.getBookById.bind(bookController));
router.put('/:id', authenticateToken, requireRole('BIBLIOTHECAIRE'), bookController.updateBook.bind(bookController));
router.delete('/:id', authenticateToken, requireRole('BIBLIOTHECAIRE'), bookController.deleteBook.bind(bookController));

export default router;
