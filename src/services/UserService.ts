import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database';
import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '../models/User';
import { USER_ROLES } from '../constants/roles';
import { AuthService } from './AuthService';

export class UserService {
  private authService = new AuthService();

  private mapRowToUser(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      nom: row.nom as string,
      prenom: row.prenom as string,
      email: row.email as string,
      dateInscription: new Date(row.dateInscription as string),
      actif: Boolean(row.actif),
      role: row.role as UserRole
    };
  }

  async createUser(userData: CreateUserRequest, defaultRole: UserRole = USER_ROLES.LECTEUR): Promise<User> {
    const id = uuidv4();
    const dateInscription = new Date();
    const role = userData.role ?? defaultRole;
    const passwordHash = await this.authService.hashPassword(userData.password);

    await database.run(
      `INSERT INTO users (id, nom, prenom, email, dateInscription, actif, passwordHash, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userData.nom, userData.prenom, userData.email, dateInscription.toISOString(), 1, passwordHash, role]
    );

    return {
      id,
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      dateInscription,
      actif: true,
      role
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const row = await database.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  async getAllUsers(): Promise<User[]> {
    const rows = await database.all('SELECT * FROM users ORDER BY dateInscription DESC');
    return rows.map(row => this.mapRowToUser(row));
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return null;
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (userData.nom !== undefined) {
      updates.push('nom = ?');
      values.push(userData.nom);
    }
    if (userData.prenom !== undefined) {
      updates.push('prenom = ?');
      values.push(userData.prenom);
    }
    if (userData.email !== undefined) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.actif !== undefined) {
      updates.push('actif = ?');
      values.push(userData.actif ? 1 : 0);
    }
    if (userData.role !== undefined) {
      updates.push('role = ?');
      values.push(userData.role);
    }

    if (updates.length === 0) {
      return existingUser;
    }

    values.push(id);

    await database.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const empruntsEnCours = await database.get(
      'SELECT COUNT(*) as count FROM emprunts WHERE utilisateurId = ? AND statut = "EN_COURS"',
      [id]
    );

    if (empruntsEnCours.count > 0) {
      throw new Error('Impossible de supprimer un utilisateur ayant des emprunts en cours');
    }

    const result = await database.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes! > 0;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const row = await database.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }
}
