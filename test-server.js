const app = require("./api/index.js");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur http://localhost:${PORT}`);
  console.log(
    `📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`
  );
  console.log(`🔍 Health check sur http://localhost:${PORT}/health`);
});
