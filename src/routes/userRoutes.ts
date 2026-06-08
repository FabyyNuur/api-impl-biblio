import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, requireRole, requireSelfOrRole } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.post('/', userController.createUser.bind(userController));
router.get('/', authenticateToken, requireRole('BIBLIOTHECAIRE'), userController.getAllUsers.bind(userController));
router.get('/:id', authenticateToken, requireSelfOrRole('id', 'BIBLIOTHECAIRE'), userController.getUserById.bind(userController));
router.put('/:id', authenticateToken, userController.updateUser.bind(userController));
router.delete('/:id', authenticateToken, requireRole('BIBLIOTHECAIRE'), userController.deleteUser.bind(userController));

export default router;
