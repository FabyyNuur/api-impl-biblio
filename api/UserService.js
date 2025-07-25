const { v4: uuidv4 } = require("uuid");
const { database } = require("./database");

class UserService {
  async createUser(userData) {
    const id = uuidv4();
    const dateInscription = new Date();

    await database.run(
      `INSERT INTO users (id, nom, prenom, email, dateInscription, actif) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        userData.nom,
        userData.prenom,
        userData.email,
        dateInscription.toISOString(),
        1,
      ]
    );

    return {
      id,
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      dateInscription,
      actif: true,
    };
  }

  async getUserById(id) {
    const row = await database.get("SELECT * FROM users WHERE id = ?", [id]);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      dateInscription: new Date(row.dateInscription),
      actif: Boolean(row.actif),
    };
  }

  async getAllUsers() {
    const rows = await database.all(
      "SELECT * FROM users ORDER BY dateInscription DESC"
    );

    return rows.map((row) => ({
      id: row.id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      dateInscription: new Date(row.dateInscription),
      actif: Boolean(row.actif),
    }));
  }

  async updateUser(id, userData) {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return null;
    }

    const updates = [];
    const values = [];

    if (userData.nom !== undefined) {
      updates.push("nom = ?");
      values.push(userData.nom);
    }
    if (userData.prenom !== undefined) {
      updates.push("prenom = ?");
      values.push(userData.prenom);
    }
    if (userData.email !== undefined) {
      updates.push("email = ?");
      values.push(userData.email);
    }
    if (userData.actif !== undefined) {
      updates.push("actif = ?");
      values.push(userData.actif ? 1 : 0);
    }

    if (updates.length === 0) {
      return existingUser;
    }

    values.push(id);

    await database.run(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return this.getUserById(id);
  }

  async deleteUser(id) {
    // Vérifier s'il y a des emprunts en cours
    const empruntsEnCours = await database.get(
      'SELECT COUNT(*) as count FROM emprunts WHERE utilisateurId = ? AND statut = "EN_COURS"',
      [id]
    );

    if (empruntsEnCours.count > 0) {
      throw new Error(
        "Impossible de supprimer un utilisateur ayant des emprunts en cours"
      );
    }

    const result = await database.run("DELETE FROM users WHERE id = ?", [id]);
    return result.changes > 0;
  }

  async getUserByEmail(email) {
    const row = await database.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      dateInscription: new Date(row.dateInscription),
      actif: Boolean(row.actif),
    };
  }
}

module.exports = { UserService };
