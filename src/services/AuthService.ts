import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { database } from '../config/database';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth';
import { User, LoginRequest, AuthTokenPayload } from '../models/User';

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
      role: row.role
    };

    return {
      user,
      token: this.generateToken(user)
    };
  }
}
