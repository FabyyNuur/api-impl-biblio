# Tests API Karate

Tests d'intégration REST pour l'API bibliothèque, écrits en [Karate](https://github.com/karatelabs/karate).

## Prérequis

- Java 17+
- Maven 3.8+
- API démarrée sur `http://localhost:3000`

## Lancement

```bash
# Terminal 1 — API
cd ..
npm run dev

# Terminal 2 — Karate
mvn test

# Ou via le script (vérifie /health avant)
../scripts/run-karate.sh
```

## Rapport

Après exécution : `target/karate-reports/karate-summary.html`

## Compte de test

- Email : `admin@biblio.com`
- Mot de passe : `secret123`

## Structure

```
src/test/java/
├── karate-config.js
└── com/biblio/karate/
    ├── KarateRunner.java
    ├── common/          # features réutilisables (non exécutées seules)
    ├── health.feature
    ├── auth.feature
    ├── users.feature
    ├── books.feature
    ├── emprunts.feature
    └── rbac.feature
```
