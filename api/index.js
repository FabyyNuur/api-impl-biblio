const express = require("express");
const cors = require("cors");

// Import des controllers JavaScript
const { UserController } = require("./UserController");
const { BookController } = require("./BookController");
const { EmpruntController } = require("./EmpruntController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controllers
const userController = new UserController();
const bookController = new BookController();
const empruntController = new EmpruntController();

// Routes Users
app.post("/api/users", (req, res) => userController.createUser(req, res));
app.get("/api/users", (req, res) => userController.getAllUsers(req, res));
app.get("/api/users/:id", (req, res) => userController.getUserById(req, res));
app.put("/api/users/:id", (req, res) => userController.updateUser(req, res));
app.delete("/api/users/:id", (req, res) => userController.deleteUser(req, res));

// Routes Books
app.post("/api/books", (req, res) => bookController.createBook(req, res));
app.get("/api/books", (req, res) => bookController.getAllBooks(req, res));
app.get("/api/books/available", (req, res) =>
  bookController.getAvailableBooks(req, res)
);
app.get("/api/books/search", (req, res) =>
  bookController.searchBooks(req, res)
);
app.get("/api/books/:id", (req, res) => bookController.getBookById(req, res));
app.put("/api/books/:id", (req, res) => bookController.updateBook(req, res));
app.delete("/api/books/:id", (req, res) => bookController.deleteBook(req, res));

// Routes Emprunts
app.post("/api/emprunts", (req, res) =>
  empruntController.createEmprunt(req, res)
);
app.patch("/api/emprunts/:id/retour", (req, res) =>
  empruntController.returnBook(req, res)
);
app.get("/api/users/:userId/emprunts", (req, res) =>
  empruntController.getEmpruntsByUserId(req, res)
);
app.get("/api/emprunts/en-cours", (req, res) =>
  empruntController.getAllEmpruntsEnCours(req, res)
);
app.get("/api/emprunts/en-retard", (req, res) =>
  empruntController.getEmpruntsEnRetard(req, res)
);
app.get("/api/emprunts/:id", (req, res) =>
  empruntController.getEmpruntById(req, res)
);

// Documentation simplifiée
app.get("/api-docs", (req, res) => {
  res.json({
    message: "API Bibliothèque - Documentation",
    version: "1.0.0",
    status: "Déployée sur Vercel",
    endpoints: {
      users: {
        create: "POST /api/users",
        list: "GET /api/users",
        get: "GET /api/users/:id",
        update: "PUT /api/users/:id",
        delete: "DELETE /api/users/:id",
      },
      books: {
        note: "En cours de développement",
        list: "GET /api/books",
      },
      emprunts: {
        note: "En cours de développement",
        list: "GET /api/emprunts/en-cours",
      },
    },
  });
});

// Route racine - redirige vers documentation
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API Bibliothèque fonctionne",
    timestamp: new Date().toISOString(),
    environment: "serverless",
  });
});

// Gestion des routes non trouvées
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "/api/users",
      "/api/books",
      "/api/emprunts",
      "/api-docs",
      "/health",
    ],
  });
});

module.exports = app;
