
import { Request, Response } from 'express';
import { EmpruntService } from '../services/EmpruntService';
import { CreateEmpruntRequest } from '../models/Emprunt';



export class EmpruntController {
  [x: string]: any;
  private empruntService = new EmpruntService();

  /**
   * @swagger
   * /api/emprunts/historique:
   *   get:
   *     summary: Lister tous les emprunts retournés (historique)
   *     tags: [Emprunts]
   *     responses:
   *       200:
   *         description: Liste des emprunts retournés
   */
  async getEmpruntsHistorique(req: Request, res: Response): Promise<void> {
    try {
      const emprunts = await this.empruntService.getEmpruntsHistorique();
      res.json(emprunts);
    } catch (error) {
      res.status(500).json({
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * @swagger
   * /api/emprunts:
   *   post:
   *     summary: Emprunter un livre
   *     tags: [Emprunts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - utilisateurId
   *               - livreId
   *             properties:
   *               utilisateurId:
   *                 type: string
   *               livreId:
   *                 type: string
   *               dureeEmprunt:
   *                 type: integer
   *                 description: Durée en jours (défaut 14)
   *     responses:
   *       201:
   *         description: Emprunt créé avec succès
   *       400:
   *         description: Données invalides ou livre non disponible
   */
  async createEmprunt(req: Request, res: Response): Promise<void> {
    try {
      const empruntData: CreateEmpruntRequest = req.body;

      // Validation basique
      if (!empruntData.utilisateurId || !empruntData.livreId) {
        res.status(400).json({ 
          error: 'Les champs utilisateurId et livreId sont obligatoires' 
        });
        return;
      }

      const emprunt = await this.empruntService.createEmprunt(empruntData);
      res.status(201).json(emprunt);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('introuvable') || 
            error.message.includes('non disponible') ||
            error.message.includes('inactif') ||
            error.message.includes('déjà emprunté')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * @swagger
   * /api/emprunts/{id}/retour:
   *   patch:
   *     summary: Retourner un livre
   *     tags: [Emprunts]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de l'emprunt
   *     responses:
   *       200:
   *         description: Livre retourné avec succès
   *       404:
   *         description: Emprunt non trouvé
   *       400:
   *         description: L'emprunt n'est pas en cours
   */
  async returnBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const emprunt = await this.empruntService.returnBook(id);

      if (!emprunt) {
        res.status(404).json({ error: 'Emprunt non trouvé' });
        return;
      }

      res.json(emprunt);
    } catch (error) {
      if (error instanceof Error && error.message.includes('n\'est pas en cours')) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/emprunts:
   *   get:
   *     summary: Lister les emprunts d'un utilisateur
   *     tags: [Emprunts]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Liste des emprunts de l'utilisateur
   */
  async getEmpruntsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const emprunts = await this.empruntService.getEmpruntsByUserId(userId);
      res.json(emprunts);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * @swagger
   * /api/emprunts/en-cours:
   *   get:
   *     summary: Lister tous les emprunts en cours
   *     tags: [Emprunts]
   *     responses:
   *       200:
   *         description: Liste des emprunts en cours
   */
  async getAllEmpruntsEnCours(req: Request, res: Response): Promise<void> {
    try {
      const emprunts = await this.empruntService.getAllEmpruntsEnCours();
      res.json(emprunts);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * @swagger
   * /api/emprunts/en-retard:
   *   get:
   *     summary: Lister tous les emprunts en retard
   *     tags: [Emprunts]
   *     responses:
   *       200:
   *         description: Liste des emprunts en retard
   */
  async getEmpruntsEnRetard(req: Request, res: Response): Promise<void> {
    try {
      const emprunts = await this.empruntService.getEmpruntsEnRetard();
      res.json(emprunts);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * @swagger
   * /api/emprunts/{id}:
   *   get:
   *     summary: Récupérer un emprunt par ID
   *     tags: [Emprunts]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Emprunt trouvé
   *       404:
   *         description: Emprunt non trouvé
   */
  async getEmpruntById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const emprunt = await this.empruntService.getEmpruntById(id);

      if (!emprunt) {
        res.status(404).json({ error: 'Emprunt non trouvé' });
        return;
      }

      res.json(emprunt);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}
