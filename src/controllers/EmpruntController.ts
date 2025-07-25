import { Request, Response } from 'express';
import { EmpruntService } from '../services/EmpruntService';
import { CreateEmpruntRequest } from '../models/Emprunt';

export class EmpruntController {
  private empruntService = new EmpruntService();

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
