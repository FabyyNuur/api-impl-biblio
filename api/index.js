const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    "/api": {
      get: {
        summary: "Informations sur l'API",
        responses: {
          200: {
            description: "Informations générales de l'API",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    version: { type: "string" },
                    documentation: { type: "string" },
                    status: { type: "string" },
                    endpoints: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
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
    ],
    timestamp: new Date().toISOString(),
  });
});

// Export pour Vercel
module.exports = app;
