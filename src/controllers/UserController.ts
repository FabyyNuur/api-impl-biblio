import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../models/User';
import { USER_ROLES } from '../constants/roles';

export class UserController {
  private userService = new UserService();

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      if (!userData.nom || !userData.prenom || !userData.email || !userData.password) {
        res.status(400).json({
          error: 'Les champs nom, prenom, email et password sont obligatoires'
        });
        return;
      }

      if (userData.password.length < 6) {
        res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
        return;
      }

      const existingUser = await this.userService.getUserByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({
          error: 'Un utilisateur avec cet email existe déjà'
        });
        return;
      }

      // Seul un bibliothécaire peut créer un compte avec un rôle autre que LECTEUR
      const role = req.user?.role === USER_ROLES.BIBLIOTHECAIRE ? userData.role : USER_ROLES.LECTEUR;

      const user = await this.userService.createUser({ ...userData, role });
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

      if (userData.email) {
        const existingUser = await this.userService.getUserByEmail(userData.email);
        if (existingUser && existingUser.id !== id) {
          res.status(409).json({
            error: 'Un autre utilisateur utilise déjà cet email'
          });
          return;
        }
      }

      // Un lecteur ne peut modifier que son propre profil (nom, prenom, email)
      if (req.user?.role === USER_ROLES.LECTEUR && req.user.id !== id) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      if (req.user?.id === id && userData.actif === false) {
        res.status(403).json({ error: 'Vous ne pouvez pas désactiver votre propre compte' });
        return;
      }

      if (req.user?.role === USER_ROLES.LECTEUR) {
        const { actif, role, ...allowedFields } = userData;
        if (actif !== undefined || role !== undefined) {
          res.status(403).json({ error: 'Vous ne pouvez pas modifier le rôle ou le statut actif' });
          return;
        }
        const user = await this.userService.updateUser(id, allowedFields);
        if (!user) {
          res.status(404).json({ error: 'Utilisateur non trouvé' });
          return;
        }
        res.json(user);
        return;
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

      if (req.user?.id === id) {
        res.status(403).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
        return;
      }

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
