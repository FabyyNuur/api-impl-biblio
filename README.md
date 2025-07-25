# API RESTful - Gestion de Bibliothèque

## Description

Cette API RESTful permet de gérer une bibliothèque simple avec la gestion des utilisateurs, des livres et des emprunts. Elle a été développée dans le cadre du TP 1 sur les API REST.

## Fonctionnalités

### Utilisateurs
- ✅ Créer un utilisateur
- ✅ Récupérer un utilisateur par ID
- ✅ Lister tous les utilisateurs
- ✅ Modifier les informations d'un utilisateur
- ✅ Supprimer un utilisateur

### Livres
- ✅ Créer un livre
- ✅ Récupérer un livre par ID
- ✅ Lister tous les livres
- ✅ Modifier les informations d'un livre
- ✅ Supprimer un livre
- ✅ Rechercher des livres
- ✅ Filtrer les livres disponibles

### Emprunts
- ✅ Emprunter un livre
- ✅ Retourner un livre
- ✅ Lister les emprunts d'un utilisateur
- ✅ Lister tous les emprunts en cours
- ✅ Lister les emprunts en retard

## Installation et Configuration

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <votre-repo>
cd api-impl

# Installer les dépendances
npm install

# Compiler le TypeScript
npm run build
```

### Démarrage
```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:3000`

## Documentation

La documentation interactive de l'API est disponible via Swagger UI :
- **URL** : `http://localhost:3000/api-docs`
- **Format** : OpenAPI 3.0

## Structure du Projet

```
src/
├── config/          # Configuration (base de données, Swagger)
├── controllers/     # Contrôleurs REST
├── models/          # Modèles de données TypeScript
├── routes/          # Définition des routes
├── services/        # Logique métier
└── index.ts         # Point d'entrée de l'application

tests/               # Tests unitaires
├── setup.ts         # Configuration des tests
└── *.test.ts        # Fichiers de tests

dist/                # Code compilé (généré)
```

## API Endpoints

### Utilisateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/users` | Créer un utilisateur |
| GET | `/api/users` | Lister tous les utilisateurs |
| GET | `/api/users/:id` | Récupérer un utilisateur |
| PUT | `/api/users/:id` | Modifier un utilisateur |
| DELETE | `/api/users/:id` | Supprimer un utilisateur |

### Livres
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/books` | Créer un livre |
| GET | `/api/books` | Lister tous les livres |
| GET | `/api/books?disponible=true` | Lister les livres disponibles |
| GET | `/api/books?search=query` | Rechercher des livres |
| GET | `/api/books/:id` | Récupérer un livre |
| PUT | `/api/books/:id` | Modifier un livre |
| DELETE | `/api/books/:id` | Supprimer un livre |

### Emprunts
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/emprunts` | Emprunter un livre |
| GET | `/api/emprunts/en-cours` | Lister les emprunts en cours |
| GET | `/api/emprunts/en-retard` | Lister les emprunts en retard |
| GET | `/api/emprunts/:id` | Récupérer un emprunt |
| PATCH | `/api/emprunts/:id/retour` | Retourner un livre |
| GET | `/api/users/:userId/emprunts` | Emprunts d'un utilisateur |

## Exemples d'utilisation

### Créer un utilisateur
```bash
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com"
  }'
```

### Créer un livre
```bash
curl -X POST http://localhost:3000/api/books \\
  -H "Content-Type: application/json" \\
  -d '{
    "titre": "Le Petit Prince",
    "auteur": "Antoine de Saint-Exupéry",
    "isbn": "9782070408504",
    "anneePublication": 1943,
    "genre": "Fiction"
  }'
```

### Emprunter un livre
```bash
curl -X POST http://localhost:3000/api/emprunts \\
  -H "Content-Type: application/json" \\
  -d '{
    "utilisateurId": "user-id-here",
    "livreId": "book-id-here",
    "dureeEmprunt": 14
  }'
```

## Base de Données

L'application utilise SQLite comme base de données avec les tables suivantes :

- **users** : Informations des utilisateurs
- **books** : Catalogue des livres
- **emprunts** : Gestion des emprunts

La base de données est automatiquement créée au démarrage de l'application.

## Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec couverture
npm run test:coverage

# Exécuter les tests en mode watch
npm run test:watch
```

## Codes de Statut HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 204 | Supprimé avec succès |
| 400 | Données invalides |
| 404 | Ressource non trouvée |
| 409 | Conflit (email/ISBN déjà utilisé) |
| 500 | Erreur interne du serveur |

## Gestion des Erreurs

L'API retourne des erreurs structurées :

```json
{
  "error": "Message d'erreur principal",
  "details": "Détails techniques (en mode développement uniquement)"
}
```

## Règles Métier

- Un utilisateur ne peut pas emprunter le même livre deux fois simultanément
- Un livre emprunté n'est plus disponible pour d'autres emprunts
- Les emprunts ont une durée par défaut de 14 jours
- Un utilisateur/livre ne peut pas être supprimé s'il a des emprunts en cours
- Les emprunts en retard sont automatiquement détectés

## Sécurité

- Validation des données d'entrée
- Gestion des erreurs sans exposition des détails techniques en production
- Protection contre les injections SQL via les requêtes préparées

## Améliorations Futures

- [ ] Authentification et autorisation
- [ ] Pagination pour les listes
- [ ] Cache pour améliorer les performances
- [ ] Logs structurés
- [ ] Notifications pour les retards
- [ ] Interface web d'administration

## Support

Pour toute question ou problème, consultez la documentation Swagger ou contactez l'équipe de développement.
