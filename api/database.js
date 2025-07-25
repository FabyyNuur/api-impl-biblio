const sqlite3 = require("sqlite3").verbose();

class Database {
  constructor(dbPath = ":memory:") {
    this.db = new sqlite3.Database(dbPath);
    this.initTables();
  }

  initTables() {
    try {
      // Table des utilisateurs
      this.db.run(`
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
      this.db.run(`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          titre TEXT NOT NULL,
          auteur TEXT NOT NULL,
          isbn TEXT UNIQUE NOT NULL,
          anneePublication INTEGER NOT NULL,
          genre TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          disponible BOOLEAN DEFAULT 1,
          dateAjout DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des emprunts
      this.db.run(`
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

      console.log("Tables de la base de données initialisées avec succès");
    } catch (error) {
      console.error("Erreur lors de l'initialisation des tables:", error);
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

const database = new Database();

module.exports = { database, Database };
