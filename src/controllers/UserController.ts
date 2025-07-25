import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../models/User';

export class UserController {
  private userService = new UserService();

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      // Validation basique
      if (!userData.nom || !userData.prenom || !userData.email) {
        res.status(400).json({ 
          error: 'Les champs nom, prenom et email sont obligatoires' 
        });
        return;
      }

      // Vérifier si l'email existe déjà
      const existingUser = await this.userService.getUserByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({ 
          error: 'Un utilisateur avec cet email existe déjà' 
        });
        return;
      }

      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserRequest = req.body;

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (userData.email) {
        const existingUser = await this.userService.getUserByEmail(userData.email);
        if (existingUser && existingUser.id !== id) {
          res.status(409).json({ 
            error: 'Un autre utilisateur utilise déjà cet email' 
          });
          return;
        }
      }

      const user = await this.userService.updateUser(id, userData);

      if (!user) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.userService.deleteUser(id);

      if (!success) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('emprunts en cours')) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}
