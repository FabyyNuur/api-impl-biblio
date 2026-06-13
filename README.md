# API de Gestion de Bibliothèque

Une API REST complète pour la gestion d'une bibliothèque développée avec Node.js, TypeScript, Express et SQLite.

## Objectif

Cette API permet de gérer l'ensemble des opérations d'une bibliothèque : gestion des utilisateurs, catalogue de livres, et système d'emprunts avec suivi complet.

## ⚡ Fonctionnalités Principales

### Gestion des Utilisateurs

- Gestion des profils utilisateurs (création par le bibliothécaire)
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
cd api-impl-biblio

# Installer les dépendances
npm install

# (Optionnel) Peupler le catalogue avec ~100 livres de démonstration
npm run seed:books

# Démarrer en mode développement
npm run dev
```

### Premier accès

Une fois démarré, l'API est accessible sur :

- **URL principale :** http://localhost:3000 (redirige vers la documentation)
- **Documentation Swagger :** http://localhost:3000/api-docs
- **Health Check :** http://localhost:3000/health

Au premier démarrage, un compte **bibliothécaire** par défaut est créé automatiquement s'il n'existe pas encore :

| Champ        | Valeur par défaut  |
| ------------ | ------------------ |
| Email        | `admin@biblio.com` |
| Mot de passe | `secret123`        |

Ces valeurs sont configurables via les variables d'environnement `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, etc.

### Mot de passe initial des utilisateurs

Lorsqu'un **bibliothécaire** crée un compte sans mot de passe, l'API assigne un mot de passe par défaut (`ChangeMe123` ou variable `DEFAULT_USER_PASSWORD`) et envoie un **email** à l'utilisateur avec ses identifiants. L'utilisateur doit le changer à sa **première connexion**.

| Variable                | Description                                                       | Défaut                                |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| `DEFAULT_USER_PASSWORD` | Mot de passe initial pour les comptes créés par un bibliothécaire | `ChangeMe123`                         |
| `SMTP_HOST`             | Serveur SMTP                                                      | —                                     |
| `SMTP_PORT`             | Port SMTP                                                         | `587`                                 |
| `SMTP_SECURE`           | Connexion TLS directe (`true`/`false`)                            | `false`                               |
| `SMTP_USER`             | Identifiant SMTP                                                  | —                                     |
| `SMTP_PASS`             | Mot de passe SMTP                                                 | —                                     |
| `MAIL_FROM`             | Expéditeur des emails                                             | `Nuur Library <noreply@biblio.local>` |
| `FRONTEND_URL`          | Lien de connexion dans l'email                                    | `http://localhost:3001`               |

Copiez `.env.example` vers `.env` et renseignez vos paramètres SMTP. Sans SMTP configuré, l'email est simulé dans les logs du serveur (mode développement).

- Création de compte **réservée au bibliothécaire** (`POST /api/users`, JWT biblio requis, sans `password` dans le corps) : mot de passe temporaire généré, `mustChangePassword: true`, email envoyé, réponse `{ ..., emailSent: true|false }`.
- L'inscription publique n'est plus disponible (ni via le frontend `/register`, ni via l'API).
- Endpoint de changement : `POST /api/auth/change-password` avec `{ currentPassword, newPassword }`.

### Données de démonstration

Deux scripts permettent de préparer l'environnement local :

```bash
# Créer le compte bibliothécaire par défaut (si absent)
npm run seed

# Insérer ~100 livres variés dans le catalogue (classiques, SF, polar, BD…)
npm run seed:books

# Recréer les livres déjà présents (même ISBN)
npm run seed:books -- --force
```

Les livres sont définis dans `src/data/books.seed.ts`. Le seed ignore les ISBN déjà en base et est désactivé en environnement `test` ou sur Vercel.

## Endpoints Principaux

### Authentification

- `POST /api/auth/login` - Connexion (email + mot de passe)
- `GET /api/auth/me` - Profil de l'utilisateur connecté (JWT requis)
- `POST /api/auth/change-password` - Changer son mot de passe (JWT requis)

Les rôles **BIBLIOTHECAIRE** et **LECTEUR** contrôlent l'accès aux opérations sensibles (gestion du catalogue, utilisateurs, retours d'emprunts, etc.).

### Utilisateurs

- `POST /api/users` - Créer un utilisateur (bibliothécaire uniquement)
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
- Flag `mustChangePassword` (changement obligatoire à la première connexion)

### Table `books`

- Métadonnées (titre, auteur, ISBN, année, genre)
- Description détaillée
- Nombre d'exemplaires
- Statut de disponibilité (dérivé du stock)
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
  "actif": "boolean",
  "role": "BIBLIOTHECAIRE|LECTEUR",
  "mustChangePassword": "boolean"
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
  "dateAjout": "datetime",
  "nombreExemplaires": "number"
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
- `npm start` - Démarrage en production (nécessite `npm run build` au préalable)
- `npm test` - Exécution des tests
- `npm run test:watch` - Tests en mode watch
- `npm run test:coverage` - Rapport de couverture
- `npm run seed` - Créer le compte bibliothécaire par défaut
- `npm run seed:books` - Peupler le catalogue avec ~100 livres de démonstration

## Tests Karate (API REST)

Des tests d'intégration Karate sont disponibles dans le dossier `karate-tests/`.

**Prérequis :** Java 17+, Maven 3.8+

Depuis la racine du dépôt, `mvn test` fonctionne maintenant via le POM agrégateur. Vous pouvez aussi lancer les tests depuis `karate-tests/` si vous préférez.

```bash
# Démarrer l'API
npm run dev

# Lancer les tests Karate
./scripts/run-karate.sh
# ou
cd karate-tests && mvn test

# ou depuis la racine du dépôt
mvn test
```

Rapport HTML : `karate-tests/target/karate-reports/karate-summary.html`

Voir [karate-tests/README.md](karate-tests/README.md) pour plus de détails.

## Architecture

```
src/
├── config/          # Configuration (DB, Swagger, seed)
├── controllers/     # Contrôleurs HTTP
├── data/            # Jeux de données (books.seed.ts)
├── middleware/      # Authentification JWT et rôles
├── models/          # Interfaces TypeScript
├── routes/          # Définition des routes
├── scripts/         # Scripts CLI (seed, seed-books)
├── services/        # Logique métier
└── index.ts         # Point d'entrée

karate-tests/        # Tests d'intégration Karate
tests/               # Tests unitaires Jest
```

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

---

_Développé avec ❤️ par Faabynuur pour la gestion moderne de bibliothèques_
