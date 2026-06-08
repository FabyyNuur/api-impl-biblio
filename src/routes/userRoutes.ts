import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, requireRole, requireSelfOrRole } from '../middleware/auth';
import { USER_ROLES } from '../constants/roles';

const router = Router();
const userController = new UserController();

router.post('/', userController.createUser.bind(userController));
router.get('/', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), userController.getAllUsers.bind(userController));
router.get('/:id', authenticateToken, requireSelfOrRole('id', USER_ROLES.BIBLIOTHECAIRE), userController.getUserById.bind(userController));
router.put('/:id', authenticateToken, userController.updateUser.bind(userController));
router.delete('/:id', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), userController.deleteUser.bind(userController));

export default router;
