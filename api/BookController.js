class BookController {
  async createBook(req, res) {
    res
      .status(501)
      .json({ message: "Service livre en cours de développement" });
  }

  async getAllBooks(req, res) {
    res.json([]);
  }

  async getAvailableBooks(req, res) {
    res.json([]);
  }

  async searchBooks(req, res) {
    res.json([]);
  }

  async getBookById(req, res) {
    res.status(404).json({ error: "Livre non trouvé" });
  }

  async updateBook(req, res) {
    res.status(404).json({ error: "Livre non trouvé" });
  }

  async deleteBook(req, res) {
    res.status(404).json({ error: "Livre non trouvé" });
  }
}

module.exports = { BookController };
