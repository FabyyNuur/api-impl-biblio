import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';
import { CreateUserRequest, UpdateUserRequest } from '../models/User';
import { USER_ROLES } from '../constants/roles';
import { DEFAULT_USER_PASSWORD } from '../config/auth';

export class UserController {
  private userService = new UserService();
  private emailService = new EmailService();

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      if (!userData.nom || !userData.prenom || !userData.email) {
        res.status(400).json({
          error: 'Les champs nom, prenom et email sont obligatoires',
        });
        return;
      }

      if (userData.password) {
        res.status(400).json({
          error: 'Le mot de passe est généré automatiquement et envoyé par email à l\'utilisateur',
        });
        return;
      }

      const password = DEFAULT_USER_PASSWORD;
      const mustChangePassword = true;

      const existingUser = await this.userService.getUserByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({
          error: 'Un utilisateur avec cet email existe déjà',
        });
        return;
      }

      const role = userData.role ?? USER_ROLES.LECTEUR;

      const user = await this.userService.createUser(
        { ...userData, role },
        USER_ROLES.LECTEUR,
        mustChangePassword,
        password
      );

      let emailSent: boolean | undefined;
      if (mustChangePassword) {
        emailSent = await this.emailService.sendWelcomeEmail({
          to: user.email,
          prenom: user.prenom,
          nom: user.nom,
          temporaryPassword: password,
        });
      }

      res.status(201).json({ ...user, ...(emailSent !== undefined && { emailSent }) });
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
