/// <reference path="./types/express.d.ts" />
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';
import routes from './routes';
import { database } from './config/database';
import { seedDefaultBibliothecaire } from './config/seed';
import { isSmtpConfigured } from './config/mail';

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

// Route de base - redirige vers la documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
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

// Démarrage du serveur (sauf en mode test)
if (process.env.NODE_ENV !== 'test') {
  database
    .ready()
    .then(() => seedDefaultBibliothecaire())
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        console.log(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
        console.log(`🔍 Health check sur http://localhost:${PORT}/health`);
        if (isSmtpConfigured()) {
          console.log('📧 SMTP configuré — les emails seront envoyés');
        } else {
          console.warn('📧 SMTP non configuré — les emails ne seront pas envoyés (voir .env)');
        }
      });
    })
    .catch((error) => {
      console.error('Erreur au démarrage :', error);
      process.exit(1);
    });
}

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
