const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const sqlite3 = require("sqlite3");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la base de données
class Database {
  constructor(dbPath = ":memory:") {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(
          "Erreur lors de l'ouverture de la base de données:",
          err.message
        );
      } else {
        console.log("Connexion à la base de données SQLite réussie");
        this.initTables();
      }
    });
  }

  initTables() {
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
        isbn TEXT UNIQUE,
        datePublication DATE,
        genre TEXT,
        disponible BOOLEAN DEFAULT 1,
        nombreExemplaires INTEGER DEFAULT 1,
        dateAjout DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des emprunts
    this.db.run(`
      CREATE TABLE IF NOT EXISTS emprunts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        bookId TEXT NOT NULL,
        dateEmprunt DATETIME DEFAULT CURRENT_TIMESTAMP,
        dateRetourPrevu DATETIME NOT NULL,
        dateRetourEffectif DATETIME,
        statut TEXT DEFAULT 'en_cours',
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (bookId) REFERENCES books (id)
      )
    `);

    // Insérer des données de test
    this.insertSampleData();
  }

  insertSampleData() {
    // Utilisateurs de test
    const users = [
      {
        id: "user1",
        nom: "Dupont",
        prenom: "Jean",
        email: "jean.dupont@email.com",
      },
      {
        id: "user2",
        nom: "Martin",
        prenom: "Marie",
        email: "marie.martin@email.com",
      },
    ];

    // Livres de test
    const books = [
      {
        id: "book1",
        titre: "Le Petit Prince",
        auteur: "Antoine de Saint-Exupéry",
        isbn: "9782070408504",
        genre: "Littérature",
      },
      {
        id: "book2",
        titre: "1984",
        auteur: "George Orwell",
        isbn: "9782070368228",
        genre: "Science-fiction",
      },
    ];

    users.forEach((user) => {
      this.db.run(
        "INSERT OR IGNORE INTO users (id, nom, prenom, email) VALUES (?, ?, ?, ?)",
        [user.id, user.nom, user.prenom, user.email]
      );
    });

    books.forEach((book) => {
      this.db.run(
        "INSERT OR IGNORE INTO books (id, titre, auteur, isbn, genre) VALUES (?, ?, ?, ?, ?)",
        [book.id, book.titre, book.auteur, book.isbn, book.genre]
      );
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// Initialiser la base de données
const database = new Database();

// Configuration Swagger complète
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Bibliothèque",
    version: "1.0.0",
    description: "API RESTful pour la gestion d'une bibliothèque",
  },
  servers: [
    {
      url: "https://api-impl-biblio.vercel.app",
      description: "Serveur de production Vercel",
    },
  ],
  tags: [
    { name: "Users", description: "Gestion des utilisateurs" },
    { name: "Books", description: "Gestion des livres" },
    { name: "Emprunts", description: "Gestion des emprunts" },
  ],
  paths: {
    "/": {
      get: {
        summary: "Page d'accueil - Redirection vers documentation",
        responses: {
          302: { description: "Redirection vers /api-docs" },
        },
      },
    },
    "/health": {
      get: {
        summary: "Vérification de santé de l'API",
        responses: {
          200: {
            description: "API fonctionnelle",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    timestamp: {
                      type: "string",
                      example: "2025-07-25T15:30:00.000Z",
                    },
                    message: {
                      type: "string",
                      example: "API Bibliothèque opérationnelle",
                    },
                    version: { type: "string", example: "1.0.0" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Récupérer tous les utilisateurs",
        responses: {
          200: {
            description: "Liste des utilisateurs",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Créer un nouvel utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nom: { type: "string" },
                  prenom: { type: "string" },
                  email: { type: "string" },
                },
                required: ["nom", "prenom", "email"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Utilisateur créé",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/api/books": {
      get: {
        tags: ["Books"],
        summary: "Récupérer tous les livres",
        responses: {
          200: {
            description: "Liste des livres",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Book",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Books"],
        summary: "Ajouter un nouveau livre",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  titre: { type: "string" },
                  auteur: { type: "string" },
                  isbn: { type: "string" },
                  genre: { type: "string" },
                },
                required: ["titre", "auteur"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Livre ajouté",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Book" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          nom: { type: "string" },
          prenom: { type: "string" },
          email: { type: "string" },
          dateInscription: { type: "string" },
          actif: { type: "boolean" },
        },
      },
      Book: {
        type: "object",
        properties: {
          id: { type: "string" },
          titre: { type: "string" },
          auteur: { type: "string" },
          isbn: { type: "string" },
          genre: { type: "string" },
          disponible: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          timestamp: { type: "string" },
        },
      },
    },
  },
};

// Route de base - redirige vers la documentation (page par défaut)
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Documentation Swagger - Page par défaut
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    customSiteTitle: "API Bibliothèque - Documentation",
    swaggerOptions: {
      docExpansion: "list",
      filter: true,
      showRequestHeaders: false,
    },
  })
);

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "API Bibliothèque opérationnelle sur Vercel",
    version: "1.0.0",
    uptime: process.uptime(),
    environment: "production",
  });
});

// Routes API - Utilisateurs
app.get("/api/users", async (req, res) => {
  try {
    const users = await database.all("SELECT * FROM users WHERE actif = 1");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des utilisateurs",
        message: error.message,
      });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;
    if (!nom || !prenom || !email) {
      return res
        .status(400)
        .json({ error: "Nom, prénom et email sont requis" });
    }

    const id = uuidv4();
    await database.run(
      "INSERT INTO users (id, nom, prenom, email) VALUES (?, ?, ?, ?)",
      [id, nom, prenom, email]
    );

    const user = await database.get("SELECT * FROM users WHERE id = ?", [id]);
    res.status(201).json(user);
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      res
        .status(409)
        .json({ error: "Un utilisateur avec cet email existe déjà" });
    } else {
      res
        .status(500)
        .json({
          error: "Erreur lors de la création de l'utilisateur",
          message: error.message,
        });
    }
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await database.get(
      "SELECT * FROM users WHERE id = ? AND actif = 1",
      [req.params.id]
    );
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération de l'utilisateur",
        message: error.message,
      });
  }
});

// Routes API - Livres
app.get("/api/books", async (req, res) => {
  try {
    const books = await database.all("SELECT * FROM books");
    res.json(books);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des livres",
        message: error.message,
      });
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const { titre, auteur, isbn, genre } = req.body;
    if (!titre || !auteur) {
      return res.status(400).json({ error: "Titre et auteur sont requis" });
    }

    const id = uuidv4();
    await database.run(
      "INSERT INTO books (id, titre, auteur, isbn, genre) VALUES (?, ?, ?, ?, ?)",
      [id, titre, auteur, isbn, genre]
    );

    const book = await database.get("SELECT * FROM books WHERE id = ?", [id]);
    res.status(201).json(book);
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(409).json({ error: "Un livre avec cet ISBN existe déjà" });
    } else {
      res
        .status(500)
        .json({
          error: "Erreur lors de la création du livre",
          message: error.message,
        });
    }
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await database.get("SELECT * FROM books WHERE id = ?", [
      req.params.id,
    ]);
    if (!book) {
      return res.status(404).json({ error: "Livre non trouvé" });
    }
    res.json(book);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération du livre",
        message: error.message,
      });
  }
});

// Routes API - Emprunts
app.get("/api/emprunts", async (req, res) => {
  try {
    const emprunts = await database.all(`
      SELECT e.*, u.nom, u.prenom, b.titre, b.auteur 
      FROM emprunts e
      JOIN users u ON e.userId = u.id
      JOIN books b ON e.bookId = b.id
      ORDER BY e.dateEmprunt DESC
    `);
    res.json(emprunts);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des emprunts",
        message: error.message,
      });
  }
});

app.post("/api/emprunts", async (req, res) => {
  try {
    const { userId, bookId, dateRetourPrevu } = req.body;
    if (!userId || !bookId || !dateRetourPrevu) {
      return res
        .status(400)
        .json({ error: "userId, bookId et dateRetourPrevu sont requis" });
    }

    // Vérifier que l'utilisateur existe
    const user = await database.get(
      "SELECT * FROM users WHERE id = ? AND actif = 1",
      [userId]
    );
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Vérifier que le livre existe et est disponible
    const book = await database.get(
      "SELECT * FROM books WHERE id = ? AND disponible = 1",
      [bookId]
    );
    if (!book) {
      return res
        .status(404)
        .json({ error: "Livre non trouvé ou non disponible" });
    }

    const id = uuidv4();
    await database.run(
      "INSERT INTO emprunts (id, userId, bookId, dateRetourPrevu) VALUES (?, ?, ?, ?)",
      [id, userId, bookId, dateRetourPrevu]
    );

    // Marquer le livre comme non disponible
    await database.run("UPDATE books SET disponible = 0 WHERE id = ?", [
      bookId,
    ]);

    const emprunt = await database.get(
      `
      SELECT e.*, u.nom, u.prenom, b.titre, b.auteur 
      FROM emprunts e
      JOIN users u ON e.userId = u.id
      JOIN books b ON e.bookId = b.id
      WHERE e.id = ?
    `,
      [id]
    );

    res.status(201).json(emprunt);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la création de l'emprunt",
        message: error.message,
      });
  }
});

// Route d'information générale
app.get("/api", (req, res) => {
  res.json({
    message: "Bienvenue dans l'API de gestion de bibliothèque",
    version: "1.0.0",
    documentation: "/api-docs",
    status: "operational",
    features: [
      "Gestion des livres",
      "Gestion des utilisateurs",
      "Gestion des emprunts",
      "Documentation Swagger intégrée",
    ],
    endpoints: {
      health: "/health",
      documentation: "/api-docs",
      api_info: "/api",
      users: "/api/users",
      books: "/api/books",
      emprunts: "/api/emprunts",
    },
    deployed_on: "Vercel",
    last_updated: "2025-07-25",
  });
});

// Route de statut détaillé
app.get("/status", (req, res) => {
  res.json({
    api: "Bibliothèque Management System",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    memory_usage: process.memoryUsage(),
    node_version: process.version,
    platform: process.platform,
    environment: "vercel_production",
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    error: "Erreur interne du serveur",
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
});

// Gestion des routes non trouvées (404)
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
    message:
      "Cette route n'existe pas. Consultez /api-docs pour voir la documentation complète.",
    available_routes: [
      "GET /",
      "GET /api-docs",
      "GET /health",
      "GET /api",
      "GET /status",
      "GET /api/users",
      "POST /api/users",
      "GET /api/books",
      "POST /api/books",
      "GET /api/emprunts",
      "POST /api/emprunts",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Export pour Vercel
module.exports = app;
