import sqlite3 from 'sqlite3';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = 'bibliotheque.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initTables();
  }

  private async initTables(): Promise<void> {
    try {
      // Table des utilisateurs
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          nom TEXT NOT NULL,
          prenom TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          dateInscription DATETIME DEFAULT CURRENT_TIMESTAMP,
          actif BOOLEAN DEFAULT 1
        )
      `);

      // Table des livres
      await this.run(`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          titre TEXT NOT NULL,
          auteur TEXT NOT NULL,
          isbn TEXT UNIQUE NOT NULL,
          anneePublication INTEGER NOT NULL,
          genre TEXT NOT NULL,
          disponible BOOLEAN DEFAULT 1,
          dateAjout DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des emprunts
      await this.run(`
        CREATE TABLE IF NOT EXISTS emprunts (
          id TEXT PRIMARY KEY,
          utilisateurId TEXT NOT NULL,
          livreId TEXT NOT NULL,
          dateEmprunt DATETIME DEFAULT CURRENT_TIMESTAMP,
          dateRetourPrevu DATETIME NOT NULL,
          dateRetourEffectif DATETIME,
          statut TEXT DEFAULT 'EN_COURS',
          FOREIGN KEY (utilisateurId) REFERENCES users (id),
          FOREIGN KEY (livreId) REFERENCES books (id)
        )
      `);

      console.log('Tables de la base de données initialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tables:', error);
    }
  }

  public getDatabase(): sqlite3.Database {
    return this.db;
  }

  public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public close(): void {
    this.db.close();
  }
}

export const database = new Database();
