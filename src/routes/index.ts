import { Router } from 'express';
import userRoutes from './userRoutes';
import bookRoutes from './bookRoutes';
import empruntRoutes from './empruntRoutes';
import authRoutes from './authRoutes';
import { EmpruntController } from '../controllers/EmpruntController';
import { authenticateToken, requireSelfOrRole } from '../middleware/auth';

const router = Router();
const empruntController = new EmpruntController();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/emprunts', empruntRoutes);

router.get(
  '/users/:userId/emprunts',
  authenticateToken,
  requireSelfOrRole('userId', 'BIBLIOTHECAIRE'),
  empruntController.getEmpruntsByUserId.bind(empruntController)
);

export default router;
