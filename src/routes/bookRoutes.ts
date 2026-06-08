import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { USER_ROLES } from '../constants/roles';

const router = Router();
const bookController = new BookController();

router.post('/', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), bookController.createBook.bind(bookController));
router.get('/available', bookController.getAvailableBooks.bind(bookController));
router.get('/search', bookController.searchBooks.bind(bookController));
router.get('/', bookController.getAllBooks.bind(bookController));
router.get('/:id', bookController.getBookById.bind(bookController));
router.put('/:id', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), bookController.updateBook.bind(bookController));
router.delete('/:id', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), bookController.deleteBook.bind(bookController));

export default router;
