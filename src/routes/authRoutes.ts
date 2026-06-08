import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));
router.get('/me', authenticateToken, authController.me.bind(authController));
router.post('/change-password', authenticateToken, authController.changePassword.bind(authController));

export default router;
