import { Router } from 'express';
import { EmpruntController } from '../controllers/EmpruntController';

const router = Router();
const empruntController = new EmpruntController();

// Routes pour les emprunts
router.post('/', empruntController.createEmprunt.bind(empruntController));
router.get('/en-cours', empruntController.getAllEmpruntsEnCours.bind(empruntController));
router.get('/en-retard', empruntController.getEmpruntsEnRetard.bind(empruntController));
router.get('/historique', empruntController.getEmpruntsHistorique.bind(empruntController));
router.get('/:id', empruntController.getEmpruntById.bind(empruntController));
router.patch('/:id/retour', empruntController.returnBook.bind(empruntController));

export default router;
