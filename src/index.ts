import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';
import routes from './routes';
import { database } from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de l'API
app.use('/api', routes);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Bibliothèque - Documentation'
}));

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue dans l\'API de gestion de bibliothèque',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      users: '/api/users',
      books: '/api/books',
      emprunts: '/api/emprunts'
    }
  });
});

// Route pour vérifier la santé de l'API
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware de gestion d'erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Health check sur http://localhost:${PORT}/health`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\\n🛑 Arrêt du serveur...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Arrêt du serveur...');
  database.close();
  process.exit(0);
});

export default app;
