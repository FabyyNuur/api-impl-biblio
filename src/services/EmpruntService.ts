import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database';
import { Emprunt, CreateEmpruntRequest, EmpruntAvecDetails } from '../models/Emprunt';
import { UserService } from './UserService';
import { BookService } from './BookService';

export class EmpruntService {
  private userService = new UserService();
  private bookService = new BookService();

  async createEmprunt(empruntData: CreateEmpruntRequest): Promise<Emprunt> {
    // Vérifier que l'utilisateur existe et est actif
    const user = await this.userService.getUserById(empruntData.utilisateurId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }
    if (!user.actif) {
      throw new Error('Utilisateur inactif');
    }

    // Vérifier que le livre existe et est disponible
    const book = await this.bookService.getBookById(empruntData.livreId);
    if (!book) {
      throw new Error('Livre introuvable');
    }
    if (!book.disponible) {
      throw new Error('Livre non disponible');
    }

    // Vérifier que l'utilisateur n'a pas déjà emprunté ce livre
    const empruntExistant = await database.get(
      'SELECT * FROM emprunts WHERE utilisateurId = ? AND livreId = ? AND statut = "EN_COURS"',
      [empruntData.utilisateurId, empruntData.livreId]
    );

    if (empruntExistant) {
      throw new Error('Ce livre est déjà emprunté par cet utilisateur');
    }

    const id = uuidv4();
    const dateEmprunt = new Date();
    const dureeEmprunt = empruntData.dureeEmprunt || 14; // 14 jours par défaut
    const dateRetourPrevu = new Date();
    dateRetourPrevu.setDate(dateEmprunt.getDate() + dureeEmprunt);

    // Créer l'emprunt
    await database.run(
      `INSERT INTO emprunts (id, utilisateurId, livreId, dateEmprunt, dateRetourPrevu, statut) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, empruntData.utilisateurId, empruntData.livreId, dateEmprunt.toISOString(), dateRetourPrevu.toISOString(), 'EN_COURS']
    );

    // Marquer le livre comme non disponible
    await this.bookService.updateBook(empruntData.livreId, { disponible: false });

    return {
      id,
      utilisateurId: empruntData.utilisateurId,
      livreId: empruntData.livreId,
      dateEmprunt,
      dateRetourPrevu,
      statut: 'EN_COURS'
    };
  }

  async returnBook(empruntId: string): Promise<Emprunt | null> {
    const emprunt = await this.getEmpruntById(empruntId);
    if (!emprunt) {
      return null;
    }

    if (emprunt.statut !== 'EN_COURS') {
      throw new Error('Cet emprunt n\'est pas en cours');
    }

    const dateRetourEffectif = new Date();

    // Mettre à jour l'emprunt
    await database.run(
      'UPDATE emprunts SET dateRetourEffectif = ?, statut = ? WHERE id = ?',
      [dateRetourEffectif.toISOString(), 'RETOURNE', empruntId]
    );

    // Marquer le livre comme disponible
    await this.bookService.updateBook(emprunt.livreId, { disponible: true });

    return {
      ...emprunt,
      dateRetourEffectif,
      statut: 'RETOURNE'
    };
  }

  async getEmpruntById(id: string): Promise<Emprunt | null> {
    const row = await database.get('SELECT * FROM emprunts WHERE id = ?', [id]);
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      utilisateurId: row.utilisateurId,
      livreId: row.livreId,
      dateEmprunt: new Date(row.dateEmprunt),
      dateRetourPrevu: new Date(row.dateRetourPrevu),
      dateRetourEffectif: row.dateRetourEffectif ? new Date(row.dateRetourEffectif) : undefined,
      statut: row.statut
    };
  }

  async getEmpruntsByUserId(utilisateurId: string): Promise<EmpruntAvecDetails[]> {
    const rows = await database.all(`
      SELECT 
        e.*,
        u.nom as user_nom, u.prenom as user_prenom, u.email as user_email,
        b.titre as book_titre, b.auteur as book_auteur, b.isbn as book_isbn
      FROM emprunts e
      JOIN users u ON e.utilisateurId = u.id
      JOIN books b ON e.livreId = b.id
      WHERE e.utilisateurId = ?
      ORDER BY e.dateEmprunt DESC
    `, [utilisateurId]);

    return rows.map(row => ({
      id: row.id,
      utilisateurId: row.utilisateurId,
      livreId: row.livreId,
      dateEmprunt: new Date(row.dateEmprunt),
      dateRetourPrevu: new Date(row.dateRetourPrevu),
      dateRetourEffectif: row.dateRetourEffectif ? new Date(row.dateRetourEffectif) : undefined,
      statut: row.statut,
      utilisateur: {
        nom: row.user_nom,
        prenom: row.user_prenom,
        email: row.user_email
      },
      livre: {
        titre: row.book_titre,
        auteur: row.book_auteur,
        isbn: row.book_isbn
      }
    }));
  }

  async getAllEmpruntsEnCours(): Promise<EmpruntAvecDetails[]> {
    const rows = await database.all(`
      SELECT 
        e.*,
        u.nom as user_nom, u.prenom as user_prenom, u.email as user_email,
        b.titre as book_titre, b.auteur as book_auteur, b.isbn as book_isbn
      FROM emprunts e
      JOIN users u ON e.utilisateurId = u.id
      JOIN books b ON e.livreId = b.id
      WHERE e.statut = 'EN_COURS'
      ORDER BY e.dateEmprunt DESC
    `);

    return rows.map(row => ({
      id: row.id,
      utilisateurId: row.utilisateurId,
      livreId: row.livreId,
      dateEmprunt: new Date(row.dateEmprunt),
      dateRetourPrevu: new Date(row.dateRetourPrevu),
      dateRetourEffectif: row.dateRetourEffectif ? new Date(row.dateRetourEffectif) : undefined,
      statut: row.statut,
      utilisateur: {
        nom: row.user_nom,
        prenom: row.user_prenom,
        email: row.user_email
      },
      livre: {
        titre: row.book_titre,
        auteur: row.book_auteur,
        isbn: row.book_isbn
      }
    }));
  }

  async getEmpruntsEnRetard(): Promise<EmpruntAvecDetails[]> {
    const today = new Date().toISOString();
    
    const rows = await database.all(`
      SELECT 
        e.*,
        u.nom as user_nom, u.prenom as user_prenom, u.email as user_email,
        b.titre as book_titre, b.auteur as book_auteur, b.isbn as book_isbn
      FROM emprunts e
      JOIN users u ON e.utilisateurId = u.id
      JOIN books b ON e.livreId = b.id
      WHERE e.statut = 'EN_COURS' AND e.dateRetourPrevu < ?
      ORDER BY e.dateRetourPrevu ASC
    `, [today]);

    // Mettre à jour le statut en retard
    for (const row of rows) {
      await database.run(
        'UPDATE emprunts SET statut = ? WHERE id = ?',
        ['EN_RETARD', row.id]
      );
    }

    return rows.map(row => ({
      id: row.id,
      utilisateurId: row.utilisateurId,
      livreId: row.livreId,
      dateEmprunt: new Date(row.dateEmprunt),
      dateRetourPrevu: new Date(row.dateRetourPrevu),
      dateRetourEffectif: row.dateRetourEffectif ? new Date(row.dateRetourEffectif) : undefined,
      statut: 'EN_RETARD',
      utilisateur: {
        nom: row.user_nom,
        prenom: row.user_prenom,
        email: row.user_email
      },
      livre: {
        titre: row.book_titre,
        auteur: row.book_auteur,
        isbn: row.book_isbn
      }
    }));
  }
}
