import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { database } from '../config/database';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth';
import { User, LoginRequest, AuthTokenPayload, ChangePasswordRequest } from '../models/User';

const SALT_ROUNDS = 10;

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    if (!passwordHash) {
      return false;
    }
    return bcrypt.compare(password, passwordHash);
  }

  generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  async login(credentials: LoginRequest): Promise<{ user: User; token: string } | null> {
    const row = await database.get(
      'SELECT * FROM users WHERE email = ?',
      [credentials.email]
    );

    if (!row) {
      return null;
    }

    const valid = await this.verifyPassword(credentials.password, row.passwordHash);
    if (!valid) {
      return null;
    }

    if (!row.actif) {
      throw new Error('Compte utilisateur inactif');
    }

    const user: User = {
      id: row.id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      dateInscription: new Date(row.dateInscription),
      actif: Boolean(row.actif),
      role: row.role,
      mustChangePassword: Boolean(row.mustChangePassword),
    };

    return {
      user,
      token: this.generateToken(user)
    };
  }

  async changePassword(userId: string, data: ChangePasswordRequest): Promise<User> {
    const row = await database.get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!row) {
      throw new Error('Utilisateur non trouvé');
    }

    const valid = await this.verifyPassword(data.currentPassword, row.passwordHash);
    if (!valid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    if (data.newPassword.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    const samePassword = await this.verifyPassword(data.newPassword, row.passwordHash);
    if (samePassword) {
      throw new Error('Le nouveau mot de passe doit être différent de l\'actuel');
    }

    const passwordHash = await this.hashPassword(data.newPassword);
    await database.run(
      'UPDATE users SET passwordHash = ?, mustChangePassword = 0 WHERE id = ?',
      [passwordHash, userId]
    );

    const updatedRow = await database.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!updatedRow) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      id: updatedRow.id,
      nom: updatedRow.nom,
      prenom: updatedRow.prenom,
      email: updatedRow.email,
      dateInscription: new Date(updatedRow.dateInscription),
      actif: Boolean(updatedRow.actif),
      role: updatedRow.role,
      mustChangePassword: Boolean(updatedRow.mustChangePassword),
    };
  }
}
