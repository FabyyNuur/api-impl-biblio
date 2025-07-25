class EmpruntController {
  async createEmprunt(req, res) {
    res
      .status(501)
      .json({ message: "Service emprunt en cours de développement" });
  }

  async returnBook(req, res) {
    res.status(404).json({ error: "Emprunt non trouvé" });
  }

  async getEmpruntsByUserId(req, res) {
    res.json([]);
  }

  async getAllEmpruntsEnCours(req, res) {
    res.json([]);
  }

  async getEmpruntsEnRetard(req, res) {
    res.json([]);
  }

  async getEmpruntById(req, res) {
    res.status(404).json({ error: "Emprunt non trouvé" });
  }
}

module.exports = { EmpruntController };
