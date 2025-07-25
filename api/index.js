const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration Swagger simplifiée
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
      description: "Serveur de production",
    },
  ],
  paths: {
    "/": {
      get: {
        summary: "Redirection vers documentation",
        responses: {
          302: { description: "Redirection vers /api-docs" },
        },
      },
    },
    "/health": {
      get: {
        summary: "Vérification de santé",
        responses: {
          200: {
            description: "API fonctionnelle",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    timestamp: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// Route de base - redirige vers la documentation
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Documentation Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "API Bibliothèque - Documentation",
  })
);

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "API Bibliothèque déployée sur Vercel",
    version: "1.0.0",
  });
});

// Route d'information
app.get("/api", (req, res) => {
  res.json({
    message: "Bienvenue dans l'API de gestion de bibliothèque",
    version: "1.0.0",
    documentation: "/api-docs",
    status: "operational",
    endpoints: {
      health: "/health",
      documentation: "/api-docs",
    },
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur:", err.message);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Routes non trouvées
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
    message:
      "Cette route n'existe pas. Consultez /api-docs pour voir les routes disponibles.",
  });
});

module.exports = app;
