import { database } from './database';
import { UserService } from '../services/UserService';
import { UserRole } from '../models/User';

const DEFAULT_ADMIN = {
  nom: process.env.SEED_ADMIN_NOM || 'Admin',
  prenom: process.env.SEED_ADMIN_PRENOM || 'Bibliothèque',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@biblio.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'secret123',
  role: 'BIBLIOTHECAIRE' as UserRole,
};

export async function seedDefaultBibliothecaire(): Promise<boolean> {
  await database.ready();

  if (process.env.NODE_ENV === 'test' || process.env.VERCEL === '1') {
    return false;
  }

  const row = await database.get(
    "SELECT COUNT(*) as count FROM users WHERE role = 'BIBLIOTHECAIRE'"
  );

  if (row.count > 0) {
    return false;
  }

  const userService = new UserService();
  const existing = await userService.getUserByEmail(DEFAULT_ADMIN.email);

  if (existing) {
    console.log(
      `Un compte existe déjà avec l'email ${DEFAULT_ADMIN.email}, seed ignoré.`
    );
    return false;
  }

  await userService.createUser(DEFAULT_ADMIN, 'BIBLIOTHECAIRE');

  console.log('Compte bibliothécaire par défaut créé :');
  console.log(`   Email        : ${DEFAULT_ADMIN.email}`);
  console.log(`   Mot de passe : ${DEFAULT_ADMIN.password}`);
  console.log('   Pensez à changer ce mot de passe en production.');

  return true;
}
