import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Bibliothèque',
      version: '1.0.0',
      description: 'API RESTful pour la gestion d\'une bibliothèque simple',
      contact: {
        name: 'Support API',
        email: 'support@bibliotheque.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    tags: [
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
            }
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
            disponible: {
              type: 'boolean',
              description: 'Disponibilité du livre'
            },
            dateAjout: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'ajout du livre'
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
      }
    }
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts']
};

const specs = swaggerJsdoc(options);

export default specs;
