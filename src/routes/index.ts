import { Router } from 'express';
import userRoutes from './userRoutes';
import bookRoutes from './bookRoutes';
import empruntRoutes from './empruntRoutes';
import { EmpruntController } from '../controllers/EmpruntController';

const router = Router();
const empruntController = new EmpruntController();

// Routes principales
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/emprunts', empruntRoutes);

// Route spéciale pour les emprunts d'un utilisateur
router.get('/users/:userId/emprunts', empruntController.getEmpruntsByUserId.bind(empruntController));

export default router;
