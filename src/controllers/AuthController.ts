import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { LoginRequest, ChangePasswordRequest } from '../models/User';

export class AuthController {
  private authService = new AuthService();
  private userService = new UserService();

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;

      if (!credentials.email || !credentials.password) {
        res.status(400).json({ error: 'Email et mot de passe sont obligatoires' });
        return;
      }

      const result = await this.authService.login(credentials);

      if (!result) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }

      res.json({
        user: result.user,
        token: result.token
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('inactif')) {
        res.status(403).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);

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

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const data: ChangePasswordRequest = req.body;

      if (!data.currentPassword || !data.newPassword) {
        res.status(400).json({
          error: 'Les champs currentPassword et newPassword sont obligatoires',
        });
        return;
      }

      const user = await this.authService.changePassword(req.user.id, data);
      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('incorrect')) {
          res.status(401).json({ error: error.message });
          return;
        }
        if (error.message.includes('6 caractères') || error.message.includes('différent')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
