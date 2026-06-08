import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Bibliothèque',
      version: '1.0.0',
      description: 'API RESTful pour la gestion d\'une bibliothèque simple',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    tags: [
      {
        name: 'Système',
        description: 'État et santé de l\'API'
      },
      {
        name: 'Auth',
        description: 'Authentification JWT'
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs'
      },
      {
        name: 'Books',
        description: 'Gestion des livres'
      },
      {
        name: 'Emprunts',
        description: 'Gestion des emprunts'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur'
            },
            nom: {
              type: 'string',
              description: 'Nom de famille'
            },
            prenom: {
              type: 'string',
              description: 'Prénom'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email'
            },
            dateInscription: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'inscription'
            },
            actif: {
              type: 'boolean',
              description: 'Statut actif/inactif'
            },
            role: {
              type: 'string',
              enum: ['BIBLIOTHECAIRE', 'LECTEUR'],
              description: 'Rôle de l\'utilisateur'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', description: 'JWT Bearer token' }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID unique du livre'
            },
            titre: {
              type: 'string',
              description: 'Titre du livre'
            },
            auteur: {
              type: 'string',
              description: 'Auteur du livre'
            },
            isbn: {
              type: 'string',
              description: 'ISBN du livre'
            },
            anneePublication: {
              type: 'integer',
              description: 'Année de publication'
            },
            genre: {
              type: 'string',
              description: 'Genre du livre'
            },
            description: {
              type: 'string',
              description: 'Description du livre'
            },
            disponible: {
              type: 'boolean',
              description: 'Disponibilité du livre'
            },
            dateAjout: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'ajout du livre'
            },
            nombreExemplaires: {
              type: 'integer',
              minimum: 1,
              description: 'Nombre d\'exemplaires disponibles'
            }
          }
        },
        Emprunt: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID unique de l\'emprunt'
            },
            utilisateurId: {
              type: 'string',
              description: 'ID de l\'utilisateur'
            },
            livreId: {
              type: 'string',
              description: 'ID du livre'
            },
            dateEmprunt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de l\'emprunt'
            },
            dateRetourPrevu: {
              type: 'string',
              format: 'date-time',
              description: 'Date de retour prévue'
            },
            dateRetourEffectif: {
              type: 'string',
              format: 'date-time',
              description: 'Date de retour effective'
            },
            statut: {
              type: 'string',
              enum: ['EN_COURS', 'RETOURNE', 'EN_RETARD'],
              description: 'Statut de l\'emprunt'
            }
          }
        },
        EmpruntAvecDetails: {
          allOf: [
            { $ref: '#/components/schemas/Emprunt' },
            {
              type: 'object',
              properties: {
                utilisateur: {
                  type: 'object',
                  properties: {
                    nom: { type: 'string' },
                    prenom: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                  }
                },
                livre: {
                  type: 'object',
                  properties: {
                    titre: { type: 'string' },
                    auteur: { type: 'string' },
                    isbn: { type: 'string' }
                  }
                }
              }
            }
          ]
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur'
            },
            details: {
              type: 'string',
              description: 'Détails de l\'erreur'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token obtenu via POST /api/auth/login'
        }
      }
    },
    paths: {
      '/health': {
        get: {
          tags: ['Système'],
          summary: 'Vérifier l\'état de l\'API',
          responses: {
            200: {
              description: 'API opérationnelle',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Connexion et obtention d\'un JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Connexion réussie',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            401: { description: 'Identifiants incorrects' }
          }
        }
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Profil de l\'utilisateur connecté',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Profil utilisateur',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            401: { description: 'Non authentifié' }
          }
        }
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Lister tous les utilisateurs (bibliothécaire)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des utilisateurs',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Users'],
          summary: 'Créer un utilisateur (bibliothécaire uniquement)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nom', 'prenom', 'email'],
                  properties: {
                    nom: { type: 'string' },
                    prenom: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['LECTEUR', 'BIBLIOTHECAIRE'] }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Utilisateur créé (mot de passe temporaire envoyé par email)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            400: {
              description: 'Données invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: 'Rôle bibliothécaire requis' },
            409: {
              description: 'Email déjà utilisé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Récupérer un utilisateur par ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Utilisateur trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            404: {
              description: 'Utilisateur non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Mettre à jour un utilisateur',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nom: { type: 'string' },
                    prenom: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    actif: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Utilisateur mis à jour',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            404: {
              description: 'Utilisateur non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            409: {
              description: 'Email déjà utilisé par un autre utilisateur',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Users'],
          summary: 'Supprimer un utilisateur',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            204: {
              description: 'Utilisateur supprimé'
            },
            404: {
              description: 'Utilisateur non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            409: {
              description: 'Impossible de supprimer (emprunts en cours)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/books': {
        get: {
          tags: ['Books'],
          summary: 'Lister tous les livres',
          parameters: [
            {
              name: 'disponible',
              in: 'query',
              schema: { type: 'string', enum: ['true'] },
              description: 'Filtrer les livres disponibles (alternative à /api/books/available)'
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Rechercher par titre, auteur, genre ou description (alternative à /api/books/search)'
            }
          ],
          responses: {
            200: {
              description: 'Liste des livres',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Book' }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Books'],
          summary: 'Ajouter un nouveau livre',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titre', 'auteur', 'isbn', 'anneePublication', 'genre', 'nombreExemplaires'],
                  properties: {
                    titre: { type: 'string' },
                    auteur: { type: 'string' },
                    isbn: { type: 'string' },
                    anneePublication: { type: 'integer' },
                    genre: { type: 'string' },
                    nombreExemplaires: { type: 'integer', minimum: 1 },
                    description: { type: 'string', description: 'Description du livre (optionnelle)' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Livre créé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Book' }
                }
              }
            },
            400: {
              description: 'Données invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            409: {
              description: 'ISBN déjà utilisé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/books/{id}': {
        get: {
          tags: ['Books'],
          summary: 'Récupérer un livre par ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Livre trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Book' }
                }
              }
            },
            404: {
              description: 'Livre non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Books'],
          summary: 'Mettre à jour un livre',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    titre: { type: 'string' },
                    auteur: { type: 'string' },
                    isbn: { type: 'string' },
                    anneePublication: { type: 'integer' },
                    genre: { type: 'string' },
                    description: { type: 'string' },
                    disponible: { type: 'boolean' },
                    nombreExemplaires: { type: 'integer', minimum: 1 }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Livre mis à jour',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Book' }
                }
              }
            },
            404: {
              description: 'Livre non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Books'],
          summary: 'Supprimer un livre',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            204: {
              description: 'Livre supprimé'
            },
            409: {
              description: 'Impossible de supprimer (emprunts en cours)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            404: {
              description: 'Livre non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/books/available': {
        get: {
          tags: ['Books'],
          summary: 'Lister les livres disponibles',
          responses: {
            200: {
              description: 'Liste des livres disponibles',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Book' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/books/search': {
        get: {
          tags: ['Books'],
          summary: 'Rechercher des livres',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Terme de recherche'
            }
          ],
          responses: {
            200: {
              description: 'Résultats de recherche',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Book' }
                  }
                }
              }
            },
            400: {
              description: 'Paramètre q manquant',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/emprunts': {
        post: {
          tags: ['Emprunts'],
          summary: 'Emprunter un livre',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['utilisateurId', 'livreId'],
                  properties: {
                    utilisateurId: { type: 'string' },
                    livreId: { type: 'string' },
                    dureeEmprunt: { type: 'integer', description: 'Durée en jours (défaut 14)' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Emprunt créé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Emprunt' }
                }
              }
            },
            400: {
              description: 'Données invalides ou livre non disponible',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/emprunts/{id}/retour': {
        patch: {
          tags: ['Emprunts'],
          summary: 'Retourner un livre',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Livre retourné',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Emprunt' }
                }
              }
            },
            404: {
              description: 'Emprunt non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/users/{userId}/emprunts': {
        get: {
          tags: ['Emprunts'],
          summary: 'Historique des emprunts d\'un utilisateur',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Historique des emprunts',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EmpruntAvecDetails' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/emprunts/en-cours': {
        get: {
          tags: ['Emprunts'],
          summary: 'Lister les emprunts en cours',
          responses: {
            200: {
              description: 'Liste des emprunts en cours',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EmpruntAvecDetails' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/emprunts/en-retard': {
        get: {
          tags: ['Emprunts'],
          summary: 'Lister les emprunts en retard',
          responses: {
            200: {
              description: 'Liste des emprunts en retard',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EmpruntAvecDetails' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/emprunts/historique': {
        get: {
          tags: ['Emprunts'],
          summary: 'Lister l\'historique des emprunts retournés',
          responses: {
            200: {
              description: 'Liste des emprunts retournés',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EmpruntAvecDetails' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/emprunts/{id}': {
        get: {
          tags: ['Emprunts'],
          summary: 'Récupérer un emprunt par ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Emprunt trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Emprunt' }
                }
              }
            },
            404: {
              description: 'Emprunt non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
};

const specs = swaggerJsdoc(options);

export default specs;
