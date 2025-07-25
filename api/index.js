const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

// Importation directe sans passer par les fichiers compilés
const app = express();

// Configuration basique pour tester
app.use(cors());
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "API Bibliothèque déployée sur Vercel!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is running on Vercel",
  });
});

module.exports = app;
