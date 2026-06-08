import request from 'supertest';
import app from '../src/index';
import { USER_ROLES } from '../src/constants/roles';
import { createTestBibliothecaire, getAuthToken } from './helpers';

const PASSWORD = 'secret123';

async function registerUser(email: string, overrides: Partial<{ nom: string; prenom: string }> = {}) {
  return request(app)
    .post('/api/users')
    .send({
      nom: overrides.nom ?? 'Test',
      prenom: overrides.prenom ?? 'User',
      email,
      password: PASSWORD
    });
}

describe('API REST', () => {
  describe('Health', () => {
    it('GET /health devrait retourner OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });

  describe('Utilisateurs', () => {
    it('POST /api/users - créer un utilisateur', async () => {
      const res = await registerUser('marie@test.com', { nom: 'Durand', prenom: 'Marie' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('marie@test.com');
      expect(res.body.role).toBe(USER_ROLES.LECTEUR);
    });

    it('POST /api/users - rejette les champs manquants', async () => {
      const res = await request(app).post('/api/users').send({ nom: 'Test' });
      expect(res.status).toBe(400);
    });

    it('POST /api/users - rejette un email dupliqué', async () => {
      await registerUser('dup@test.com', { nom: 'A', prenom: 'B' });

      const res = await registerUser('dup@test.com', { nom: 'C', prenom: 'D' });
      expect(res.status).toBe(409);
    });

    it('GET /api/users/:id - récupérer son propre profil', async () => {
      const created = await registerUser('get@test.com');
      const token = (await request(app)
        .post('/api/auth/login')
        .send({ email: 'get@test.com', password: PASSWORD })).body.token;

      const res = await request(app)
        .get(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('get@test.com');
    });

    it('GET /api/users/:id - 404 si inexistant', async () => {
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);

      const res = await request(app)
        .get('/api/users/inexistant')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('PUT /api/users/:id - mettre à jour son profil', async () => {
      const created = await registerUser('update@test.com', { nom: 'Old', prenom: 'Name' });
      const token = (await request(app)
        .post('/api/auth/login')
        .send({ email: 'update@test.com', password: PASSWORD })).body.token;

      const res = await request(app)
        .put(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nom: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.nom).toBe('New');
    });

    it('DELETE /api/users/:id - supprimer (bibliothécaire)', async () => {
      const created = await registerUser('del@test.com', { nom: 'Del', prenom: 'User' });
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);

      const res = await request(app)
        .delete(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it('DELETE /api/users/:id - refuse la suppression de son propre compte', async () => {
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);

      const res = await request(app)
        .delete(`/api/users/${biblio.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('propre compte');
    });

    it('PUT /api/users/:id - refuse la désactivation de son propre compte', async () => {
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);

      const res = await request(app)
        .put(`/api/users/${biblio.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ actif: false });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('propre compte');
    });
  });

  describe('Livres', () => {
    const bookPayload = {
      titre: 'Dune',
      auteur: 'Frank Herbert',
      isbn: '978-dune',
      anneePublication: 1965,
      genre: 'SF',
      nombreExemplaires: 2
    };

    it('POST /api/books - créer un livre (bibliothécaire)', async () => {
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);

      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send(bookPayload);

      expect(res.status).toBe(201);
      expect(res.body.titre).toBe('Dune');
    });

    it('GET /api/books/available - livres disponibles (public)', async () => {
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);
      await request(app).post('/api/books').set('Authorization', `Bearer ${token}`).send(bookPayload);

      const res = await request(app).get('/api/books/available');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/books/search?q= - recherche (public)', async () => {
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);
      await request(app).post('/api/books').set('Authorization', `Bearer ${token}`).send(bookPayload);

      const res = await request(app).get('/api/books/search').query({ q: 'Dune' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('GET /api/books/search - 400 sans paramètre q', async () => {
      const res = await request(app).get('/api/books/search');
      expect(res.status).toBe(400);
    });

    it('DELETE /api/books/:id - supprimer (bibliothécaire)', async () => {
      const biblio = await createTestBibliothecaire();
      const token = getAuthToken(biblio);
      const created = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...bookPayload, isbn: '978-del' });

      const res = await request(app)
        .delete(`/api/books/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });

  describe('Emprunts', () => {
    async function setupEmprunt() {
      const userRes = await registerUser(`empr-${Date.now()}@test.com`, { nom: 'Empr', prenom: 'User' });
      const userToken = (await request(app)
        .post('/api/auth/login')
        .send({ email: userRes.body.email, password: PASSWORD })).body.token;

      const biblio = await createTestBibliothecaire();
      const biblioToken = getAuthToken(biblio);
      const book = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${biblioToken}`)
        .send({
          titre: 'Emprunt Test',
          auteur: 'Auteur',
          isbn: `978-${Date.now()}`,
          anneePublication: 2020,
          genre: 'Test',
          nombreExemplaires: 1
        });

      return { user: userRes.body, userToken, book: book.body, biblioToken };
    }

    it('POST /api/emprunts - emprunter un livre', async () => {
      const { userToken, book } = await setupEmprunt();
      const res = await request(app)
        .post('/api/emprunts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ livreId: book.id });

      expect(res.status).toBe(201);
      expect(res.body.statut).toBe('EN_COURS');
    });

    it('POST /api/emprunts - refuse un emprunt pour un bibliothécaire', async () => {
      const { book, biblioToken } = await setupEmprunt();
      const autreBiblio = await createTestBibliothecaire();

      const res = await request(app)
        .post('/api/emprunts')
        .set('Authorization', `Bearer ${biblioToken}`)
        .send({ livreId: book.id, utilisateurId: autreBiblio.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('lecteurs');
    });

    it('PATCH /api/emprunts/:id/retour - retourner un livre (bibliothécaire)', async () => {
      const { userToken, book, biblioToken } = await setupEmprunt();
      const emprunt = await request(app)
        .post('/api/emprunts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ livreId: book.id });

      const res = await request(app)
        .patch(`/api/emprunts/${emprunt.body.id}/retour`)
        .set('Authorization', `Bearer ${biblioToken}`);

      expect(res.status).toBe(200);
      expect(res.body.statut).toBe('RETOURNE');
    });

    it('GET /api/emprunts/en-cours (bibliothécaire)', async () => {
      const { userToken, book, biblioToken } = await setupEmprunt();
      await request(app)
        .post('/api/emprunts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ livreId: book.id });

      const res = await request(app)
        .get('/api/emprunts/en-cours')
        .set('Authorization', `Bearer ${biblioToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('GET /api/users/:userId/emprunts', async () => {
      const { user, userToken, book } = await setupEmprunt();
      await request(app)
        .post('/api/emprunts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ livreId: book.id });

      const res = await request(app)
        .get(`/api/users/${user.id}/emprunts`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('GET /api/emprunts/historique (bibliothécaire)', async () => {
      const { userToken, book, biblioToken } = await setupEmprunt();
      const emprunt = await request(app)
        .post('/api/emprunts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ livreId: book.id });

      await request(app)
        .patch(`/api/emprunts/${emprunt.body.id}/retour`)
        .set('Authorization', `Bearer ${biblioToken}`);

      const res = await request(app)
        .get('/api/emprunts/historique')
        .set('Authorization', `Bearer ${biblioToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('Routes inexistantes', () => {
    it('devrait retourner 404', async () => {
      const res = await request(app).get('/api/inexistant');
      expect(res.status).toBe(404);
    });
  });
});
