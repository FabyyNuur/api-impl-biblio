import swaggerSpecs from '../src/config/swagger';

describe('Documentation Swagger', () => {
  const paths = Object.keys((swaggerSpecs as { paths: Record<string, unknown> }).paths);

  const expectedPaths = [
    '/health',
    '/api/auth/login',
    '/api/auth/me',
    '/api/users',
    '/api/users/{id}',
    '/api/books',
    '/api/books/{id}',
    '/api/books/available',
    '/api/books/search',
    '/api/emprunts',
    '/api/emprunts/{id}',
    '/api/emprunts/{id}/retour',
    '/api/emprunts/en-cours',
    '/api/emprunts/en-retard',
    '/api/emprunts/historique',
    '/api/users/{userId}/emprunts'
  ];

  it.each(expectedPaths)('devrait documenter le endpoint %s', (path) => {
    expect(paths).toContain(path);
  });

  it('devrait définir les schémas principaux', () => {
    const schemas = (swaggerSpecs as { components: { schemas: Record<string, unknown> } }).components.schemas;
    expect(schemas).toHaveProperty('User');
    expect(schemas).toHaveProperty('Book');
    expect(schemas).toHaveProperty('Emprunt');
    expect(schemas).toHaveProperty('EmpruntAvecDetails');
    expect(schemas).toHaveProperty('Error');
  });
});
