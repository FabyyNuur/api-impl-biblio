const { UserService } = require("./UserService");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async createUser(req, res) {
    try {
      const userData = req.body;

      // Validation basique
      if (!userData.nom || !userData.prenom || !userData.email) {
        res.status(400).json({
          error: "Les champs nom, prenom et email sont obligatoires",
        });
        return;
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.userService.getUserByEmail(
        userData.email
      );
      if (existingUser) {
        res.status(400).json({
          error: "Un utilisateur avec cet email existe déjà",
        });
        return;
      }

      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: "Utilisateur non trouvé" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await this.userService.updateUser(id, userData);

      if (!user) {
        res.status(404).json({ error: "Utilisateur non trouvé" });
        return;
      }

      res.json(user);
    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Cet email est déjà utilisé" });
        return;
      }

      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({ error: "Utilisateur non trouvé" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      if (error.message.includes("emprunts en cours")) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  }
}

module.exports = { UserController };
