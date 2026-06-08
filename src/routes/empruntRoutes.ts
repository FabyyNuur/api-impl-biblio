import { Router } from 'express';
import { EmpruntController } from '../controllers/EmpruntController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const empruntController = new EmpruntController();

router.post('/', authenticateToken, empruntController.createEmprunt.bind(empruntController));
router.get('/en-cours', authenticateToken, requireRole('BIBLIOTHECAIRE'), empruntController.getAllEmpruntsEnCours.bind(empruntController));
router.get('/en-retard', authenticateToken, requireRole('BIBLIOTHECAIRE'), empruntController.getEmpruntsEnRetard.bind(empruntController));
router.get('/historique', authenticateToken, requireRole('BIBLIOTHECAIRE'), empruntController.getEmpruntsHistorique.bind(empruntController));
router.get('/:id', authenticateToken, empruntController.getEmpruntById.bind(empruntController));
router.patch('/:id/retour', authenticateToken, requireRole('BIBLIOTHECAIRE'), empruntController.returnBook.bind(empruntController));

export default router;
