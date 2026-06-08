import { Router } from 'express';
import { EmpruntController } from '../controllers/EmpruntController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { USER_ROLES } from '../constants/roles';

const router = Router();
const empruntController = new EmpruntController();

router.post('/', authenticateToken, empruntController.createEmprunt.bind(empruntController));
router.get('/en-cours', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), empruntController.getAllEmpruntsEnCours.bind(empruntController));
router.get('/en-retard', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), empruntController.getEmpruntsEnRetard.bind(empruntController));
router.get('/historique', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), empruntController.getEmpruntsHistorique.bind(empruntController));
router.get('/:id', authenticateToken, empruntController.getEmpruntById.bind(empruntController));
router.patch('/:id/retour', authenticateToken, requireRole(USER_ROLES.BIBLIOTHECAIRE), empruntController.returnBook.bind(empruntController));

export default router;
