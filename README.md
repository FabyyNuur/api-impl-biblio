# API de Gestion de Bibliothèque

Une API REST complète pour la gestion d'une bibliothèque développée avec Node.js, TypeScript, Express et SQLite.

## Objectif

Cette API permet de gérer l'ensemble des opérations d'une bibliothèque : gestion des utilisateurs, catalogue de livres, et système d'emprunts avec suivi complet.

## ⚡ Fonctionnalités Principales

### Gestion des Utilisateurs

- Inscription et gestion des profils utilisateurs
- Activation/désactivation des comptes
- Consultation des informations personnelles

### Gestion du Catalogue de Livres

- Ajout, modification et suppression de livres
- Recherche avancée (titre, auteur, genre, description, ISBN)
- Consultation des livres disponibles
- Gestion des descriptions détaillées

### Système d'Emprunts

- Emprunt de livres avec durée personnalisable
- Retour de livres avec suivi automatique
- Historique complet des emprunts par utilisateur
- Gestion des emprunts en retard
- Vérification de disponibilité automatique

## Technologies Utilisées

- **Backend :** Node.js + TypeScript
- **Framework :** Express.js
- **Base de données :** SQLite
- **Documentation :** Swagger/OpenAPI
- **Tests :** Jest
- **Outils :** Nodemon, UUID

## Démarrage Rapide

### Prérequis

- Node.js (v16 ou plus)
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd api-impl

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Premier accès

Une fois démarré, l'API est accessible sur :

- **URL principale :** http://localhost:3000 (redirige vers la documentation)
- **Documentation Swagger :** http://localhost:3000/api-docs
- **Health Check :** http://localhost:3000/health

## Endpoints Principaux

### Utilisateurs

- `POST /api/users` - Créer un utilisateur
- `GET /api/users` - Lister tous les utilisateurs
- `GET /api/users/{id}` - Consulter un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur

### Livres

- `POST /api/books` - Ajouter un livre
- `GET /api/books` - Lister tous les livres
- `GET /api/books/available` - Livres disponibles
- `GET /api/books/{id}` - Consulter un livre
- `PUT /api/books/{id}` - Modifier un livre
- `DELETE /api/books/{id}` - Supprimer un livre
- `GET /api/books/search?q={query}` - Rechercher des livres

### Emprunts

- `POST /api/emprunts` - Emprunter un livre
- `PATCH /api/emprunts/{id}/retour` - Retourner un livre
- `GET /api/users/{userId}/emprunts` - Historique d'un utilisateur
- `GET /api/emprunts/en-cours` - Emprunts actuels
- `GET /api/emprunts/en-retard` - Emprunts en retard
- `GET /api/emprunts/{id}` - Détails d'un emprunt

## Structure de la Base de Données

### Table `users`

- Informations personnelles (nom, prénom, email)
- Statut d'activation
- Date d'inscription

### Table `books`

- Métadonnées (titre, auteur, ISBN, année, genre)
- Description détaillée
- Statut de disponibilité
- Date d'ajout

### Table `emprunts`

- Liens utilisateur-livre
- Dates d'emprunt et de retour (prévue/effective)
- Statut (EN_COURS, RETOURNE, EN_RETARD)
- Historique complet conservé

## Modèles de Données

### Utilisateur

```json
{
  "id": "uuid",
  "nom": "string",
  "prenom": "string", 
  "email": "string",
  "dateInscription": "datetime",
  "actif": "boolean"
}
```

### Livre

```json
{
  "id": "uuid",
  "titre": "string",
  "auteur": "string",
  "isbn": "string",
  "anneePublication": "number",
  "genre": "string",
  "description": "string",
  "disponible": "boolean",
  "dateAjout": "datetime"
}
```

### Emprunt

```json
{
  "id": "uuid",
  "utilisateurId": "uuid",
  "livreId": "uuid",
  "dateEmprunt": "datetime",
  "dateRetourPrevu": "datetime",
  "dateRetourEffectif": "datetime?",
  "statut": "EN_COURS|RETOURNE|EN_RETARD"
}
```

## Règles Métier

### Emprunts

- Un utilisateur ne peut pas emprunter le même livre deux fois simultanément
- Les livres indisponibles ne peuvent pas être empruntés
- Les utilisateurs inactifs ne peuvent pas emprunter
- Durée d'emprunt par défaut : 14 jours
- Les emprunts en cours bloquent la suppression des livres

### Utilisateurs

- Email unique obligatoire
- Suppression impossible s'il y a des emprunts en cours

## Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

## Scripts Disponibles

- `npm run dev` - Développement avec auto-reload
- `npm run build` - Construction pour production
- `npm start` - Démarrage en production
- `npm test` - Exécution des tests
- `npm run lint` - Vérification du code

## Architecture

```
src/
├── config/          # Configuration (DB, Swagger)
├── controllers/     # Contrôleurs HTTP
├── models/          # Interfaces TypeScript
├── routes/          # Définition des routes
├── services/        # Logique métier
└── index.ts         # Point d'entrée

tests/               # Tests unitaires
```

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

---

*Développé avec ❤️ par Faabynuur pour la gestion moderne de bibliothèques*
